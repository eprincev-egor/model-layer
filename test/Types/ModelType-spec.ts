
import {Model, Types} from "../../lib/index";
import assert from "assert";
import {invalidValuesAsString, eol} from "../../lib/utils";
import { ISimpleObject } from "../../lib/Model";
import { types } from "util";

describe("ModelType", () => {
    
    it("child model", () => {
        class UserModel extends Model<UserModel> {
            structure() {
                return {
                    name: Types.String({
                        trim: true,
                        emptyAsNull: true,
                        required: true
                    }),
                    phone: Types.String({
                        validate: /^\+7 \(\d\d\d\) \d\d\d-\d\d-\d\d$/
                    }),
                    email: Types.String({
                        required: true,
                        validate: /^[\w.-]+@[\w.-]+\.\w+$/i
                    }),
                    age: Types.Number({
                        required: true,
                        validate: (age) =>
                            age > 0
                    })
                };
            }
        }

        class RegistrationModel extends Model<RegistrationModel> {
            structure() {
                return {
                    user: Types.Model({
                        Model: UserModel,
                        required: true
                    }),
                    date: Types.Date({
                        required: true
                    })
                };
            }
        }

        const AnyRegistrationModel = RegistrationModel as any;

        assert.throws(
            () => {
                const regModel = new RegistrationModel({
                    date: Date.now()
                });
            }, 
            (err) =>
                err.message === "required user"
        );

        assert.throws(
            () => {
                const regModel = new RegistrationModel({
                    date: Date.now(),
                    user: null
                });
            }, 
            (err) =>
                err.message === "required user"
        );

        assert.throws(
            () => {
                const regModel = new AnyRegistrationModel({
                    date: Date.now(),
                    user: []
                });
            }, 
            (err) =>
                err.message === "invalid UserModel for user: []"
        );

        assert.throws(
            () => {
                const regModel = new AnyRegistrationModel({
                    date: Date.now(),
                    user: false
                });
            }, 
            (err) =>
                err.message === "invalid UserModel for user: false"
        );

        assert.throws(
            () => {
                const regModel = new AnyRegistrationModel({
                    date: Date.now(),
                    user: NaN
                });
            }, 
            (err) =>
                err.message === "invalid UserModel for user: NaN"
        );

        assert.throws(
            () => {
                const regModel = new AnyRegistrationModel({
                    date: Date.now(),
                    user: /x/
                });
            }, 
            (err) =>
                err.message === "invalid UserModel for user: /x/"
        );


        assert.throws(
            () => {
                const regModel = new RegistrationModel({
                    date: Date.now(),
                    user: {
                        name: "10",
                        age: 101
                    }
                });
            },
            (err) =>
                err.message === `invalid UserModel for user: {"name":"10","age":101,"email":null},${eol} required email`
        );





        const now = Date.now();
        const registrationModel = new RegistrationModel({
            date: now,
            user: {
                name: "Bob ",
                age: "99" as any,
                email: "x@x.x"
            }
        });

        assert.strictEqual( +registrationModel.data.date, now );
        assert.ok( registrationModel.data.date instanceof Date );

        const user = registrationModel.data.user;
        assert.strictEqual( user.data.name, "Bob" );
        assert.strictEqual( user.data.age, 99 );
        assert.strictEqual( user.data.email, "x@x.x" );
        assert.strictEqual( user.data.phone, null );
    });

    
    it("model.toJSON with custom models", () => {

        class CarModel extends Model<CarModel> {
            structure() {
                return {
                    id: Types.Number,
                    color: Types.String
                };
            }
        }

        class UserModel extends Model<UserModel> {
            structure() {
                return {
                    name: Types.String,
                    car: CarModel
                };
            }
        }

        const userModel = new UserModel({
            name: "Jack",
            car: {
                id: "1" as any,
                color: "red"
            }
        });

        assert.deepEqual(
            userModel.toJSON(),
            {
                name: "Jack",
                car: {
                    id: 1,
                    color: "red"
                }
            }
        );
    });
    

    it("equal models", () => {

        class SomeModel extends Model<SomeModel> {
            structure() {
                return {
                    prop: Types.Number
                };
            }
        }

        const model1 = new SomeModel({
            prop: 1
        });
        const model2 = new SomeModel({
            prop: 1
        });
        const model3 = new SomeModel({
            prop: 3
        });
        const obj1 = {prop: 1};
        const obj2 = {prop: 3};

        const pairs: any[][] = [
            [null, null, true],
            [null, model1, false],
            [null, model2, false],
            [null, model3, false],
            [model1, model1, true],
            [model1, model2, true],
            [model1, model3, false],
            [model2, model3, false],
            [model1, obj1, true],
            [model1, obj2, false],
            [model3, obj1, false],
            [model3, obj2, true]
        ];


        pairs.forEach((pair) => {
            class TestModel extends Model<TestModel> {
                structure() {
                    return {
                        model: SomeModel
                    };
                }
            }

            const testModel1 = new TestModel({
                model: pair[0]
            });

            const testModel2 = new TestModel({
                model: pair[1]
            });

            assert.strictEqual(
                testModel1.equal( testModel2 ),
                pair[2],
                pair.toString()
            );

            assert.strictEqual(
                testModel2.equal( testModel1 ),
                pair[2],
                pair.toString()
            );
        });
    });

    it("equal circular models", () => {

        class SomeModel extends Model<SomeModel> {
            structure() {
                return {
                    name: Types.String,
                    self: SomeModel
                };
            }
        }

        const circular1 = new SomeModel();
        circular1.set({self: circular1});

        const circular2 = new SomeModel();
        circular2.set({self: circular2});

        const circular3 = new SomeModel({name: "nice"});
        circular3.set({self: circular3});

        const pairs: any[][] = [
            [circular1, circular1, true],
            [circular1, circular2, true],
            [circular2, circular2, true],
            [circular1, circular3, false],
            [circular2, circular3, false]
        ];


        pairs.forEach((pair, i) => {
            class TestModel extends Model<TestModel> {
                structure() {
                    return {
                        model: SomeModel
                    };
                }
            }

            const model1 = new TestModel({
                model: pair[0]
            });

            const model2 = new TestModel({
                model: pair[1]
            });

            assert.strictEqual(
                model1.equal( model2 ),
                pair[2],
                i + ": " + invalidValuesAsString(pair)
            );

            assert.strictEqual(
                model2.equal( model1 ),
                pair[2],
                i + ": " + invalidValuesAsString(pair)
            );
        });
    });

    // when in type defined BaseModel, and in data we have ChildModel (extends BaseModel), 
    // then clone should be instance of ChildModel
    it("clone model, should return instance of Child", () => {

        class FirstLevel<T extends Model> extends Model<T> {}

        class SecondLevel extends FirstLevel<SecondLevel> {
            structure() {
                return {
                    level: Types.Number({
                        default: 2
                    })
                };
            }
        }

        class MainModel extends Model<MainModel> {
            structure() {
                return {
                    some: FirstLevel
                };
            }
        }

        const second = new SecondLevel();
        const main = new MainModel({
            some: second
        });

        assert.deepEqual(
            main.toJSON(),
            {
                some: {
                    level: 2
                }
            }
        );

        const clone = main.clone();

        assert.ok( clone.get("some") instanceof SecondLevel );

    });

    it("triple extending", () => {
        class First<T extends First = any> extends Model<T> {
            structure() {
                return {
                    first: Types.Number
                };
            }
        }

        class Second<T extends Second = any> extends First<T> {
            structure() {
                return {
                    ...super.structure(),
                    second: Types.Number
                };
            }
        }

        class Third<T extends Third = any> extends Second<T> {
            structure() {
                return {
                    ...super.structure(),
                    third: Types.Number
                };
            }
        }

        const first = new First<First>({
            first: 1
        });
        const second = new Second<Second>({
            first: 1,
            second: 2
        });
        const third = new Third<Third>({
            first: 1,
            second: 2,
            third: 3
        });

        assert.deepStrictEqual( first.toJSON(), {
            first: 1
        });
        assert.deepStrictEqual( second.toJSON(), {
            first: 1,
            second: 2
        });
        assert.deepStrictEqual( third.toJSON(), {
            first: 1,
            second: 2,
            third: 3
        });

        assert.strictEqual( first.get("first"), 1 );
        assert.strictEqual( second.get("second"), 2 );
        assert.strictEqual( third.get("third"), 3 );
    });

    it("circular structure to json", () => {
        
        class MyModel extends Model<MyModel> {
            structure() {
                return {
                    model: MyModel
                };
            }
        }

        const model = new MyModel();
        model.set({model});

        assert.throws(
            () => {
                model.toJSON();
            },
            (err) =>
                err.message === "Cannot converting circular structure to JSON"
        );
    });

});

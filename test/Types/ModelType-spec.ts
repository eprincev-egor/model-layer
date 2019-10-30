
import {Model} from "../../lib/index";
import assert from "assert";
import {invalidValuesAsString, eol} from "../../lib/utils";
import { ISimpleObject } from "../../lib/Model";

describe("ModelType", () => {
    
    it("child model", () => {
        interface IUser {
            name: string;
            phone: string;
            email: string;
            age: number | string;
        }

        class UserModel extends Model<IUser> {
            public static data() {
                return {
                    name: {
                        type: "string",
                        trim: true,
                        emptyAsNull: true,
                        required: true
                    },
                    phone: {
                        type: "string",
                        validate: /^\+7 \(\d\d\d\) \d\d\d-\d\d-\d\d$/
                    },
                    email: {
                        type: "string",
                        required: true,
                        validate: /^[\w.-]+@[\w.-]+\.\w+$/i
                    },
                    age: {
                        type: "number",
                        required: true,
                        validate: (age) =>
                            age > 0
                    }
                };
            }
        }

        interface IRegistration {
            user: UserModel;
            date: Date | number;
        }

        class RegistrationModel extends Model<IRegistration> {
            public static data() {
                return {
                    user: {
                        type: UserModel,
                        required: true
                    },
                    date: {
                        type: "date",
                        required: true
                    }
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
                age: "99",
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
        interface ICar {
            id: number | string;
            color: string;
        }

        class CarModel extends Model<ICar> {
            public static data() {
                return {
                    id: "number",
                    color: "string"
                };
            }
        }

        interface IUser {
            name: string;
            car: CarModel;
        }

        class UserModel extends Model<IUser> {
            public static data() {
                return {
                    name: "string",
                    car: CarModel
                };
            }
        }

        const userModel = new UserModel({
            name: "Jack",
            car: {
                id: "1",
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
        interface ISomeData {
            prop: number;
        }

        class SomeModel extends Model<ISomeData> {
            public static data() {
                return {
                    prop: "number"
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

        interface ITest {
            model: SomeModel;
        }

        pairs.forEach((pair) => {
            class TestModel extends Model<ITest> {
                public static data() {
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
        interface ISomeData {
            name: string;
            self: SomeModel;
        }

        class SomeModel extends Model<ISomeData> {
            public static data() {
                return {
                    name: "string",
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

        interface ITest {
            model: SomeModel;
        }

        pairs.forEach((pair, i) => {
            class TestModel extends Model<ITest> {
                public static data() {
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

    it("BaseModel.or(ChildModel1), default constructor is BaseModel", () => {
        interface IBase {
            modelName: string;
        }

        class BaseModel<T extends IBase = IBase> extends Model<T> {
            public static data() {
                return {
                    modelName: "string"
                };
            }
        }

        interface IChild extends IBase {
            isChild: boolean;
        }

        class ChildModel extends BaseModel<IChild> {
            public static data() {
                return {
                    ...super.data(),
                    isChild: {
                        type: "boolean",
                        default: true
                    }
                };
            }
        }

        interface IMain {
            child: BaseModel | ChildModel;
        }

        class MainModel extends Model<IMain> {
            public static data() {
                return {
                    child: BaseModel.or( ChildModel )
                };
            }
        }

        const main = new MainModel({
            child: {
                modelName: "base"
            }
        });

        assert.deepEqual(
            main.toJSON(),
            {
                child: {
                    modelName: "base"
                }
            }
        );

        main.set({child: new ChildModel()});

        assert.deepEqual(
            main.toJSON(),
            {
                child: {
                    modelName: null,
                    isChild: true
                }
            }
        );
    });

    it("BaseModel.or(ChildModel) ChildModel should be inherited from BaseModel", () => {
        
        class BaseModel extends Model<ISimpleObject> {}
        class ChildModel extends Model<ISimpleObject> {}

        assert.throws(
            () => {
                BaseModel.or( ChildModel );
            }, 
            (err) =>
                err.message === "ChildModel should be inherited from BaseModel"
        );
        
    });

    it("BaseModel.or() expected children Models", () => {
        class BaseModel extends Model<ISimpleObject> {}

        assert.throws(
            () => {
                BaseModel.or();
            }, 
            (err) =>
                err.message === "expected children Models"
        );
        
    });


    it("BaseModel.or(ChildModel1, ChildModel2, ...) get constructor by data", () => {
        interface IProduct {
            type: string;
            price: number;
        }

        class Product<T extends IProduct = IProduct> extends Model<T> {
            public static data() {
                return {
                    type: "string",
                    price: "number"
                };
            }
        }

        interface IDressProduct extends IProduct {
            size: number;
        }

        class DressProduct extends Product<IDressProduct> {
            public static data() {
                return {
                    ...super.data(),

                    size: "number"
                };
            }
        }

        interface IFoodProduct extends IProduct {
            color: string;
        }

        class FoodProduct extends Product<IFoodProduct> {
            public static data() {
                return {
                    ...super.data(),

                    color: "string"
                };
            }
        }

        interface ICart {
            products: Array<
                IProduct | Product | 
                IDressProduct | DressProduct | 
                IFoodProduct | FoodProduct
            >;
        }

        class Cart extends Model<ICart> {
            public static data() {
                return {
                    products: {
                        type: "array",
                        element: {
                            type: Product.or( DressProduct, FoodProduct ),
                            constructor: (data) => {
                                if ( data.type === "dress" ) {
                                    return DressProduct;
                                }

                                if ( data.type === "car" ) {
                                    return FoodProduct;
                                }
                            }
                        }
                    }
                };
            }
        }

        const cart = new Cart({
            products: [
                {type: "car", price: 10000, color: "red"},
                {type: "dress", price: 100, size: 34},
                {type: "product", price: 50}
            ]
        });

        assert.deepEqual(
            cart.toJSON(),
            {
                products: [
                    {type: "car", price: 10000, color: "red"},
                    {type: "dress", price: 100, size: 34},
                    {type: "product", price: 50}
                ]
            }
        );
    });

    
    it("BaseModel.or(...), if custom getConstructor returns undefined, we using BaseModel", () => {
        interface IBase {
            modelName: string;
        }

        class BaseModel extends Model<IBase> {
            public static data() {
                return {
                    modelName: "string"
                };
            }
        }

        class ChildModel extends BaseModel {}

        interface IMain {
            child: BaseModel | ChildModel;
        }

        class MainModel extends Model<IMain> {
            public static data() {
                return {
                    child: {
                        type: BaseModel.or( ChildModel ),
                        constructor: () => null
                    }
                };
            }
        }

        const main = new MainModel({
            child: {
                modelName: "base"
            }
        });

        assert.deepEqual(
            main.toJSON(),
            {
                child: {
                    modelName: "base"
                }
            }
        );

    });

    // when in type defined BaseModel, and in data we have ChildModel (extends BaseModel), 
    // then clone should be instance of ChildModel
    it("clone model, should return instance of Child", () => {

        class FirstLevel<T = ISimpleObject> extends Model<T> {}

        interface ISecond {
            level: number;
        }

        class SecondLevel extends FirstLevel<ISecond> {
            public static data() {
                return {
                    level: {
                        type: "number",
                        default: 2
                    }
                };
            }
        }

        interface IMain {
            some: FirstLevel;
        }

        class MainModel extends Model<IMain> {
            public static data() {
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
        interface IFirst {
            first: number;
        }
        interface ISecond extends IFirst {
            second: number;
        }
        interface IThird extends ISecond {
            third: number;
        }

        class First<T extends IFirst = IFirst> extends Model<T> {
            public static data() {
                return {
                    first: "number"
                };
            }
        }

        class Second<T extends ISecond = ISecond> extends First<T> {
            public static data() {
                return {
                    ...super.data(),
                    second: "number"
                };
            }
        }

        class Third extends Second<IThird> {
            public static data() {
                return {
                    ...super.data(),
                    third: "number"
                };
            }
        }

        const first = new First({
            first: 1
        });
        const second = new Second({
            first: 1,
            second: 2
        });
        const third = new Third({
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
        assert.deepStrictEqual( second.toJSON(), {
            first: 1,
            second: 2,
            third: 3
        });

        assert.strictEqual( first.get("first"), 1 );
        assert.strictEqual( second.get("second"), 2 );
        assert.strictEqual( third.get("third"), 3 );
    });

});

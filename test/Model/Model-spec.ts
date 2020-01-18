
import {Model, Types} from "../../lib/index";
import assert from "assert";
import {eol} from "../../lib/utils";

describe("Model tests", () => {

    it("create model with data", () => {

        class SomeModel extends Model<SomeModel> {
            structure() {
                return {
                    prop: Types.String
                };
            }
        }

        const data = {
            prop: "nice"
        };
        const model = new SomeModel(data);

        assert.strictEqual( model.get("prop"), "nice" );
        assert.strictEqual( model.data.prop, "nice" );

        assert.ok( model.data !== data );
    });

    it("create model without data", () => {

        class SomeModel extends Model<SomeModel> {
            structure() {
                return {
                    prop: Types.String
                };
            }
        }

        const model = new SomeModel();

        assert.strictEqual( model.get("prop"), null );
        assert.strictEqual( model.data.prop, null );
    });

    it("default value", () => {

        class SomeModel extends Model<SomeModel> {
            structure() {
                return {
                    prop: Types.String({
                        default: "default"
                    })
                };
            }
        }

        let model = new SomeModel();
        assert.equal( model.get("prop"), "default" );
        assert.equal( model.data.prop, "default" );

        model = new SomeModel({});
        assert.equal( model.get("prop"), "default" );
        assert.equal( model.data.prop, "default" );

        model = new SomeModel({});
        assert.equal( model.get("prop"), "default" );
        assert.equal( model.data.prop, "default" );

        model = new SomeModel({
            prop: null
        });
        assert.strictEqual( model.get("prop"), null );
        assert.strictEqual( model.data.prop, null );


        model = new SomeModel({
            prop: undefined
        });
        assert.strictEqual( model.get("prop"), null );
        assert.strictEqual( model.data.prop, null );
    });

    it("default() value", () => {

        const now = Date.now();

        class SomeModel extends Model<SomeModel> {
            structure() {
                return {
                    now: Types.Number({
                        default: () => Date.now()
                    })
                };
            }
        }

        const model = new SomeModel();

        assert.ok(
            model.data.now >= now
        );
    });

    it("set value", () => {

        class SomeModel extends Model<SomeModel> {
            structure() {
                return {
                    name: Types.String,
                    age: Types.Number
                };
            }
        }

        const model = new SomeModel();
        let data = model.data;

        assert.strictEqual( model.get("name"), null );
        assert.strictEqual( model.data.name, null );
        assert.strictEqual( model.get("age"), null );
        assert.strictEqual( model.data.age, null );
        
        model.set({name: "nice"});
        assert.equal( model.get("name"), "nice" );
        assert.equal( model.data.name, "nice" );
        assert.strictEqual( model.get("age"), null );
        assert.strictEqual( model.data.age, null );
        
        assert.ok( data !== model.data );
        data = model.data;

        model.set({name: null});
        assert.strictEqual( model.get("name"), null );
        assert.strictEqual( model.data.name, null );
        assert.strictEqual( model.get("age"), null );
        assert.strictEqual( model.data.age, null );

        assert.ok( data !== model.data );
        data = model.data;

        model.set({name: "test"});
        assert.equal( model.get("name"), "test" );
        assert.equal( model.data.name, "test" );
        assert.strictEqual( model.get("age"), null );
        assert.strictEqual( model.data.age, null );

        assert.ok( data !== model.data );
        data = model.data;

        model.set({age: 101});
        assert.equal( model.get("name"), "test" );
        assert.equal( model.data.name, "test" );
        assert.strictEqual( model.get("age"), 101 );
        assert.strictEqual( model.data.age, 101 );


        model.set({
            name: "Good",
            age: 99
        });
        assert.equal( model.get("name"), "Good" );
        assert.equal( model.data.name, "Good" );
        assert.strictEqual( model.get("age"), 99 );
        assert.strictEqual( model.data.age, 99 );
    });

    it("error on set unknown property", () => {

        class SomeModel extends Model<SomeModel> {
            structure() {
                return {
                    prop: Types.String
                };
            }
        }

        const model = new SomeModel();

        model.set({prop: "x"});
        assert.equal( model.get("prop"), "x" );
        assert.equal( model.data.prop, "x" );
        
        const data = model.data;

        assert.throws(
            () => {
                const anyModel = model as any;
                anyModel.set({some: "1"});
            }, (err) =>
                err.message === "unknown property: some"
        );

        // invalid action cannot change object
        assert.equal( model.get("prop"), "x" );
        assert.equal( model.data.prop, "x" );

        assert.ok( model.data === data );


        assert.throws(
            () => {
                const AnyModel = SomeModel as any;
                const someModel = new AnyModel({
                    some: "x"
                });
            },
            (err) =>
                err.message === "unknown property: some"
        );
    });


    it("model.data is freeze object", () => {
        class SomeModel extends Model<SomeModel> {
            structure() {
                return {
                    prop: Types.String
                };
            }
        }

        const model = new SomeModel();

        assert.throws(
            () => {
                const anyModel = model as any;
                anyModel.data.prop = "a";
            }, 
            (err) =>
                /Cannot assign to read only property/.test(err.message)
        );

        model.set({prop: "x"});
        assert.equal( model.get("prop"), "x" );
        assert.equal( model.data.prop, "x" );

        assert.throws(
            () => {
                const anyModel = model as any;
                anyModel.data.prop = "y";
            }, (err) =>
                /Cannot assign to read only property/.test(err.message)
        );

        assert.equal( model.get("prop"), "x" );
        assert.equal( model.data.prop, "x" );
    });

    it("keep data if hasn't changes", () => {
        class SomeModel extends Model<SomeModel> {
            structure() {
                return {
                    prop: Types.String
                };
            }
        }

        const model = new SomeModel({
            prop: "value"
        });

        const data = model.data;

        model.set({prop: "value"});
        assert.ok( model.data === data );

        model.set({
            prop: "value"
        });
        assert.ok( model.data === data );
    });

    it("model.hasProperty", () => {
        class SomeModel extends Model<SomeModel> {
            structure() {
                return {
                    prop: Types.String
                };
            }
        }

        const model = new SomeModel();

        assert.strictEqual(
            model.hasProperty("prop"),
            true
        );

        const anyModel = model as any;
        assert.strictEqual(
            anyModel.hasProperty("unknown"),
            false
        );

        assert.strictEqual(
            anyModel.hasProperty("hasOwnProperty"),
            false
        );
    });

    it("model.hasValue", () => {
        class SomeModel extends Model<SomeModel> {
            structure() {
                return {
                    name: Types.String,
                    age: Types.Number
                };
            }
        }

        const model = new SomeModel({
            name: "Bob"
        });

        assert.strictEqual(
            model.hasValue("name"),
            true
        );

        assert.strictEqual(
            model.hasValue("age"),
            false
        );

        model.set({
            name: null,
            age: 100
        });

        assert.strictEqual(
            model.hasValue("name"),
            false
        );

        assert.strictEqual(
            model.hasValue("age"),
            true
        );


        // unknown prop
        const anyModel = model as any;
        assert.strictEqual(
            anyModel.hasValue("prop"),
            false
        );
    });

    it("model.toJSON", () => {
        class SomeModel extends Model<SomeModel> {
            structure() {
                return {
                    name: Types.String,
                    age: Types.Number
                };
            }
        }

        const model = new SomeModel();

        assert.deepEqual(
            model.toJSON(),
            {
                name: null,
                age: null
            }
        );

        model.set({
            name: "",
            age: 0
        });

        assert.deepEqual(
            model.toJSON(),
            {
                name: "",
                age: 0
            }
        );
    });

    it("model.prepareJSON", () => {

        class SomeModel extends Model<SomeModel> {
            structure() {
                return {
                    name: Types.String,
                    age: Types.Number
                };
            }

            prepareJSON(json) {
                delete json.age;
            }
        }

        const model = new SomeModel();

        assert.deepEqual(
            model.toJSON(),
            {
                name: null
            }
        );

        model.set({
            name: "",
            age: 0
        });

        assert.deepEqual(
            model.toJSON(),
            {
                name: ""
            }
        );
    });

    it("model.clone() with required field", () => {

        class SomeModel extends Model<SomeModel> {
            structure() {
                return {
                    name: Types.String({
                        required: true
                    })
                };
            }
        }

        const model = new SomeModel({
            name: "test"
        });

        assert.deepEqual(model.data, {
            name: "test"
        });

        const clone = model.clone();

        assert.deepEqual(clone.data, {
            name: "test"
        });
    });

    
    it("extends from another Model with data", () => {

        class FirstLevel extends Model<FirstLevel> {
            structure() {
                return {
                    lvl1: Types.String
                };
            }
        }

        class SecondLevel extends Model<SecondLevel> {
            structure() {
                return {
                    ...(new FirstLevel().structure()),
                    lvl2: Types.String
                };
            }
        }

        // create models without errors
        const first = new FirstLevel({ lvl1: "1"});
        const second = new SecondLevel({ lvl2: "2" });
    });

    it("custom toJSON, for field", () => {

        class SomeModel extends Model<SomeModel> {
            structure() {
                return {
                    name: Types.String,
                    self: Types.Model({
                        Model: SomeModel,
                        toJSON: (selfModel) =>
                            selfModel.get("name")
                    })
                };
            }
        }

        const model = new SomeModel({
            name: "circular"
        });

        model.set({self: model});

        assert.deepEqual(
            model.toJSON(),
            {
                name: "circular",
                self: "circular"
            }
        );
    });

    it("custom toJSON, for any field", () => {

        class SomeModel extends Model<SomeModel> {
            structure() {
                return {
                    "*": Types.Model({
                        Model: SomeModel,
                        toJSON: () =>
                            "nice"
                    })
                };
            }
        }

        const model = new SomeModel();
        model.set({self: model});
        model.set({empty: null});

        assert.deepEqual(
            model.toJSON(),
            {
                self: "nice",
                empty: null
            }
        );
    });

    it("clone, for any field", () => {

        class SomeModel extends Model<SomeModel> {
            structure() {
                return {
                    "*": Types.Any
                };
            }
        }

        const model = new SomeModel();
        model.set({some: 12});
        model.set({empty: null});

        assert.deepEqual(
            model.clone().data,
            {
                some: 12,
                empty: null
            }
        );
    });

    // it("register new type", () => {
        
    //     class CustomType extends Model.Type {
    //         prepare(value) {
    //             return +value * 2;
    //         }
    //     }

    //     Model.registerType("custom", CustomType);

    //     interface ISomeData {
    //         prop: any;
    //     }

    //     class SomeModel extends Model<ISomeData> {
    //         structure() {
    //             return {
    //                 prop: "custom"
    //             };
    //         }
    //     }

    //     const model = new SomeModel({
    //         prop: "10"
    //     });

    //     assert.strictEqual(model.data.prop, 20);
    // });

    
    it("custom prepare field", () => {

        class SomeModel extends Model<SomeModel> {
            structure() {
                return {
                    money: Types.Number({
                        default: 1,
                        prepare: (value) =>
                            value * 2
                    })
                };
            }
        }

        const model = new SomeModel();
        assert.strictEqual( model.data.money, 2 );

        model.set({money: 12});
        assert.strictEqual( model.data.money, 24 );

        model.set({money: null});
        assert.strictEqual( model.data.money, null );
    });

    it("check value type after custom prepare", () => {

        class SomeModel extends Model<SomeModel> {
            structure() {
                return {
                    name: Types.String
                };
            }

            prepare(data) {
                data.name = 10;
            }
        }

        const model = new SomeModel();
        assert.strictEqual( model.data.name, "10" );

        model.set({name: (12 as any)});
        assert.strictEqual( model.data.name, "10" );
    });

    it("check value type after custom prepare (any key)", () => {

        class SomeModel extends Model<SomeModel> {
            structure() {
                return {
                    "*": Types.String
                };
            }

            prepare(data) {
                data.name = 10;
            }
        }

        const model = new SomeModel();
        assert.strictEqual( model.data.name, "10" );

        model.set({name: (12 as any)});
        assert.strictEqual( model.data.name, "10" );
    });

    it("custom prepare field and standard prepares (round, trim, emptyAsNull)", () => {
        interface ISomeData {
            name: string;
            age: number;
        }

        class SomeModel extends Model<SomeModel> {
            structure() {
                return {
                    name: Types.String({
                        default: "  ",
                        trim: true,
                        emptyAsNull: true,
                        prepare: (value) =>
                            value[0].toUpperCase() + 
                                value.slice(1).toLowerCase()
                    }),
                    age: Types.Number({
                        default: 0,
                        zeroAsNull: true,
                        prepare: (value) =>
                            +(value).toFixed(0)
                    })
                };
            }
        }

        let model = new SomeModel();
        assert.strictEqual( model.data.name, null );
        assert.strictEqual( model.data.age, null );

        model = new SomeModel({
            name: " wOrd ",
            age: 1.1111
        });
        assert.strictEqual( model.data.name, "Word" );
        assert.strictEqual( model.data.age, 1 );
    });

    it("custom prepare data", () => {
        interface ISomeData {
            firstName: string;
            lastName: string;
            fullName: string;
        }

        function upFirstLetter(name) {
            return (
                name[0].toUpperCase() + 
                    name.slice(1).toLowerCase()
            );
        }

        class SomeModel extends Model<SomeModel> {
            structure() {
                return {
                    firstName: Types.String({
                        trim: true,
                        emptyAsNull: true,
                        prepare: upFirstLetter
                    }),
                    lastName: Types.String({
                        trim: true,
                        emptyAsNull: true,
                        prepare: upFirstLetter
                    }),
                    fullName: Types.String({
                        trim: true,
                        emptyAsNull: true
                    })
                };
            }

            prepare(data) {
                // data.firstName can be null
                const firstName = data.firstName || "";
                // data.lastName can be null
                const lastName = data.lastName || "";

                data.fullName = `${ firstName } ${lastName}`;
            }
        }

        let model = new SomeModel();
        assert.strictEqual( model.data.firstName, null );
        assert.strictEqual( model.data.lastName, null );
        assert.strictEqual( model.data.fullName, null );

        model = new SomeModel({
            firstName: "bob"
        });
        assert.strictEqual( model.data.firstName, "Bob" );
        assert.strictEqual( model.data.lastName, null );
        assert.strictEqual( model.data.fullName, "Bob" );
        
        model.set({
            lastName: "  taylor"
        });
        assert.strictEqual( model.data.firstName, "Bob" );
        assert.strictEqual( model.data.lastName, "Taylor" );
        assert.strictEqual( model.data.fullName, "Bob Taylor" );
    });

    
    it("custom required field", () => {

        class FileModel extends Model<FileModel> {
            structure() {
                return {
                    name: Types.String({
                        required: true
                    }),
                    path: Types.String
                };
            }

            prepare(data) {
                data.name = data.path.split("/").pop();
            }
        }

        const file = new FileModel({
            path: "test/name.txt"
        });
        assert.strictEqual( file.data.name, "name.txt" );
    });

    it("equal with same class model", () => {

        class SomeModel extends Model<SomeModel> {
            structure() {
                return {
                    prop: Types.String
                };
            }
        }

        const firstModel = new SomeModel({
            prop: "first"
        });
        const secondModel = new SomeModel({
            prop: "second"
        });

        assert.ok( !firstModel.equal( secondModel ) );
        assert.ok( !secondModel.equal( firstModel ) );

        secondModel.set({prop: "first"});

        assert.ok( firstModel.equal( secondModel ) );
        assert.ok( secondModel.equal( firstModel ) );
    });

    it("equal model with another data", () => {

        class Model1 extends Model<Model1> {
            structure() {
                return {
                    some: Types.Number
                };
            }
        }

        class Model2 extends Model<Model2> {
            structure() {
                return {
                    "*": Types.Any
                };
            }
        }


        const firstModel = new Model1({
            some: 1
        });
        const secondModel = new Model2({
            some: 1
        });

        assert.ok( firstModel.equal( secondModel ) );
        assert.ok( secondModel.equal( firstModel ) );

        secondModel.set({another: "value"});

        assert.ok( !firstModel.equal( secondModel ) );
        assert.ok( !secondModel.equal( firstModel ) );
    });


    it("equal models with same models in two fields", () => {

        class User extends Model<User> {
            structure() {
                return {
                    name: Types.String
                };
            }
        }
        class TestModel extends Model<TestModel> {
            structure() {
                return {
                    a: User,
                    b: User
                };
            }
        }

        const user = new User({
            name: "Jack"
        });
        const firstModel = new TestModel({
            a: user,
            b: user
        });
        const secondModel = new TestModel({
            a: user,
            b: user
        });

        assert.ok( firstModel.equal( secondModel ) );
        assert.ok( secondModel.equal( firstModel ) );
    });

    it("max error length on prepare", () => {

        class SomeModel extends Model<SomeModel> {
            structure() {
                return {
                    prop: Types.Number
                };
            }
        }

        assert.throws(
            () => {
                const model = new SomeModel({
                    prop: ("X1234568790123456879012345687901234568790123456879" as any)
                });
            }, (err) =>
                err.message === "invalid number for prop: \"X1234568790123456879012345687901234568790123456879\""
        );

        assert.throws(
            () => {
                const model = new SomeModel({
                    prop: ("X1234568790123456879012345687901234568790123456879y" as any)
                });
            }, (err) =>
                err.message === "invalid number for prop: \"X1234568790123456879012345687901234568790123456879...\""
        );

        assert.throws(
            () => {
                const AnyModel = SomeModel as any;
                const model = new AnyModel({
                    prop: {some: 1}
                });
            }, (err) =>
            err.message === "invalid number for prop: {\"some\":1}"
            );
            
        assert.throws(
            () => {
                const AnyModel = SomeModel as any;
                const model = new AnyModel({
                    prop: {some: 1, sub: {bigString: "X1234568790123456879012345687901234568790123456879"}}
                });
            }, (err) =>
                err.message === "invalid number for prop: {\"some\":1,\"sub\":{\"bigString\":\"X1234568790123456879..."
        );
    });

    it("test eol on linux", () => {

        eol.define( "linux" );

        class SomeModel extends Model<SomeModel> {
            structure() {
                return {
                    arr: Types.Array({
                        element: Types.Number
                    }),
                    obj: Types.Object({
                        element: Types.Number
                    })
                };
            }
        }

        assert.throws(
            () => {
                const AnyModel = SomeModel as any;
                const model = new AnyModel({
                    arr: ["wrong"]
                });
            }, (err) =>
                err.message === "invalid array[number] for arr: [\"wrong\"],\n invalid number for 0: \"wrong\""
        );

        assert.throws(
            () => {
                const AnyModel = SomeModel as any;
                const model = new AnyModel({
                    obj: {prop: "wrong"}
                });
            }, (err) =>
                err.message === "invalid object[number] for obj: {\"prop\":\"wrong\"},\n invalid number for prop: \"wrong\""
        );
    });

    it("test eol on windows", () => {

        eol.define( "windows" );

        class SomeModel extends Model<SomeModel> {
            structure() {
                return {
                    arr: Types.Array({
                        element: Types.Number
                    }),
                    obj: Types.Object({
                        element: Types.Number
                    })
                };
            }
        }

        assert.throws(
            () => {
                const AnyModel = SomeModel as any;
                const model = new AnyModel({
                    arr: ["wrong"]
                });
            }, (err) =>
                err.message === "invalid array[number] for arr: [\"wrong\"],\r\n invalid number for 0: \"wrong\""
        );

        assert.throws(
            () => {
                const AnyModel = SomeModel as any;
                const model = new AnyModel({
                    obj: {prop: "wrong"}
                });
            }, (err) =>
                err.message === "invalid object[number] for obj: {\"prop\":\"wrong\"},\r\n invalid number for prop: \"wrong\""
        );
    });

    it("unknown type", () => {
        class AnyModel extends Model {
            structure() {
                return {
                    x: {
                        type: "test"
                    } as any
                };
            }
        }

        assert.throws(
            () => {
                const model = new AnyModel();
            }, (err) =>
                err.message === "x: unknown type: test"
        );
    });

    it("wrong validate", () => {
        class AnyModel extends Model {
            structure() {
                return {
                    x: {
                        type: "string",
                        validate: NaN
                    } as any
                };
            }
        }

        assert.throws(
            () => {
                const model = new AnyModel();
            }, (err) =>
                err.message === "x: validate should be function or RegExp: NaN"
        );
    });

    it("wrong validate key", () => {
        class AnyModel extends Model {
            structure() {
                return {
                    "*": {
                        type: "string",
                        key: NaN
                    } as any
                };
            }
        }

        assert.throws(
            () => {
                const model = new AnyModel();
            }, (err) =>
                err.message === "*: validate key should be function or RegExp: NaN"
        );
    });

    it("Model without structure method", () => {

        class Company extends Model<Company> {
        }

        assert.throws(
            () => {
                const model = new Company();
            }, (err) =>
                err.message === "Company.structure() is not declared"
        );
    });

});

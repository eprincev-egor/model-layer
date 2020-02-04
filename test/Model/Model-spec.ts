
import {Model, Collection, Types} from "../../lib/index";
import assert from "assert";
import {eol} from "../../lib/utils";

describe("Model tests", () => {

    it("create model with row", () => {

        class SomeModel extends Model<SomeModel> {
            structure() {
                return {
                    prop: Types.String
                };
            }
        }

        const row = {
            prop: "nice"
        };
        const model = new SomeModel(row);

        assert.strictEqual( model.get("prop"), "nice" );
        assert.strictEqual( model.row.prop, "nice" );

        assert.ok( model.row !== row );
    });

    it("create model without row", () => {

        class SomeModel extends Model<SomeModel> {
            structure() {
                return {
                    prop: Types.String
                };
            }
        }

        const model = new SomeModel();

        assert.strictEqual( model.get("prop"), null );
        assert.strictEqual( model.row.prop, null );
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
        assert.equal( model.row.prop, "default" );

        model = new SomeModel({});
        assert.equal( model.get("prop"), "default" );
        assert.equal( model.row.prop, "default" );

        model = new SomeModel({});
        assert.equal( model.get("prop"), "default" );
        assert.equal( model.row.prop, "default" );

        model = new SomeModel({
            prop: null
        });
        assert.strictEqual( model.get("prop"), null );
        assert.strictEqual( model.row.prop, null );


        model = new SomeModel({
            prop: undefined
        });
        assert.strictEqual( model.get("prop"), null );
        assert.strictEqual( model.row.prop, null );
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
            model.row.now >= now
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
        let row = model.row;

        assert.strictEqual( model.get("name"), null );
        assert.strictEqual( model.row.name, null );
        assert.strictEqual( model.get("age"), null );
        assert.strictEqual( model.row.age, null );
        
        model.set({name: "nice"});
        assert.equal( model.get("name"), "nice" );
        assert.equal( model.row.name, "nice" );
        assert.strictEqual( model.get("age"), null );
        assert.strictEqual( model.row.age, null );
        
        assert.ok( row !== model.row );
        row = model.row;

        model.set({name: null});
        assert.strictEqual( model.get("name"), null );
        assert.strictEqual( model.row.name, null );
        assert.strictEqual( model.get("age"), null );
        assert.strictEqual( model.row.age, null );

        assert.ok( row !== model.row );
        row = model.row;

        model.set({name: "test"});
        assert.equal( model.get("name"), "test" );
        assert.equal( model.row.name, "test" );
        assert.strictEqual( model.get("age"), null );
        assert.strictEqual( model.row.age, null );

        assert.ok( row !== model.row );
        row = model.row;

        model.set({age: 101});
        assert.equal( model.get("name"), "test" );
        assert.equal( model.row.name, "test" );
        assert.strictEqual( model.get("age"), 101 );
        assert.strictEqual( model.row.age, 101 );


        model.set({
            name: "Good",
            age: 99
        });
        assert.equal( model.get("name"), "Good" );
        assert.equal( model.row.name, "Good" );
        assert.strictEqual( model.get("age"), 99 );
        assert.strictEqual( model.row.age, 99 );
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
        assert.equal( model.row.prop, "x" );
        
        const row = model.row;

        assert.throws(
            () => {
                const anyModel = model as any;
                anyModel.set({some: "1"});
            }, (err) =>
                err.message === "unknown property: some"
        );

        // invalid action cannot change object
        assert.equal( model.get("prop"), "x" );
        assert.equal( model.row.prop, "x" );

        assert.ok( model.row === row );


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


    it("model.row is freeze object", () => {
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
                anyModel.row.prop = "a";
            }, 
            (err) =>
                /Cannot assign to read only property/.test(err.message)
        );

        model.set({prop: "x"});
        assert.equal( model.get("prop"), "x" );
        assert.equal( model.row.prop, "x" );

        assert.throws(
            () => {
                const anyModel = model as any;
                anyModel.row.prop = "y";
            }, (err) =>
                /Cannot assign to read only property/.test(err.message)
        );

        assert.equal( model.get("prop"), "x" );
        assert.equal( model.row.prop, "x" );
    });

    it("keep row if hasn't changes", () => {
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

        const row = model.row;

        model.set({prop: "value"});
        assert.ok( model.row === row );

        model.set({
            prop: "value"
        });
        assert.ok( model.row === row );
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

        assert.deepEqual(model.row, {
            name: "test"
        });

        const clone = model.clone();

        assert.deepEqual(clone.row, {
            name: "test"
        });
    });

    
    it("extends from another Model with row", () => {

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
            model.clone().row,
            {
                some: 12,
                empty: null
            }
        );
    });

    
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
        assert.strictEqual( model.row.money, 2 );

        model.set({money: 12});
        assert.strictEqual( model.row.money, 24 );

        model.set({money: null});
        assert.strictEqual( model.row.money, null );
    });

    it("check value type after custom prepare", () => {

        class SomeModel extends Model<SomeModel> {
            structure() {
                return {
                    name: Types.String
                };
            }

            prepare(row) {
                row.name = 10;
            }
        }

        const model = new SomeModel();
        assert.strictEqual( model.row.name, "10" );

        model.set({name: (12 as any)});
        assert.strictEqual( model.row.name, "10" );
    });

    it("check value type after custom prepare (any key)", () => {

        class SomeModel extends Model<SomeModel> {
            structure() {
                return {
                    "*": Types.String
                };
            }

            prepare(row) {
                row.name = 10;
            }
        }

        const model = new SomeModel();
        assert.strictEqual( model.row.name, "10" );

        model.set({name: (12 as any)});
        assert.strictEqual( model.row.name, "10" );
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
        assert.strictEqual( model.row.name, null );
        assert.strictEqual( model.row.age, null );

        model = new SomeModel({
            name: " wOrd ",
            age: 1.1111
        });
        assert.strictEqual( model.row.name, "Word" );
        assert.strictEqual( model.row.age, 1 );
    });

    it("custom prepare row", () => {
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

            prepare(row) {
                // row.firstName can be null
                const firstName = row.firstName || "";
                // row.lastName can be null
                const lastName = row.lastName || "";

                row.fullName = `${ firstName } ${lastName}`;
            }
        }

        let model = new SomeModel();
        assert.strictEqual( model.row.firstName, null );
        assert.strictEqual( model.row.lastName, null );
        assert.strictEqual( model.row.fullName, null );

        model = new SomeModel({
            firstName: "bob"
        });
        assert.strictEqual( model.row.firstName, "Bob" );
        assert.strictEqual( model.row.lastName, null );
        assert.strictEqual( model.row.fullName, "Bob" );
        
        model.set({
            lastName: "  taylor"
        });
        assert.strictEqual( model.row.firstName, "Bob" );
        assert.strictEqual( model.row.lastName, "Taylor" );
        assert.strictEqual( model.row.fullName, "Bob Taylor" );
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

            prepare(row) {
                row.name = row.path.split("/").pop();
            }
        }

        const file = new FileModel({
            path: "test/name.txt"
        });
        assert.strictEqual( file.row.name, "name.txt" );
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

    it("equal model with another row", () => {

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

    it("model.clone() with Or type, model value should be same instance like are original", () => {

        class Manager extends Model<Manager> {
            structure() {
                return {
                    name: Types.String,
                    phone: Types.String
                };
            }
        }

        class Client extends Model<Client> {
            structure() {
                return {
                    name: Types.String,
                    phone: Types.String
                };
            }
        }

        class SomeModel extends Model<SomeModel> {
            structure() {
                return {
                    user: Types.Or({
                        or: [Manager, Client]
                    })
                };
            }
        }

        const client = new Client({
            name: "Client",
            phone: "1"
        });
        const manager = new Manager({
            name: "Manager",
            phone: "1"
        });

        const model = new SomeModel({
            user: client
        });

        const clone1 = model.clone();
        assert.ok( clone1.get("user") instanceof Client );
        assert.ok( clone1.get("user") !== model.get("user") );
        assert.deepStrictEqual(model.toJSON(), clone1.toJSON());


        model.set({
            user: manager
        });

        const clone2 = model.clone();
        assert.ok( clone2.get("user") instanceof Manager );
        assert.ok( clone2.get("user") !== model.get("user") );
        assert.deepStrictEqual(model.toJSON(), clone2.toJSON());
    });

    it("model.clone() with Any type, model value should be same instance like are original", () => {

        class Manager extends Model<Manager> {
            structure() {
                return {
                    name: Types.String,
                    phone: Types.String
                };
            }
        }

        class Client extends Model<Client> {
            structure() {
                return {
                    name: Types.String,
                    phone: Types.String
                };
            }
        }

        class SomeModel extends Model<SomeModel> {
            structure() {
                return {
                    user: Types.Any
                };
            }
        }

        const client = new Client({
            name: "Client",
            phone: "1"
        });
        const manager = new Manager({
            name: "Manager",
            phone: "1"
        });

        const model = new SomeModel({
            user: client
        });

        const clone1 = model.clone();
        assert.ok( clone1.get("user") instanceof Client );
        assert.ok( clone1.get("user") !== model.get("user") );
        assert.deepStrictEqual(model.toJSON(), clone1.toJSON());


        model.set({
            user: manager
        });

        const clone2 = model.clone();
        assert.ok( clone2.get("user") instanceof Manager );
        assert.ok( clone2.get("user") !== model.get("user") );
        assert.deepStrictEqual(model.toJSON(), clone2.toJSON());
    });

    it("model.clone() with Any type, model value inside array should be same instance like are original", () => {

        class Manager extends Model<Manager> {
            structure() {
                return {
                    name: Types.String,
                    phone: Types.String
                };
            }
        }

        class Client extends Model<Client> {
            structure() {
                return {
                    name: Types.String,
                    phone: Types.String
                };
            }
        }

        class SomeModel extends Model<SomeModel> {
            structure() {
                return {
                    users: Types.Any
                };
            }
        }

        const client = new Client({
            name: "Client",
            phone: "1"
        });
        const manager = new Manager({
            name: "Manager",
            phone: "1"
        });

        const model = new SomeModel({
            users: [[client]]
        });

        const clone1 = model.clone();
        assert.ok( clone1.get("users")[0][0] instanceof Client );
        assert.ok( clone1.get("users")[0][0] !== model.get("users")[0][0] );
        assert.deepStrictEqual(model.toJSON(), clone1.toJSON());


        model.set({
            users: [[manager]]
        });

        const clone2 = model.clone();
        assert.ok( clone2.get("users")[0][0] instanceof Manager );
        assert.ok( clone2.get("users")[0][0] !== model.get("users")[0][0] );
        assert.deepStrictEqual(model.toJSON(), clone2.toJSON());
    });

    it("model.clone() with Any type, model value inside object should be same instance like are original", () => {

        class Manager extends Model<Manager> {
            structure() {
                return {
                    name: Types.String,
                    phone: Types.String
                };
            }
        }

        class Client extends Model<Client> {
            structure() {
                return {
                    name: Types.String,
                    phone: Types.String
                };
            }
        }

        class SomeModel extends Model<SomeModel> {
            structure() {
                return {
                    users: Types.Any
                };
            }
        }

        const client = new Client({
            name: "Client",
            phone: "1"
        });
        const manager = new Manager({
            name: "Manager",
            phone: "1"
        });

        const model = new SomeModel({
            users: {user: client}
        });

        const clone1 = model.clone();
        assert.ok( clone1.get("users").user instanceof Client );
        assert.ok( clone1.get("users").user !== model.get("users").user );
        assert.deepStrictEqual(model.toJSON(), clone1.toJSON());


        model.set({
            users: {user: manager}
        });

        const clone2 = model.clone();
        assert.ok( clone2.get("users").user instanceof Manager );
        assert.ok( clone2.get("users").user !== model.get("users").user );
        assert.deepStrictEqual(model.toJSON(), clone2.toJSON());
    });

    it("model.clone() with circular reference (array type)", () => {
        class Human extends Model<Human> {
            structure() {
                return {
                    name: Types.String,
                    dad: Human,
                    mom: Human,
                    children: Types.Array({
                        element: Human
                    })
                };
            }
        }

        const dad = new Human({
            name: "dad"
        });
        const mom = new Human({
            name: "mom"
        });
        const child = new Human({
            name: "bob",
            mom,
            dad
        });

        mom.set({
            children: [child]
        });
        dad.set({
            children: [child]
        });

        const clone = mom.clone();
        assert.ok( clone instanceof Human );
        assert.strictEqual( clone.get("name"), "mom" );
        
        const cloneChild = clone.get("children")[0];
        assert.ok( cloneChild instanceof Human );
        assert.ok( cloneChild !== child );
        assert.strictEqual( cloneChild.get("name"), "bob" );

    });

    
    it("model.clone() with circular reference (object type)", () => {
        class Human extends Model<Human> {
            structure() {
                return {
                    name: Types.String,
                    friend: Types.Object({
                        element: Human
                    })
                };
            }
        }

        const bob = new Human({
            name: "bob"
        });
        const jack = new Human({
            name: "jack",
            friend: {first: bob}
        });

        bob.set({
            friend: {first: jack}
        });

        const clone = bob.clone();
        assert.ok( clone instanceof Human );
        assert.strictEqual( clone.get("name"), "bob" );
        
        const cloneFriend = clone.get("friend");
        assert.ok( cloneFriend.first instanceof Human, "instance Human" );
        assert.ok( cloneFriend.first !== bob.get("friend").first, "is another Model" );
        assert.strictEqual( cloneFriend.first.get("name"), "jack" );

    });

    
    it("model.clone() with circular reference (model type)", () => {
        class Human extends Model<Human> {
            structure() {
                return {
                    name: Types.String,
                    friend: Human
                };
            }
        }

        const bob = new Human({
            name: "bob"
        });
        const jack = new Human({
            name: "jack",
            friend: bob
        });

        bob.set({
            friend: jack
        });

        const clone = bob.clone();
        assert.ok( clone instanceof Human );
        assert.strictEqual( clone.get("name"), "bob" );
        
        const cloneFriend = clone.get("friend");
        assert.ok( cloneFriend instanceof Human );
        assert.ok( cloneFriend !== bob.get("friend") );
        assert.strictEqual( cloneFriend.get("name"), "jack" );

    });

    it("model.clone() with circular reference (collection type)", () => {
        class File extends Model<File> {
            structure() {
                return {
                    name: Types.String,
                    files: Files
                };
            }
        }

        class Files extends Collection<File> {
            Model() {
                return File;
            }
        }

        const mainFile = new File({
            name: "main"
        });
        const file1 = new File({
            name: "file 1"
        });
        const file2 = new File({
            name: "file 2"
        });

        const files = new Files([
            file1,
            file2,
            // circular reference
            mainFile
        ]);

        mainFile.set({files});

        const clone = mainFile.clone();
        assert.ok( clone instanceof File );
        assert.ok( clone !== mainFile );
        assert.strictEqual( mainFile.get("name"), clone.get("name") );

        assert.ok( clone.get("files") instanceof Files );
        assert.ok( clone.get("files") !== mainFile.get("files") );

        assert.strictEqual( mainFile.get("files").at(1).get("name"), "file 2" );


        const filesClone = files.clone();
        assert.ok( filesClone instanceof Files );
        assert.ok( filesClone !== files );

        assert.strictEqual( filesClone.at(1).get("name"), "file 2" );
    });

    
    it("model.clone() with circular reference (any type)", () => {
        class SomeModel extends Model<SomeModel> {
            structure() {
                return {
                    any: Types.Any
                };
            }
        }

        const model1 = new SomeModel();
        const model2 = new SomeModel({
            any: model1
        });
        model1.set({any: model2}); 
        
        const model3 = new SomeModel({
            any: [{any: model1}]
        });

        const clone = model3.clone();
        const cloneModel1 = clone.get("any")[0].any;

        assert.ok( clone instanceof SomeModel );
        assert.ok( cloneModel1 instanceof SomeModel );
        assert.ok( cloneModel1 !== model1 );

        assert.ok( 
            cloneModel1 === cloneModel1.get("any").get("any")
        );
    });
});

"use strict";

const {Model} = require("../../lib/index");
const assert = require("assert");
const {eol} = require("../../lib/utils");

describe("Model tests", () => {

    it("create model with data", () => {

        class SomeModel extends Model {
            static structure() {
                return {
                    prop: "string"
                };
            }
        }

        let data = {
            prop: "nice"
        };
        let model = new SomeModel(data);

        assert.strictEqual( model.get("prop"), "nice" );
        assert.strictEqual( model.data.prop, "nice" );

        assert.ok( model.data != data );
    });

    it("create model without data", () => {

        class SomeModel extends Model {
            static structure() {
                return {
                    prop: "string"
                };
            }
        }

        let model = new SomeModel();

        assert.strictEqual( model.get("prop"), null );
        assert.strictEqual( model.data.prop, null );
    });

    it("default value", () => {
        let model;
        class SomeModel extends Model {
            static structure() {
                return {
                    prop: {
                        type: "string",
                        default: "default"
                    }
                };
            }
        }

        model = new SomeModel();
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
        let now = Date.now();

        class SomeModel extends Model {
            static structure() {
                return {
                    now: {
                        type: "number",
                        default: () => Date.now()
                    }
                };
            }
        }

        let model = new SomeModel();

        assert.ok(
            model.data.now >= now
        );
    });

    it("set value", () => {

        class SomeModel extends Model {
            static structure() {
                return {
                    name: "string",
                    age: "number"
                };
            }
        }

        let model = new SomeModel();
        let data = model.data;

        assert.strictEqual( model.get("name"), null );
        assert.strictEqual( model.data.name, null );
        assert.strictEqual( model.get("age"), null );
        assert.strictEqual( model.data.age, null );
        
        model.set("name", "nice");
        assert.equal( model.get("name"), "nice" );
        assert.equal( model.data.name, "nice" );
        assert.strictEqual( model.get("age"), null );
        assert.strictEqual( model.data.age, null );
        
        assert.ok( data != model.data );
        data = model.data;

        model.set("name", null);
        assert.strictEqual( model.get("name"), null );
        assert.strictEqual( model.data.name, null );
        assert.strictEqual( model.get("age"), null );
        assert.strictEqual( model.data.age, null );

        assert.ok( data != model.data );
        data = model.data;

        model.set({name: "test"});
        assert.equal( model.get("name"), "test" );
        assert.equal( model.data.name, "test" );
        assert.strictEqual( model.get("age"), null );
        assert.strictEqual( model.data.age, null );

        assert.ok( data != model.data );
        data = model.data;

        model.set("age", 101);
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
        class SomeModel extends Model {
            static structure() {
                return {
                    prop: "string"
                };
            }
        }

        let model = new SomeModel();

        model.set("prop", "x");
        assert.equal( model.get("prop"), "x" );
        assert.equal( model.data.prop, "x" );
        
        let data = model.data;

        assert.throws(
            () => {
                model.set("some", "1");
            }, err =>
                err.message == "unknown property: some"
        );

        // invalid action cannot change object
        assert.equal( model.get("prop"), "x" );
        assert.equal( model.data.prop, "x" );

        assert.ok( model.data === data );


        assert.throws(
            () => {
                new SomeModel({
                    some: "x"
                });
            },
            err =>
                err.message == "unknown property: some"
        );
    });


    it("model.data is freeze object", () => {
        class SomeModel extends Model {
            static structure() {
                return {
                    prop: "string"
                };
            }
        }

        let model = new SomeModel();

        assert.throws(
            () => {
                model.data.prop = "a";
            }, 
            err =>
                /Cannot assign to read only property/.test(err.message)
        );

        model.set("prop", "x");
        assert.equal( model.get("prop"), "x" );
        assert.equal( model.data.prop, "x" );

        assert.throws(
            () => {
                model.data.prop = "y";
            }, err =>
                /Cannot assign to read only property/.test(err.message)
        );

        assert.equal( model.get("prop"), "x" );
        assert.equal( model.data.prop, "x" );
    });

    it("keep data if hasn't changes", () => {
        class SomeModel extends Model {
            static structure() {
                return {
                    prop: "string"
                };
            }
        }

        let model = new SomeModel({
            prop: "value"
        });

        let data = model.data;

        model.set("prop", "value");
        assert.ok( model.data == data );

        model.set({
            prop: "value"
        });
        assert.ok( model.data == data );
    });

    it("model.hasProperty", () => {
        class SomeModel extends Model {
            static structure() {
                return {
                    prop: "string"
                };
            }
        }

        let model = new SomeModel();

        assert.strictEqual(
            model.hasProperty("prop"),
            true
        );

        assert.strictEqual(
            model.hasProperty("unknown"),
            false
        );

        assert.strictEqual(
            model.hasProperty("hasOwnProperty"),
            false
        );
    });

    it("model.hasValue", () => {
        class SomeModel extends Model {
            static structure() {
                return {
                    name: "string",
                    age: "number"
                };
            }
        }

        let model = new SomeModel({
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
        assert.strictEqual(
            model.hasValue("prop"),
            false
        );
    });

    it("model.toJSON", () => {
        class SomeModel extends Model {
            static structure() {
                return {
                    name: "string",
                    age: "number"
                };
            }
        }

        let model = new SomeModel();

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
        class SomeModel extends Model {
            static structure() {
                return {
                    name: "string",
                    age: "number"
                };
            }

            prepareJSON(json) {
                delete json.age;
            }
        }

        let model = new SomeModel();

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
        class SomeModel extends Model {
            static structure() {
                return {
                    name: {
                        type: "string",
                        required: true
                    }
                };
            }
        }

        let model = new SomeModel({
            name: "test"
        });

        assert.deepEqual(model.data, {
            name: "test"
        });

        let clone = model.clone();

        assert.deepEqual(clone.data, {
            name: "test"
        });
    });

    
    it("extends from another Model with structure", () => {
        class FirstLevel extends Model {
            static structure() {
                return {
                    lvl1: "string"
                };
            }
        }

        class SecondLevel extends FirstLevel {
            static structure() {
                return {
                    lvl2: "string"
                };
            }
        }

        // create models without errors
        new FirstLevel({ lvl1: "1"});
        new SecondLevel({ lvl2: "2" });
    });

    it("custom toJSON, for field", () => {
        class SomeModel extends Model {
            static structure() {
                return {
                    name: "string",
                    self: {
                        type: SomeModel,
                        toJSON: model =>
                            model.get("name")
                    }
                };
            }
        }

        let model = new SomeModel({
            name: "circular"
        });

        model.set("self", model);

        assert.deepEqual(
            model.toJSON(),
            {
                name: "circular",
                self: "circular"
            }
        );
    });

    it("custom toJSON, for any field", () => {
        class SomeModel extends Model {
            static structure() {
                return {
                    "*": {
                        type: SomeModel,
                        toJSON: () =>
                            "nice"
                    }
                };
            }
        }

        let model = new SomeModel();
        model.set("self", model);
        model.set("empty", null);

        assert.deepEqual(
            model.toJSON(),
            {
                self: "nice",
                empty: null
            }
        );
    });

    it("clone, for any field", () => {
        class SomeModel extends Model {
            static structure() {
                return {
                    "*": "*"
                };
            }
        }

        let model = new SomeModel();
        model.set("some", 12);
        model.set("empty", null);

        assert.deepEqual(
            model.clone().data,
            {
                some: 12,
                empty: null
            }
        );
    });

    it("register new type", () => {
        
        class CustomType extends Model.Type {
            prepare(value) {
                return +value * 2;
            }
        }

        Model.registerType("custom", CustomType);

        class SomeModel extends Model {
            static structure() {
                return {
                    prop: "custom"
                };
            }
        }

        let model = new SomeModel({
            prop: "10"
        });

        assert.strictEqual(model.data.prop, 20);
    });

    
    it("custom prepare field", () => {
        class SomeModel extends Model {
            static structure() {
                return {
                    money: {
                        type: "number",
                        default: 1,
                        prepare: value =>
                            value * 2
                    }
                };
            }
        }

        let model = new SomeModel();
        assert.strictEqual( model.data.money, 2 );

        model.set("money", 12);
        assert.strictEqual( model.data.money, 24 );

        model.set("money", null);
        assert.strictEqual( model.data.money, null );
    });

    it("check value type after custom prepare", () => {
        class SomeModel extends Model {
            static structure() {
                return {
                    name: "text"
                };
            }

            prepare(data) {
                data.name = 10;
            }
        }

        let model = new SomeModel();
        assert.strictEqual( model.data.name, "10" );

        model.set("name", 12);
        assert.strictEqual( model.data.name, "10" );
    });

    it("check value type after custom prepare (any key)", () => {
        class SomeModel extends Model {
            static structure() {
                return {
                    "*": "text"
                };
            }

            prepare(data) {
                data.name = 10;
            }
        }

        let model = new SomeModel();
        assert.strictEqual( model.data.name, "10" );

        model.set("name", 12);
        assert.strictEqual( model.data.name, "10" );
    });

    it("custom prepare field and standard prepares (round, trim, emptyAsNull)", () => {
        class SomeModel extends Model {
            static structure() {
                return {
                    name: {
                        type: "string",
                        default: "  ",
                        trim: true,
                        emptyAsNull: true,
                        prepare: value =>
                            value[0].toUpperCase() + 
                                value.slice(1).toLowerCase()
                    },
                    age: {
                        type: "number",
                        default: 0,
                        zeroAsNull: true,
                        prepare: value =>
                            +(value).toFixed(0)
                    }
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
        function upFirstLetter(name) {
            return (
                name[0].toUpperCase() + 
                    name.slice(1).toLowerCase()
            );
        }

        class SomeModel extends Model {
            static structure() {
                return {
                    firstName: {
                        type: "string",
                        trim: true,
                        emptyAsNull: true,
                        prepare: name =>
                            upFirstLetter( name )
                    },
                    lastName: {
                        type: "string",
                        trim: true,
                        emptyAsNull: true,
                        prepare: name =>
                            upFirstLetter( name )
                    },
                    fullName: {
                        type: "string",
                        trim: true,
                        emptyAsNull: true
                    }
                };
            }

            prepare(data) {
                // data.firstName can be null
                let firstName = data.firstName || "";
                // data.lastName can be null
                let lastName = data.lastName || "";

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

        class FileModel extends Model {
            static structure() {
                return {
                    name: {
                        type: "text",
                        required: true
                    },
                    path: "text"
                };
            }

            prepare(data) {
                data.name = data.path.split("/").pop();
            }
        }

        let file = new FileModel({
            path: "test/name.txt"
        });
        assert.strictEqual( file.data.name, "name.txt" );
    });

    it("equal with same class model", () => {

        class SomeModel extends Model {
            static structure() {
                return {
                    prop: "string"
                };
            }
        }

        let firstModel = new SomeModel({
            prop: "first"
        });
        let secondModel = new SomeModel({
            prop: "second"
        });

        assert.ok( !firstModel.equal( secondModel ) );
        assert.ok( !secondModel.equal( firstModel ) );

        secondModel.set("prop", "first");

        assert.ok( firstModel.equal( secondModel ) );
        assert.ok( secondModel.equal( firstModel ) );
    });

    it("equal model with another structure", () => {

        class Model1 extends Model {
            static structure() {
                return {
                    some: "number"
                };
            }
        }
        class Model2 extends Model {
            static structure() {
                return {
                    "*": "*"
                };
            }
        }


        let firstModel = new Model1({
            some: 1
        });
        let secondModel = new Model2({
            some: 1
        });

        assert.ok( firstModel.equal( secondModel ) );
        assert.ok( secondModel.equal( firstModel ) );

        secondModel.set("another", "value");

        assert.ok( !firstModel.equal( secondModel ) );
        assert.ok( !secondModel.equal( firstModel ) );
    });


    it("max error length on prepare", () => {
        class SomeModel extends Model {
            static structure() {
                return {
                    prop: "number"
                };
            }
        }

        assert.throws(
            () => {
                new SomeModel({
                    prop: "X1234568790123456879012345687901234568790123456879"
                });
            }, err =>
                err.message == "invalid number for prop: \"X1234568790123456879012345687901234568790123456879\""
        );

        assert.throws(
            () => {
                new SomeModel({
                    prop: "X1234568790123456879012345687901234568790123456879y"
                });
            }, err =>
                err.message == "invalid number for prop: \"X1234568790123456879012345687901234568790123456879...\""
        );

        assert.throws(
            () => {
                new SomeModel({
                    prop: {some: 1}
                });
            }, err =>
                err.message == "invalid number for prop: {\"some\":1}"
        );

        assert.throws(
            () => {
                new SomeModel({
                    prop: {some: 1, sub: {bigString: "X1234568790123456879012345687901234568790123456879"}}
                });
            }, err =>
                err.message == "invalid number for prop: {\"some\":1,\"sub\":{\"bigString\":\"X1234568790123456879..."
        );
    });

    it("test eol on linux", () => {
        
        eol.define( "linux" );

        class SomeModel extends Model {
            static structure() {
                return {
                    arr: ["number"],
                    obj: {element: "number"}
                };
            }
        }

        assert.throws(
            () => {
                new SomeModel({
                    arr: ["wrong"]
                });
            }, err =>
                err.message == "invalid array[number] for arr: [\"wrong\"],\n invalid number for 0: \"wrong\""
        );

        assert.throws(
            () => {
                new SomeModel({
                    obj: {prop: "wrong"}
                });
            }, err =>
                err.message == "invalid object[number] for obj: {\"prop\":\"wrong\"},\n invalid number for prop: \"wrong\""
        );
    });

    it("test eol on windows", () => {
        
        eol.define( "windows" );

        class SomeModel extends Model {
            static structure() {
                return {
                    arr: ["number"],
                    obj: {element: "number"}
                };
            }
        }

        assert.throws(
            () => {
                new SomeModel({
                    arr: ["wrong"]
                });
            }, err =>
                err.message == "invalid array[number] for arr: [\"wrong\"],\r\n invalid number for 0: \"wrong\""
        );

        assert.throws(
            () => {
                new SomeModel({
                    obj: {prop: "wrong"}
                });
            }, err =>
                err.message == "invalid object[number] for obj: {\"prop\":\"wrong\"},\r\n invalid number for prop: \"wrong\""
        );
    });
});
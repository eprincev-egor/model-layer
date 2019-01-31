"use strict";

const Model = require("../lib/Model");
const assert = require("assert");

describe("Model", () => {
    
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

    it("model without structure", () => {
        
        class SomeModel extends Model {}

        try {
            new SomeModel();
            
            throw new Error("expected error");
        } catch(err) {
            assert.equal(err.message, "static SomeModel.structure() is not declared");
        }

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

        try {
            model.set("some", "1");
            
            throw new Error("expected error");
        } catch(err) {
            assert.equal(err.message, "unknown property some");
        }

        // invalid action cannot change object
        assert.equal( model.get("prop"), "x" );
        assert.equal( model.data.prop, "x" );

        assert.ok( model.data === data );


        try {
            new SomeModel({
                some: "x"
            });
            
            throw new Error("expected error");
        } catch(err) {
            assert.equal(err.message, "unknown property some");
        }
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

        try {
            model.data.prop = "a";
            
            throw new Error("expected error");
        } catch(err) {
            assert.ok(
                /Cannot assign to read only property/.test(err.message)
            );
        }

        model.set("prop", "x");
        assert.equal( model.get("prop"), "x" );
        assert.equal( model.data.prop, "x" );

        try {
            model.data.prop = "y";
            
            throw new Error("expected error");
        } catch(err) {
            assert.ok(
                /Cannot assign to read only property/.test(err.message)
            );
        }

        assert.equal( model.get("prop"), "x" );
        assert.equal( model.data.prop, "x" );
    });

    it("required field", () => {
        class SomeModel extends Model {
            static structure() {
                return {
                    name: {
                        type: "string",
                        required: true
                    },
                    age: "number"
                };
            }
        }

        try {
            new SomeModel();
            
            throw new Error("expected error");
        } catch(err) {
            assert.equal(err.message, "required name");
        }


        let model = new SomeModel({
            name: "Andrew"
        });
        assert.equal( model.get("name"), "Andrew" );
        assert.equal( model.data.name, "Andrew" );

        model.set("age", 40);
        assert.strictEqual( model.get("age"), 40 );
        assert.strictEqual( model.data.age, 40 );

        try {
            model.set("name", null);
            
            throw new Error("expected error");
        } catch(err) {
            assert.equal(err.message, "required name");
        }


        assert.equal( model.get("name"), "Andrew" );
        assert.equal( model.data.name, "Andrew" );
        assert.strictEqual( model.get("age"), 40 );
        assert.strictEqual( model.data.age, 40 );
    });

    it("validate method", () => {
        class AgeModel extends Model {
            static structure() {
                return {
                    age: {
                        type: "number",
                        default: 0
                    }
                };
            }

            validate(data) {
                if ( data.age < 0 ) {
                    throw new Error("invalid age");
                }
            }
        }

        // validate in constructor
        try {
            new AgeModel({
                age: -1
            });
            
            throw new Error("expected error");
        } catch(err) {
            assert.equal(err.message, "invalid age");
        }


        let model = new AgeModel({
            age: 100
        });

        // validate in set
        try {
            model.set({
                age: -100
            });
            
            throw new Error("expected error");
        } catch(err) {
            assert.equal(err.message, "invalid age");
        }

        // error in validate, returns previous state
        assert.equal( model.data.age, 100 );
    });

    it("cannot change state in validate method", () => {
        class AgeModel extends Model {
            static structure() {
                return {
                    age: {
                        type: "number",
                        default: 0
                    }
                };
            }

            validate(data) {
                data.age = 200;
            }
        }

        try {
            new AgeModel({ age: 1 });
            
            throw new Error("expected error");
        } catch(err) {
            assert.ok(
                /Cannot assign to read only property/.test(err.message)
            );
        }
    });

    it("this.data in validate is previous state", () => {
        class AgeModel extends Model {
            static structure() {
                return {
                    age: {
                        type: "number",
                        default: 100
                    }
                };
            }

            validate(data) {
                assert.equal( this.data.age, 100 );
                assert.equal( data.age, 200 );
            }
        }
        
        new AgeModel({
            age: 200
        });
    });

    it("validate field", () => {
        class AgeModel extends Model {
            static structure() {
                return {
                    age: {
                        type: "number",
                        default: 0,
                        validate: age =>
                            age >= 0
                    }
                };
            }
        }

        // validate in constructor
        try {
            new AgeModel({
                age: -1
            });
            
            throw new Error("expected error");
        } catch(err) {
            assert.equal(err.message, "invalid age: -1");
        }


        let model = new AgeModel({
            age: 100
        });

        // validate in set
        try {
            model.set({
                age: -100
            });
            
            throw new Error("expected error");
        } catch(err) {
            assert.equal(err.message, "invalid age: -100");
        }

        // error in validate, returns previous state
        assert.equal( model.data.age, 100 );
    });

    it("do not validate null value", () => {
        class SomeModel extends Model {
            static structure() {
                return {
                    prop: {
                        type: "string",
                        validate: value => 
                            value === "nice"
                    }
                };
            }
        }

        let model;

        // safety create empty model
        new SomeModel();

        // safety set null
        model = new SomeModel({
            prop: "nice"
        });

        assert.strictEqual(model.data.prop, "nice");


        model.set("prop", null);
        assert.strictEqual(model.data.prop, null);
    });


    it("validate field by RegExp", () => {
        class WordModel extends Model {
            static structure() {
                return {
                    word: {
                        type: "string",
                        validate: /^\w+$/
                    }
                };
            }
        }

        // validate in constructor
        try {
            new WordModel({
                word: " some 12123 "
            });
            
            throw new Error("expected error");
        } catch(err) {
            assert.equal(err.message, "invalid word: \" some 12123 \"");
        }


        let model = new WordModel({
            word: "test"
        });

        // validate in set
        try {
            model.set({
                word: "some wrong"
            });
            
            throw new Error("expected error");
        } catch(err) {
            assert.equal(err.message, "invalid word: \"some wrong\"");
        }

        // error in validate, returns previous state
        assert.equal( model.data.word, "test" );
    });

    it("enum validate", () => {
        class EnumModel extends Model {
            static structure() {
                return {
                    color: {
                        type: "string",
                        enum: ["red", "green", "blue"]
                    }
                };
            }
        }

        let model = new EnumModel();
        assert.strictEqual( model.data.color, null );

        // validate in set
        try {
            model.set({
                color: "orange"
            });
            
            throw new Error("expected error");
        } catch(err) {
            assert.equal(err.message, "invalid color: \"orange\"");
        }

        // error in validate, returns previous state
        assert.strictEqual( model.data.color, null );


        // validate in constructor
        try {
            new EnumModel({
                color: "dark blue"
            });
            
            throw new Error("expected error");
        } catch(err) {
            assert.equal(err.message, "invalid color: \"dark blue\"");
        }
    });

    it("isValid(data)", () => {
        class SomeModel extends Model {
            static structure() {
                return {
                    sale: {
                        type: "number",
                        required: true
                    },
                    buy: {
                        type: "number",
                        required: true
                    },
                    color: {
                        type: "string",
                        enum: ["red", "green", "blue"]
                    },
                    word: {
                        type: "string",
                        validate: /^\w+$/
                    },
                    age: {
                        type: "number",
                        validate: age => 
                            age > 0
                    },
                    prop: "string"
                };
            }

            validate(data) {
                if ( data.buy > data.sale ) {
                    throw new Error("invalid sale");
                }
            }
        }

        let model = new SomeModel({
            buy: 10,
            sale: 30
        });

        // valid
        assert.strictEqual(model.isValid({
            buy: 100,
            sale: 200
        }), true);

        // ignore required error, because isValid we using before .set
        assert.strictEqual(model.isValid({}), true);
            
        // buy > sale
        assert.strictEqual(model.isValid({
            buy: 1000
        }), false);

        // enum validate
        assert.strictEqual(model.isValid({
            buy: 100,
            sale: 200,
            color: "pink"
        }), false);

        // regexp validate
        assert.strictEqual(model.isValid({
            buy: 1,
            sale: 10,
            word: "wrong word"
        }), false);

        // function validate for field
        assert.strictEqual(model.isValid({
            buy: 1,
            sale: 2,
            age: -1
        }), false);

        // unknown property
        assert.strictEqual(model.isValid({
            buy: 1,
            sale: 101,
            xx: true
        }), false);

        // custom validate data
        assert.strictEqual(model.isValid({
            buy: 100,
            sale: 20
        }), false);

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

    it("listen changes", () => {
        class SomeModel extends Model {
            static structure() {
                return {
                    prop: "string"
                };
            }
        }

        let model = new SomeModel();

        let event;
        let counter = 0;
        model.on("change", (e) => {
            counter++;
            event = e;
        });

        model.set("prop", "some");

        assert.equal(counter, 1);
        assert.deepEqual(event, {
            prev: {
                prop: null
            },
            changes: {
                prop: "some"
            }
        });
    });

    it("listen change:prop", () => {
        class SomeModel extends Model {
            static structure() {
                return {
                    prop: "string"
                };
            }
        }

        let model = new SomeModel();

        let event;
        let counter = 0;
        model.on("change:prop", (e) => {
            counter++;
            event = e;
        });

        model.set("prop", "some");

        assert.equal(counter, 1);
        assert.deepEqual(event, {
            prev: {
                prop: null
            },
            changes: {
                prop: "some"
            }
        });
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

    it("const prop", () => {
        class SomeModel extends Model {
            static structure() {
                return {
                    name: {
                        type: "string",
                        const: true
                    }
                };
            }
        }

        let model = new SomeModel();

        assert.strictEqual( model.data.name, null );

        try {
            model.set("name", "new name");
            
            throw new Error("expected error");
        } catch(err) {
            assert.equal(err.message, "cannot assign to read only property: name");
        }


        model = new SomeModel({
            name: "Bob"
        });
        assert.equal( model.data.name, "Bob" );

        try {
            model.set("name", "new name");
            
            throw new Error("expected error");
        } catch(err) {
            assert.equal(err.message, "cannot assign to read only property: name");
        }
    });

    it("prepare number", () => {
        class SomeModel extends Model {
            static structure() {
                return {
                    age: {
                        type: "number",
                        default: "0"
                    }
                };
            }
        }
        let model;

        model = new SomeModel();
        assert.strictEqual( model.data.age, 0 );

        model = new SomeModel({
            age: "1"
        });
        assert.strictEqual( model.data.age, 1 );
        
        model.set("age", "2");
        assert.strictEqual( model.data.age, 2 );

        model.set("age", null);
        assert.strictEqual( model.data.age, null );

        model.set("age", "-2000.123");
        assert.strictEqual( model.data.age, -2000.123 );

        try {
            model.set("age", "wrong");
            throw new Error("expected error");
        } catch(err) {
            assert.equal(err.message, "invalid number for age: wrong");
        }

        try {
            model.set("age", {});
            throw new Error("expected error");
        } catch(err) {
            assert.equal(err.message, "invalid number for age: {}");
        }

        try {
            model.set("age", {age: 1});
            throw new Error("expected error");
        } catch(err) {
            assert.equal(err.message, "invalid number for age: {\"age\":1}");
        }

        try {
            model.set("age", false);
            throw new Error("expected error");
        } catch(err) {
            assert.equal(err.message, "invalid number for age: false");
        }

        try {
            model.set("age", true);
            throw new Error("expected error");
        } catch(err) {
            assert.equal(err.message, "invalid number for age: true");
        }

        try {
            model.set("age", -1 / 0);
            throw new Error("expected error");
        } catch(err) {
            assert.equal(err.message, "invalid number for age: -Infinity");
        }

        try {
            model.set("age", 1 / 0);
            throw new Error("expected error");
        } catch(err) {
            assert.equal(err.message, "invalid number for age: Infinity");
        }

        try {
            model.set("age", NaN);
            throw new Error("expected error");
        } catch(err) {
            assert.equal(err.message, "invalid number for age: NaN");
        }

        try {
            model.set("age", [0]);
            throw new Error("expected error");
        } catch(err) {
            assert.equal(err.message, "invalid number for age: [0]");
        }

        assert.strictEqual( model.data.age, -2000.123 );
    });

    
    it("prepare string", () => {
        class SomeModel extends Model {
            static structure() {
                return {
                    name: {
                        type: "string",
                        default: 10
                    }
                };
            }
        }
        let model;

        model = new SomeModel();
        assert.strictEqual( model.data.name, "10" );

        model = new SomeModel({
            name: -20
        });
        assert.strictEqual( model.data.name, "-20" );
        
        model.set("name", 1.1);
        assert.strictEqual( model.data.name, "1.1" );

        model.set("name", null);
        assert.strictEqual( model.data.name, null );

        model.set("name", "nice");
        assert.strictEqual( model.data.name, "nice" );

        
        try {
            model.set("name", {});
            throw new Error("expected error");
        } catch(err) {
            assert.equal(err.message, "invalid string for name: {}");
        }

        try {
            model.set("name", {name: 1});
            throw new Error("expected error");
        } catch(err) {
            assert.equal(err.message, "invalid string for name: {\"name\":1}");
        }

        try {
            model.set("name", false);
            throw new Error("expected error");
        } catch(err) {
            assert.equal(err.message, "invalid string for name: false");
        }

        try {
            model.set("name", true);
            throw new Error("expected error");
        } catch(err) {
            assert.equal(err.message, "invalid string for name: true");
        }

        try {
            model.set("name", -1 / 0);
            throw new Error("expected error");
        } catch(err) {
            assert.equal(err.message, "invalid string for name: -Infinity");
        }

        try {
            model.set("name", 1 / 0);
            throw new Error("expected error");
        } catch(err) {
            assert.equal(err.message, "invalid string for name: Infinity");
        }

        try {
            model.set("name", NaN);
            throw new Error("expected error");
        } catch(err) {
            assert.equal(err.message, "invalid string for name: NaN");
        }

        try {
            model.set("name", [0]);
            throw new Error("expected error");
        } catch(err) {
            assert.equal(err.message, "invalid string for name: [0]");
        }

        assert.strictEqual( model.data.name, "nice" );
    });
});
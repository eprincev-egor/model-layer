"use strict";

const Model = require("../../lib/Model");
const assert = require("assert");

describe("Model other tests", () => {

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

    it("model.toJSON with custom models", () => {
        class CarModel extends Model {
            static structure() {
                return {
                    id: "number",
                    color: "string"
                };
            }
        }

        class UserModel extends Model {
            static structure() {
                return {
                    name: "string",
                    car: CarModel
                };
            }
        }

        let userModel = new UserModel({
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

    it("model.toJSON with array of models", () => {
        class TaskModel extends Model {
            static structure() {
                return {
                    name: "string"
                };
            }
        }

        class UserModel extends Model {
            static structure() {
                return {
                    name: "string",
                    tasks: [TaskModel]
                };
            }
        }

        let userModel = new UserModel({
            name: "Jack",
            tasks: [
                {name: "task 1"},
                {name: "task 2"}
            ]
        });

        assert.deepEqual(
            userModel.toJSON(),
            {
                name: "Jack",
                tasks: [
                    {name: "task 1"},
                    {name: "task 2"}
                ]
            }
        );
    });

    it("model.toJSON with object property", () => {
        class SomeModel extends Model {
            static structure() {
                return {
                    names: "object"
                };
            }
        }

        let model = new SomeModel({
            names: {
                Bob: true,
                James: true
            }
        });

        assert.deepEqual(
            model.toJSON(),
            {
                names: {
                    Bob: true,
                    James: true
                }
            }
        );
    });

    it("model.clone()", () => {
        class SomeModel extends Model {
            static structure() {
                return {
                    name: "string",
                    ids: ["number"]
                };
            }
        }

        let model = new SomeModel({
            name: "test",
            ids: [1, 2, 3]
        });

        assert.deepEqual(model.data, {
            name: "test",
            ids: [1, 2, 3]
        });

        let clone = model.clone();

        assert.ok( clone instanceof SomeModel );
        assert.ok( clone != model );

        assert.deepEqual(clone.data, {
            name: "test",
            ids: [1, 2, 3]
        });

        // change clone model
        clone.set({
            name: "clone",
            ids: [3, 4]
        });

        assert.deepEqual(model.data, {
            name: "test",
            ids: [1, 2, 3]
        });

        assert.deepEqual(clone.data, {
            name: "clone",
            ids: [3, 4]
        });

        // change original model
        model.set({
            name: "original",
            ids: [8]
        });

        assert.deepEqual(model.data, {
            name: "original",
            ids: [8]
        });

        assert.deepEqual(clone.data, {
            name: "clone",
            ids: [3, 4]
        });
    });


    it("model.clone() with child model", () => {
        class CarModel extends Model {
            static structure() {
                return {
                    id: "number",
                    color: "string"
                };
            }
        }

        class UserModel extends Model {
            static structure() {
                return {
                    name: "string",
                    car: CarModel
                };
            }
        }

        let carModel = new CarModel({
            id: 1,
            color: "red"
        });

        let userModel = new UserModel({
            name: "Oliver",
            car: carModel
        });

        assert.deepEqual(userModel.toJSON(), {
            name: "Oliver",
            car: {
                id: 1,
                color: "red"
            }
        });


        let clone = userModel.clone();

        assert.deepEqual(clone.toJSON(), {
            name: "Oliver",
            car: {
                id: 1,
                color: "red"
            }
        });

        assert.ok( clone.get("car") != userModel.get("car") );
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

        assert.deepEqual(
            model.toJSON(),
            {
                self: "nice"
            }
        );
    });

});
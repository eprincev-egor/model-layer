"use strict";

const Model = require("../../lib/Model");
const assert = require("assert");

describe("Model with any property", () => {
    
    it("any number", () => {

        class SomeModel extends Model {
            static structure() {
                return {
                    "*": "number"
                };
            }
        }

        let model = new SomeModel({
            test: 1,
            value: 2
        });

        assert.deepEqual(model.data, {
            test: 1,
            value: 2
        });

        assert.strictEqual(
            model.get("test"),
            1
        );

        assert.strictEqual(
            model.get("value"),
            2
        );

        assert.throws(
            () => {
                new SomeModel({
                    x: "wrong"
                });
            }, 
            err => 
                err.message == "invalid number for x: \"wrong\""
        );


        // test method: y
        model.set("y", 3);
        assert.strictEqual(
            model.get("y"),
            3
        );


        assert.deepEqual(model.data, {
            test: 1,
            value: 2,
            y: 3
        });

        // model.data should be frozen
        assert.throws(
            () => {
                model.data.y = 10;
            },
            err =>
                /Cannot assign to read only property/.test(err.message)
        );

        assert.throws(
            () => {
                model.data.prop = 10;
            },
            err =>
                /Cannot add property prop/.test(err.message)
        );
    });

    it("listen change event on any property", () => {

        class SomeModel extends Model {
            static structure() {
                return {
                    "*": "string"
                };
            }
        }

        let model = new SomeModel();

        assert.deepEqual(model.data, {});

        let event;
        let counter = 0;
        model.on("change:new", (e) => {
            counter++;
            event = e;
        });

        model.set("new", "value");

        assert.equal(counter, 1);
        assert.deepEqual(event, {
            prev: {},
            changes: {
                new: "value"
            }
        });
    });

    
    it("any keys and declared keys", () => {

        class SomeModel extends Model {
            static structure() {
                return {
                    age: {
                        type: "number",
                        default: 0
                    },
                    "*": "string"
                };
            }
        }

        let model = new SomeModel();

        assert.deepEqual(model.data, {
            age: 0
        });

        assert.throws(
            () => {
                model.set("age", "wrong");
            },
            err =>
                err.message == "invalid number for age: \"wrong\""
        );

        assert.throws(
            () => {
                model.set("any", {});
            },
            err =>
                err.message == "invalid string for any: {}"
        );


        assert.deepEqual(model.data, {
            age: 0
        });


        model.set({
            name: "Bob",
            key: "xxx"
        });

        assert.deepEqual(model.data, {
            age: 0,
            name: "Bob",
            key: "xxx"
        });
    });

    it("prepare any value", () => {
        class SomeModel extends Model {
            static structure() {
                return {
                    "*": {
                        type: "string",
                        prepare: value =>
                            value.toUpperCase().trim()
                    }
                };
            }
        }

        let model = new SomeModel({
            a: " super ",
            b: "Good "
        });

        assert.deepEqual(model.data, {
            a: "SUPER",
            b: "GOOD"
        });

        model.set({
            b: "b",
            c: "water"
        });

        assert.deepEqual(model.data, {
            a: "SUPER",
            b: "B",
            c: "WATER"
        });
    });

    it("validate any value", () => {
        class SomeModel extends Model {
            static structure() {
                return {
                    "*": {
                        type: "number",
                        validate: value =>
                            value >= 10
                    }
                };
            }
        }

        assert.throws(
            () => {
                new SomeModel({
                    prop: 9
                });
            },
            err =>
                err.message == "invalid prop: 9"
        );

        let model = new SomeModel({
            nice: 22
        });

        assert.deepEqual(model.data, {
            nice: 22
        });

        assert.throws(
            () => {
                model.set({
                    nice: 1
                });
            },
            err =>
                err.message == "invalid nice: 1"
        );

        assert.deepEqual(model.data, {
            nice: 22
        });
    });

    it("validate any key by RegExp", () => {
        class SomeModel extends Model {
            static structure() {
                return {
                    "*": {
                        type: "string",
                        key: /\d+/
                    }
                };
            }
        }

        assert.throws(
            () => {
                new SomeModel({
                    wrong: "key"
                });
            },
            err =>
                err.message == "invalid key: wrong"
        );

        let model = new SomeModel({
            1: "nice"
        });

        assert.deepEqual(model.data, {
            1: "nice"
        });

        
        assert.throws(
            () => {
                model.set({
                    wrong: "key"
                });
            },
            err =>
                err.message == "invalid key: wrong"
        );

        
        assert.deepEqual(model.data, {
            1: "nice"
        });
    });

    it("validate any key by function", () => {
        class SomeModel extends Model {
            static structure() {
                return {
                    "*": {
                        type: "string",
                        key: key =>
                            key.startsWith("$")
                    }
                };
            }
        }

        assert.throws(
            () => {
                new SomeModel({
                    wrong: "key"
                });
            },
            err =>
                err.message == "invalid key: wrong"
        );

        let model = new SomeModel({
            $name: "nice"
        });

        assert.deepEqual(model.data, {
            $name: "nice"
        });

        assert.throws(
            () => {
                model.set({
                    wrong: "key"
                });
            },
            err =>
                err.message == "invalid key: wrong"
        );
        
        assert.deepEqual(model.data, {
            $name: "nice"
        });

    });

    it("toJSON() with any key", () => {

        class SomeModel extends Model {
            static structure() {
                return {
                    "*": "object"
                };
            }
        }

        let model = new SomeModel({
            manager: {name: "Bob"},
            company: {inn: "123"}
        });

        assert.deepEqual(model.toJSON(), {
            manager: {name: "Bob"},
            company: {inn: "123"}
        });
    });

    it("clone() with any key", () => {

        class SomeModel extends Model {
            static structure() {
                return {
                    "*": "object"
                };
            }
        }

        let model = new SomeModel({
            manager: {name: "Bob"},
            company: {inn: "123"}
        });

        let clone = model.clone();

        assert.deepEqual(clone.toJSON(), {
            manager: {name: "Bob"},
            company: {inn: "123"}
        });

        assert.ok(
            model.get("manager") != clone.get("manager")
        );

        assert.ok(
            model.get("company") != clone.get("company")
        );
    });

});
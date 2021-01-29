

import {Model, Types} from "../../lib/index";
import assert from "assert";

describe("Model with any property", () => {

    it("any key and any value", () => {
        class SomeModel extends Model<SomeModel> {
            structure() {
                return {
                    "*": Types.Any
                };
            }
        }

        const model = new SomeModel();
        assert.deepEqual(model.row, {});

        model.set({x: 10});
        assert.strictEqual(model.row.x, 10);
        
        model.set({y: "text"});
        assert.strictEqual(model.row.y, "text");

        model.set({z: true});
        assert.strictEqual(model.row.z, true);


        model.set({
            x: false,
            y: false,
            z: false
        });

        assert.deepEqual(model.row, {
            x: false,
            y: false,
            z: false
        });
    });
    
    it("any number", () => {

        class SomeModel extends Model<SomeModel> {
            structure() {
                return {
                    "*": Types.Number
                };
            }
        }

        const model = new SomeModel({
            test: 1,
            value: 2
        });

        assert.deepEqual(model.row, {
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
                const someModel = new (SomeModel as any)({
                    x: "wrong"
                });
            }, 
            (err: Error) => 
                err.message === "invalid number for x: \"wrong\""
        );


        // test method: y
        model.set({y: 3});
        assert.strictEqual(
            model.get("y"),
            3
        );


        assert.deepEqual(model.row, {
            test: 1,
            value: 2,
            y: 3
        });

        // model.row should be frozen
        assert.throws(
            () => {
                const anyModel = model as any;
                anyModel.row.y = 10;
            },
            (err: Error) =>
                /Cannot assign to read only property/.test(err.message)
        );

        assert.throws(
            () => {
                const anyModel = model as any;
                anyModel.row.prop = 10;
            },
            (err: Error) =>
                /Cannot add property prop/.test(err.message)
        );
    });

    it("listen change event on any property", () => {
        
        class SomeModel extends Model<SomeModel> {
            structure() {
                return {
                    "*": Types.String
                };
            }
        }

        const model = new SomeModel();

        assert.deepEqual(model.row, {});

        let event;
        let counter = 0;
        model.on("change", "new", (e) => {
            counter++;
            event = e;
        });

        model.set({new: "value"});

        assert.equal(counter, 1);
        assert.deepEqual(event, {
            prev: {},
            changes: {
                new: "value"
            }
        });
    });

    
    it("any keys and declared keys", () => {
        
        class SomeModel extends Model<SomeModel> {
            structure() {
                return {
                    "age": Types.Number({
                        default: 0
                    }),
                    "*": Types.String
                };
            }
        }

        const model = new SomeModel();

        assert.deepEqual(model.row, {
            age: 0
        });

        assert.throws(
            () => {
                const anyModel = model as any;
                anyModel.set({age: "wrong"});
            },
            (err: Error) =>
                err.message === "invalid number for age: \"wrong\""
        );

        assert.throws(
            () => {
                const anyModel = model as any;
                anyModel.set({any: {}});
            },
            (err: Error) =>
                err.message === "invalid string for any: {}"
        );


        assert.deepEqual(model.row, {
            age: 0
        });


        model.set({
            name: "Bob",
            key: "xxx"
        });

        assert.deepEqual(model.row, {
            age: 0,
            name: "Bob",
            key: "xxx"
        });
    });

    it("prepare any value", () => {
        class SomeModel extends Model<SomeModel> {
            structure() {
                return {
                    "*": Types.String({
                        prepare: (value) =>
                            value.toUpperCase().trim()
                    })
                };
            }
        }

        const model = new SomeModel({
            a: " super ",
            b: "Good "
        });

        assert.deepEqual(model.row, {
            a: "SUPER",
            b: "GOOD"
        });

        model.set({
            b: "b",
            c: "water"
        });

        assert.deepEqual(model.row, {
            a: "SUPER",
            b: "B",
            c: "WATER"
        });
    });

    it("validate any value", () => {
        
        class SomeModel extends Model<SomeModel> {
            structure() {
                return {
                    "*": Types.Number({
                        validate: (value) =>
                            value >= 10
                    })
                };
            }
        }

        assert.throws(
            () => {
                const someModel = new SomeModel({
                    prop: 9
                });
            },
            (err: Error) =>
                err.message === "invalid prop: 9"
        );

        const model = new SomeModel({
            nice: 22
        });

        assert.deepEqual(model.row, {
            nice: 22
        });

        assert.throws(
            () => {
                model.set({
                    nice: 1
                });
            },
            (err: Error) =>
                err.message === "invalid nice: 1"
        );

        assert.deepEqual(model.row, {
            nice: 22
        });
    });

    it("validate any key by RegExp", () => {
        interface IAnyString {
            [key: string]: string;
        }

        class SomeModel extends Model<SomeModel> {
            structure() {
                return {
                    "*": Types.String({
                        key: /\d+/
                    })
                };
            }
        }

        assert.throws(
            () => {
                const someModel = new SomeModel({
                    wrong: "key"
                });
            },
            (err: Error) =>
                err.message === "invalid key: wrong"
        );

        const model = new SomeModel({
            1: "nice"
        });

        assert.deepEqual(model.row, {
            1: "nice"
        });

        
        assert.throws(
            () => {
                model.set({
                    wrong: "key"
                });
            },
            (err: Error) =>
                err.message === "invalid key: wrong"
        );

        
        assert.deepEqual(model.row, {
            1: "nice"
        });
    });

    it("validate any key by function", () => {

        class SomeModel extends Model<SomeModel> {
            structure() {
                return {
                    "*": Types.String({
                        type: "string",
                        key: (key) =>
                            key.startsWith("$")
                    })
                };
            }
        }

        assert.throws(
            () => {
                const someModel = new SomeModel({
                    wrong: "key"
                });
            },
            (err: Error) =>
                err.message === "invalid key: wrong"
        );

        const model = new SomeModel({
            $name: "nice"
        });

        assert.deepEqual(model.row, {
            $name: "nice"
        });

        assert.throws(
            () => {
                model.set({
                    wrong: "key"
                });
            },
            (err: Error) =>
                err.message === "invalid key: wrong"
        );
        
        assert.deepEqual(model.row, {
            $name: "nice"
        });

    });

    it("toJSON() with any key", () => {

        class SomeModel extends Model<SomeModel> {
            structure() {
                return {
                    "*": Types.Object({
                        element: Types.Any
                    })
                };
            }
        }

        const model = new SomeModel({
            manager: {name: "Bob"},
            company: {inn: "123"}
        });

        assert.deepEqual(model.toJSON(), {
            manager: {name: "Bob"},
            company: {inn: "123"}
        });
    });

    it("clone() with any key", () => {

        class SomeModel extends Model<SomeModel> {
            structure() {
                return {
                    "*": Types.Object({
                        element: Types.Any
                    })
                };
            }
        }

        const model = new SomeModel({
            manager: {name: "Bob"},
            company: {inn: "123"}
        });

        const clone = model.clone();

        assert.deepEqual(clone.toJSON(), {
            manager: {name: "Bob"},
            company: {inn: "123"}
        });

        assert.ok(
            model.get("manager") !== clone.get("manager")
        );

        assert.ok(
            model.get("company") !== clone.get("company")
        );
    });

});

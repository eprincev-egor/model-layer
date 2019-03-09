"use strict";

const {Model} = require("../../lib/index");
const assert = require("assert");

describe("validate and prepare model structure", () => {
    
    it("model without structure", () => {
        
        class SomeModel extends Model {}

        assert.throws(
            () => {
                new SomeModel();
            },
            err =>
                err.message == "static SomeModel.structure() is not declared"
        );

    });

    it("unknown type", () => {
        class InvalidModel extends Model {
            static structure() {
                return {
                    prop: "wrong"
                };
            }
        }

        assert.throws(
            () => {
                new InvalidModel();
            },
            err =>
                err.message == "prop: unknown type: wrong"
        );

        class CustomClass {}
        class SomeModel extends Model {}

        class ValidModel extends Model {
            static structure() {
                return {
                    any: "*",

                    string: "string",
                    number: "number",
                    date: "date",
                    array: "array",
                    object: "object",
                    boolean: "boolean",
                    class: CustomClass,
                    model: SomeModel,

                    arrayOfString: ["string"],
                    arrayOfNumber: ["number"],
                    arrayOfArray: ["array"],
                    arrayOfObject: ["object"],
                    arrayOfBoolean: ["boolean"],
                    arrayOfClass: [CustomClass],
                    arrayOfModel: [SomeModel],
                    arrayOfAny: ["*"]
                };
            }
        }

        // create valid model without errors
        new ValidModel();
    });

    it("once call static structure method", () => {
        
        let count = 0;
        class SomeModel extends Model {
            static structure() {
                count++;

                return {
                    name: "string",
                    age: "number"
                };
            }
        }

        let model = new SomeModel({
            age: 10
        });

        assert.deepEqual(model.data, {
            name: null,
            age: 10
        });

        assert.strictEqual( count, 1 );


        model.set({
            name: "Bob"
        });

        assert.deepEqual(model.data, {
            name: "Bob",
            age: 10
        });

        assert.strictEqual( count, 1 );


        // calling structure only in first constructor call
        // (save structure to prototype)

        let model2 = new SomeModel({
            age: "20"
        });

        assert.deepEqual(model2.data, {
            name: null,
            age: 20
        });

        assert.strictEqual( count, 1 );
    });

    it("structure is freeze object", () => {
        class SomeModel extends Model {
            static structure() {
                return {
                    arr: ["number"],
                    obj: {element: "number"}
                };
            }
        }

        let model = new SomeModel();

        assert.throws(
            () => {
                model.structure.arr = 10;
            },
            err =>
                /Cannot assign to read only property/.test(err.message)
        );

        assert.throws(
            () => {
                model.structure.arr.element.type = 10;
            },
            err =>
                /Cannot assign to read only property/.test(err.message)
        );

        assert.throws(
            () => {
                model.structure.obj.element.type = 10;
            },
            err =>
                /Cannot assign to read only property/.test(err.message)
        );
    });

    it("prepare structure, and save to model.structure", () => {
        class TestModel extends Model {}

        class SomeModel extends Model {
            static structure() {
                return {
                    name: "string",
                    user: TestModel,
                    arrayOfModels: [TestModel],
                    arrayOfNumbers: ["number"],
                    arrayOfAny: [],
                    arrayOfDates: {
                        type: ["date"]
                    },
                    arrayOfObjects: [{}],
                    obj1: "object",
                    obj2: {},
                    obj3: {element: "number"},
                    obj4: {type: {element: "string"}}
                };
            }
        }

        let model = new SomeModel();

        assert.deepEqual(
            model.structure,
            {
                name: {
                    type: "string",
                    required: false,
                    emptyAsNull: false,
                    nullAsEmpty: false,
                    trim: false,
                    upper: false,
                    lower: false
                },
                user: {
                    type: "model",
                    Models: [TestModel],
                    getConstructorByData: model.getDescription("user").getConstructorByData,
                    required: false
                },
                arrayOfModels: {
                    type: "array",
                    sort: false, 
                    emptyAsNull: false, 
                    nullAsEmpty: false,
                    required: false,
                    unique: false,
                    element: {
                        type: "model",
                        Models: [TestModel],
                        required: false,
                        getConstructorByData: (
                            model.getDescription("arrayOfModels")
                                .element
                                .getConstructorByData
                        )
                    }
                },
                arrayOfNumbers: {
                    type: "array",
                    sort: false, 
                    emptyAsNull: false, 
                    nullAsEmpty: false,
                    required: false,
                    unique: false,
                    element: {
                        type: "number",
                        required: false,
                        ceil: null,
                        round: null,
                        floor: null,
                        nullAsZero: false,
                        zeroAsNull: false
                    }
                },
                arrayOfAny: {
                    type: "array",
                    sort: false, 
                    emptyAsNull: false, 
                    nullAsEmpty: false,
                    required: false,
                    unique: false,
                    element: {
                        type: "*",
                        required: false
                    }
                },
                arrayOfDates: {
                    type: "array",
                    sort: false, 
                    emptyAsNull: false, 
                    nullAsEmpty: false,
                    required: false,
                    unique: false,
                    element: {
                        type: "date",
                        required: false
                    }
                },
                arrayOfObjects: {
                    type: "array",
                    sort: false, 
                    emptyAsNull: false, 
                    nullAsEmpty: false,
                    required: false,
                    unique: false,
                    element: {
                        type: "object",
                        required: false,
                        nullAsEmpty: false,
                        emptyAsNull: false,
                        element: {
                            type: "*",
                            required: false
                        }
                    }
                },
                obj1: {
                    type: "object",
                    required: false,
                    nullAsEmpty: false,
                    emptyAsNull: false,
                    element: {
                        type: "*",
                        required: false
                    }
                },
                obj2: {
                    type: "object",
                    required: false,
                    nullAsEmpty: false,
                    emptyAsNull: false,
                    element: {
                        type: "*",
                        required: false
                    }
                },
                obj3: {
                    type: "object",
                    required: false,
                    nullAsEmpty: false,
                    emptyAsNull: false,
                    element: {
                        type: "number",
                        required: false,
                        ceil: null,
                        round: null,
                        floor: null,
                        nullAsZero: false,
                        zeroAsNull: false
                    }
                },
                obj4: {
                    type: "object",
                    required: false,
                    nullAsEmpty: false,
                    emptyAsNull: false,
                    element: {
                        type: "string",
                        required: false,
                        emptyAsNull: false,
                        nullAsEmpty: false,
                        trim: false,
                        upper: false,
                        lower: false
                    }
                }
            }
        );
    });

    it("invalid validate", () => {
        
        class SomeModel extends Model {
            static structure() {
                return {
                    prop: {
                        type: "number",
                        validate: "wrong"
                    }
                };
            }
        }

        assert.throws(
            () => {
                new SomeModel();
            },
            err =>
                err.message == "prop: validate should be function or RegExp: \"wrong\""
        );

    });

    it("invalid validate key", () => {
        
        class SomeModel extends Model {
            static structure() {
                return {
                    "*": {
                        type: "number",
                        key: "wrong"
                    }
                };
            }
        }

        assert.throws(
            () => {
                new SomeModel();
            },
            err =>
                err.message == "*: validate key should be function or RegExp: \"wrong\""
        );

    });

});
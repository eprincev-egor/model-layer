"use strict";

const Model = require("../../lib/Model");
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
                err.message == "unknown type: wrong"
        );

        class CustomClass {}

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
                    model: Model,

                    arrayOfString: ["string"],
                    arrayOfNumber: ["number"],
                    arrayOfArray: ["array"],
                    arrayOfObject: ["object"],
                    arrayOfBoolean: ["boolean"],
                    arrayOfClass: [CustomClass],
                    arrayOfModel: [Model],
                    arrayOfAny: ["*"]
                };
            }
        }

        // create valid model without errors
        new ValidModel();
    });

    it("call structure only inside constructor", () => {
        
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
    });

    it("prepare structure, and save to model.structure", () => {
        class SomeModel extends Model {
            static structure() {
                return {
                    name: "string",
                    user: Model,
                    arrayOfModels: [Model],
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
                    type: "string"
                },
                user: {
                    type: Model
                },
                arrayOfModels: {
                    type: "array",
                    element: {
                        type: Model
                    }
                },
                arrayOfNumbers: {
                    type: "array",
                    element: {
                        type: "number"
                    }
                },
                arrayOfAny: {
                    type: "array",
                    element: {
                        type: "*"
                    }
                },
                arrayOfDates: {
                    type: "array",
                    element: {
                        type: "date"
                    }
                },
                arrayOfObjects: {
                    type: "array",
                    element: {
                        type: "object",
                        element: {
                            type: "*"
                        }
                    }
                },
                obj1: {
                    type: "object",
                    element: {
                        type: "*"
                    }
                },
                obj2: {
                    type: "object",
                    element: {
                        type: "*"
                    }
                },
                obj3: {
                    type: "object",
                    element: {
                        type: "number"
                    }
                },
                obj4: {
                    type: "object",
                    element: {
                        type: "string"
                    }
                }
            }
        );
    });

});
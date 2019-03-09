"use strict";

const {Model} = require("../../lib/index");
const assert = require("assert");

describe("AnyType", () => {
    
    it("any value", () => {
        
        class SomeModel extends Model {
            static structure() {
                return {
                    any: "*"
                };
            }
        }

        let model = new SomeModel();
        assert.strictEqual(model.data.any, null);

        model.set("any", 10);
        assert.strictEqual(model.data.any, 10);
        
        model.set("any", "text");
        assert.strictEqual(model.data.any, "text");

        model.set("any", true);
        assert.strictEqual(model.data.any, true);
    });

    it("any value toJSON()", () => {
        
        let date = new Date();
        let isoDate = date.toISOString();

        class SomeModel extends Model {
            static structure() {
                return {
                    any: "*"
                };
            }
        }

        let model = new SomeModel({
            any: {
                str: "",
                numb: 0,
                bool: false,
                arr: [{
                    some: true
                }],
                obj: {
                    arr: ["xxx", 8, 0, false],
                    someDate: date,
                    customToJSON: {
                        toJSON() {
                            return "customToJSON";
                        }
                    }
                }
            }
        });
        
        assert.deepStrictEqual(model.toJSON(), {
            any: {
                str: "",
                numb: 0,
                bool: false,
                arr: [{
                    some: true
                }],
                obj: {
                    arr: ["xxx", 8, 0, false],
                    someDate: isoDate,
                    customToJSON: "customToJSON"
                }
            }
        });
    });

});
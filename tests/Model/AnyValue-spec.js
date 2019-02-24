"use strict";

const Model = require("../../lib/Model");
const assert = require("assert");

describe("validate and prepare model structure", () => {
    
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

    it("any key and any value", () => {
        
        class SomeModel extends Model {
            static structure() {
                return {
                    "*": "*"
                };
            }
        }

        let model = new SomeModel();
        assert.deepEqual(model.data, {});

        model.set("x", 10);
        assert.strictEqual(model.data.x, 10);
        
        model.set("y", "text");
        assert.strictEqual(model.data.y, "text");

        model.set("z", true);
        assert.strictEqual(model.data.z, true);


        model.set({
            x: false,
            y: false,
            z: false
        });

        assert.deepEqual(model.data, {
            x: false,
            y: false,
            z: false
        });
    });

});
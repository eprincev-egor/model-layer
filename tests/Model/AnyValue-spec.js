"use strict";

const Model = require("../../lib/Model");
const assert = require("assert");

describe("validate and prepare model structure", () => {
    
    it("model without structure", () => {
        
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

});
"use strict";

const {Collection} = require("../../../lib/index");
const assert = require("assert");

describe("Collection tests", () => {

    it("find()", () => {

        class Colors extends Collection {
            static structure() {
                return {
                    name: "text"
                };
            }
        }

        let colors = new Colors([
            {name: "red"},
            {name: "green"},
            {name: "blue"}
        ]);

        let red = colors.find(color =>
            color.get("name") == "red"
        );

        assert.strictEqual( red.get("name"), "red" );
    });
    
    it("find(f, context)", () => {
        class Products extends Collection {
            static structure() {
                return {
                    name: "text",
                    price: "number"
                };
            }
        }

        let products = new Products([
            {name: "Eggs", price: 1.2}
        ]);

        
        let context = {
            changed: false
        };

        products.find(function() {
            this.changed = true;
        }, context);

        assert.strictEqual(context.changed, true);
    });

});
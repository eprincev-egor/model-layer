"use strict";

const {Collection} = require("../../../lib/index");
const assert = require("assert");

describe("Collection.every", () => {

    it("every()", () => {

        class Products extends Collection {
            static structure() {
                return {
                    name: "text",
                    price: "number"
                };
            }
        }

        let products = new Products([
            {name: "Eggs", price: 1.8},
            {name: "Pie", price: 10},
            {name: "Milk", price: 4}
        ]);

        let result = products.every(product =>
            product.get("price") > 5
        );
        assert.strictEqual( result, false );


        result = products.every(product =>
            product.get("price") > 1
        );
        assert.strictEqual( result, true );
    });
    
    it("every(f, context)", () => {
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

        products.every(function() {
            this.changed = true;
        }, context);

        assert.strictEqual(context.changed, true);
    });

});
"use strict";

const {Collection} = require("../../../lib/index");
const assert = require("assert");

describe("Collection.reset", () => {

    it("reset()", () => {
        
        class Products extends Collection {
            static data() {
                return {
                    name: "text",
                    price: "number"
                };
            }
        }

        let products = new Products([
            {name: "Eggs", price: 1.8},
            {name: "Pie", price: 10}
        ]);

        assert.strictEqual( products.length, 2 );

        products.reset();
        assert.strictEqual( products.length, 0 );

        assert.strictEqual( products.at(0), undefined );
        assert.strictEqual( products.at(1), undefined );

    });


});
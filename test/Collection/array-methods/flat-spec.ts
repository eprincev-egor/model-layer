"use strict";

const {Collection} = require("../../../lib/index");
const assert = require("assert");

describe("Collection.flat", () => {

    it("flat()", () => {

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
            {name: "Pie", price: 10},
            {name: "Milk", price: 4}
        ]);

        let result = products.flat();
        assert.strictEqual( result.length, 3 );
        assert.strictEqual( result[0].get("name"), "Eggs" );
        assert.strictEqual( result[1].get("name"), "Pie" );
        assert.strictEqual( result[2].get("name"), "Milk" );

    });
    
});
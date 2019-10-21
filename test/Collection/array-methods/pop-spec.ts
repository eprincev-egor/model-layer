"use strict";

const {Collection} = require("../../../lib/index");
const assert = require("assert");

describe("Collection.pop", () => {

    it("pop()", () => {
        
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

        assert.strictEqual( products.length, 3 );

        let result = products.pop();
        assert.strictEqual( result.get("name"), "Milk" );
        assert.strictEqual( products.length, 2 );

        result = products.pop();
        assert.strictEqual( result.get("name"), "Pie" );
        assert.strictEqual( products.length, 1 );

        result = products.pop();
        assert.strictEqual( result.get("name"), "Eggs" );
        assert.strictEqual( products.length, 0 );

        result = products.pop();
        assert.strictEqual( result, undefined );
        assert.strictEqual( products.length, 0 );
    });


});
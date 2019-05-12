"use strict";

const {Collection} = require("../../../lib/index");
const assert = require("assert");

describe("Collection.slice", () => {

    it("slice(begin)", () => {

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

        let result = products.slice(0);
        assert.strictEqual( result.length, 3 );
        assert.strictEqual( result[0].get("name"), "Eggs" );
        assert.strictEqual( result[1].get("name"), "Pie" );
        assert.strictEqual( result[2].get("name"), "Milk" );


        result = products.slice(1);
        assert.strictEqual( result.length, 2 );
        assert.strictEqual( result[0].get("name"), "Pie" );
        assert.strictEqual( result[1].get("name"), "Milk" );
    });
    
    it("slice(begin, end)", () => {

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

        let result = products.slice(0, 2);
        assert.strictEqual( result.length, 2 );
        assert.strictEqual( result[0].get("name"), "Eggs" );
        assert.strictEqual( result[1].get("name"), "Pie" );


        result = products.slice(1, 2);
        assert.strictEqual( result.length, 1 );
        assert.strictEqual( result[0].get("name"), "Pie" );
    });

});
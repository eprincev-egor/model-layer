"use strict";

const {Collection} = require("../../../lib/index");
const assert = require("assert");

describe("Collection.fill", () => {

    it("fill(row, start, end)", () => {
        
        class Products extends Collection {
            static structure() {
                return {
                    name: "text"
                };
            }
        }

        let products = new Products([
            {name: "A"},
            {name: "B"},
            {name: "C"}
        ]);

        assert.strictEqual( products.length, 3 );

        products.fill({
            name: "X"
        }, 0, 3);
        
        assert.strictEqual( products.length, 3 );

        assert.strictEqual( products.at(0).get("name"), "X" );
        assert.strictEqual( products.at(1).get("name"), "X" );
        assert.strictEqual( products.at(2).get("name"), "X" );
        
        assert.ok( products.at(0) != products.at(1) );
        assert.ok( products.at(1) != products.at(2) );
        assert.ok( products.at(2) != products.at(0) );

        products.first().set("name", "Y");
        assert.strictEqual( products.at(0).get("name"), "Y" );
        assert.strictEqual( products.at(1).get("name"), "X" );
        assert.strictEqual( products.at(2).get("name"), "X" );

    });


});
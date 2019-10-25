"use strict";

const {Collection} = require("../../../lib/index");
const assert = require("assert");

describe("Collection.first", () => {

    it("first()", () => {
        
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


        let model = products.first();

        assert.strictEqual( products.at(0), model );

    });


});
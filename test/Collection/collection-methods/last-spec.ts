"use strict";

const {Collection} = require("../../../lib/index");
const assert = require("assert");

describe("Collection.last", () => {

    it("last()", () => {
        
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
            {name: "Pie", price: 10}
        ]);


        let model = products.last();

        assert.strictEqual( products.at(1), model );

    });


});
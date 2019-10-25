"use strict";

const {Collection, Model} = require("../../../lib/index");
const assert = require("assert");

describe("Collection.join", () => {

    it("join()", () => {
        
        class Product extends Model {
            static data() {
                return {
                    name: "text",
                    price: "number"
                };
            }

            toString() {
                return `${ this.get("name") } (${ this.get("price") })`;
            }
        }

        class Products extends Collection {
            static data() {
                return Product;
            }
        }

        let products = new Products([
            {name: "Eggs", price: 1.8},
            {name: "Pie", price: 10},
            {name: "Milk", price: 4}
        ]);

        assert.strictEqual(
            products.join("; "),
            "Eggs (1.8); Pie (10); Milk (4)"
        );

        assert.strictEqual(
            products.join(),
            "Eggs (1.8),Pie (10),Milk (4)"
        );
    });


});
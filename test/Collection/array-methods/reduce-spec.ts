

const {Collection} = require("../../../lib/index");
const assert = require("assert");

describe("Collection.reduce", () => {

    it("reduce()", () => {

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

        let total = products.reduce((total, product) =>
            total + product.get("price"),
        0
        );

        assert.strictEqual( total, 15.8 );
    });

});
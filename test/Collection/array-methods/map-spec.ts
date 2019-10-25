

const {Collection} = require("../../../lib/index");
const assert = require("assert");

describe("Collection.map", () => {

    it("map()", () => {

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

        let prices = products.map(product =>
            product.get("price")
        );

        assert.deepStrictEqual( prices, [1.8, 10, 4] );
    });
    
    it("map(f, context)", () => {
        class Products extends Collection {
            static data() {
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

        products.map(function() {
            this.changed = true;
        }, context);

        assert.strictEqual(context.changed, true);
    });
});
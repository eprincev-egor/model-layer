

const {Collection} = require("../../../lib/index");
const assert = require("assert");

describe("Collection.some", () => {

    it("some()", () => {

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

        let result = products.some(product =>
            product.get("price") > 5
        );
        assert.strictEqual( result, true );


        result = products.some(product =>
            product.get("price") > 20
        );
        assert.strictEqual( result, false );
    });
    
    it("some(f, context)", () => {
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

        products.some(function() {
            this.changed = true;
        }, context);

        assert.strictEqual(context.changed, true);
    });
    
});
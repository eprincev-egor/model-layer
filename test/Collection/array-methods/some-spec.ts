
import {Collection, Model} from "../../../lib/index";
import assert from "assert";

interface IProduct {
    name: string;
    price: number;
}
class Product extends Model<IProduct> {}

describe("Collection.some", () => {

    it("some()", () => {

        class Products extends Collection<Product> {
            public static data() {
                return {
                    name: "text",
                    price: "number"
                };
            }
        }

        const products = new Products([
            {name: "Eggs", price: 1.8},
            {name: "Pie", price: 10},
            {name: "Milk", price: 4}
        ]);

        let result = products.some((product) =>
            product.get("price") > 5
        );
        assert.strictEqual( result, true );


        result = products.some((product) =>
            product.get("price") > 20
        );
        assert.strictEqual( result, false );
    });
    
    it("some(f, context)", () => {
        class Products extends Collection<Product> {
            public static data() {
                return {
                    name: "text",
                    price: "number"
                };
            }
        }

        const products = new Products([
            {name: "Eggs", price: 1.2}
        ]);

        
        const context = {
            changed: false
        };

        products.some(function() {
            this.changed = true;
            return true;
        }, context);

        assert.strictEqual(context.changed, true);
    });
    
});

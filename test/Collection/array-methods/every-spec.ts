
import {Collection, Model, Types} from "../../../lib/index";
import assert from "assert";

class Product extends Model<Product> {
    structure() {
        return {
            name: Types.String,
            price: Types.Number
        };
    }
}

describe("Collection.every", () => {

    it("every()", () => {

        class Products extends Collection<Product> {
            Model = Product;
        }

        const products = new Products([
            {name: "Eggs", price: 1.8},
            {name: "Pie", price: 10},
            {name: "Milk", price: 4}
        ]);

        let result = products.every((product) =>
            product.get("price") > 5
        );
        assert.strictEqual( result, false );


        result = products.every((product) =>
            product.get("price") > 1
        );
        assert.strictEqual( result, true );
    });
    
    it("every(f, context)", () => {
        class Products extends Collection<Product> {
            Model = Product;
        }

        const products = new Products([
            {name: "Eggs", price: 1.2}
        ]);

        
        const context = {
            changed: false
        };

        products.every(function() {
            this.changed = true;
            return true;
        }, context);

        assert.strictEqual(context.changed, true);
    });

});

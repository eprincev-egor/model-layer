
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

describe("Collection.filter", () => {

    it("filter()", () => {

        class Products extends Collection<Product> {
            Model() {
                return Product;
            }
        }

        const products = new Products([
            {name: "Eggs", price: 1.8},
            {name: "Pie", price: 10},
            {name: "Milk", price: 4}
        ]);

        const result = products.filter((product) =>
            product.get("price") > 2
        );

        assert.strictEqual( result.length, 2 );
        assert.strictEqual( result[0].get("name"), "Pie" );
        assert.strictEqual( result[1].get("name"), "Milk" );
    });
    
    it("filter(f, context)", () => {
        class Products extends Collection<Product> {
            Model() {
                return Product;
            }
        }

        const products = new Products([
            {name: "Eggs", price: 1.2}
        ]);

        
        const context = {
            changed: false
        };

        products.filter(function() {
            this.changed = true;
            return true;
        }, context);

        assert.strictEqual(context.changed, true);
    });

});


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

describe("Collection.shift", () => {

    it("shift()", () => {
        
        class Products extends Collection<Products> {
            Model() {
                return Product;
            }
        }

        const products = new Products([
            {name: "Eggs", price: 1.8},
            {name: "Pie", price: 10},
            {name: "Milk", price: 4}
        ]);

        assert.strictEqual( products.length, 3 );

        let result = products.shift();
        assert.strictEqual( result.get("name"), "Eggs" );
        assert.strictEqual( products.length, 2 );

        result = products.shift();
        assert.strictEqual( result.get("name"), "Pie" );
        assert.strictEqual( products.length, 1 );

        result = products.shift();
        assert.strictEqual( result.get("name"), "Milk" );
        assert.strictEqual( products.length, 0 );

        result = products.shift();
        assert.strictEqual( result, undefined );
        assert.strictEqual( products.length, 0 );
    });
});

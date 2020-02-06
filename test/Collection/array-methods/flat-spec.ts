
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

describe("Collection.flat", () => {

    it("flat()", () => {

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

        const result = products.flat();
        assert.strictEqual( result.length, 3 );
        assert.strictEqual( result[0].get("name"), "Eggs" );
        assert.strictEqual( result[1].get("name"), "Pie" );
        assert.strictEqual( result[2].get("name"), "Milk" );

    });
    
});

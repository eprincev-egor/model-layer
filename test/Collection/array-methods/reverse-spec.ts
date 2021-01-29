
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

describe("Collection.reverse", () => {

    it("reverse()", () => {
        
        class Products extends Collection<Product> {
            Model() {
                return Product;
            }
        }

        const products = new Products([
            {name: "Pie", price: 10},
            {name: "Eggs", price: 1.8},
            {name: "Milk", price: 4}
        ]);

        assert.strictEqual( products.at(0)!.get("price"), 10 );
        assert.strictEqual( products.at(1)!.get("price"), 1.8 );
        assert.strictEqual( products.at(2)!.get("price"), 4 );

        products.reverse();

        assert.strictEqual( products.at(0)!.get("price"), 4 );
        assert.strictEqual( products.at(1)!.get("price"), 1.8 );
        assert.strictEqual( products.at(2)!.get("price"), 10 );
    });


});

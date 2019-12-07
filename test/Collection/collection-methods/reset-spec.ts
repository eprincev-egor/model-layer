
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

describe("Collection.reset", () => {

    it("reset()", () => {
        
        class Products extends Collection<Product> {
            Model() {
                return Product;
            }
        }

        const products = new Products([
            {name: "Eggs", price: 1.8},
            {name: "Pie", price: 10}
        ]);

        assert.strictEqual( products.length, 2 );

        products.reset();
        assert.strictEqual( products.length, 0 );

        assert.strictEqual( products.at(0), undefined );
        assert.strictEqual( products.at(1), undefined );

    });


});

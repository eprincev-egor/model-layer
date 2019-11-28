
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

describe("Collection.create", () => {

    it("create(row)", () => {
        
        class Products extends Collection<Product> {
            Model = Product;
        }

        const products = new Products([
            {
                name: "Milk",
                price: 10
            }
        ]);
        assert.strictEqual( products.length, 1 );

        const model = products.create({
            name: "Eggs",
            price: 20
        });

        assert.strictEqual( products.length, 2 );
        assert.deepStrictEqual(model.data, {
            name: "Eggs",
            price: 20
        });
        assert.strictEqual( products.last(), model );
        assert.strictEqual( products.at(1), model );

    });


});

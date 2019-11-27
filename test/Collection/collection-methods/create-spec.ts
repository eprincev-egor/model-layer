
import {Collection, Model} from "../../../lib/index";
import assert from "assert";

interface IProduct {
    name: string;
    price: number;
}
class Product extends Model<IProduct> {}

describe("Collection.create", () => {

    it("create(row)", () => {
        
        class Products extends Collection<Product> {
            static data() {
                return {
                    name: "text",
                    price: "number"
                };
            }
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

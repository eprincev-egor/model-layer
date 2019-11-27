
import {Collection, Model} from "../../../lib/index";
import assert from "assert";

interface IProduct {
    name: string;
    price: number;
}
class Product extends Model<IProduct> {}

describe("Collection.reset", () => {

    it("reset()", () => {
        
        class Products extends Collection<Product> {
            static data() {
                return {
                    name: "text",
                    price: "number"
                };
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

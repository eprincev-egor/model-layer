
import {Collection, Model} from "../../../lib/index";
import assert from "assert";

interface IProduct {
    name: string;
    price: number;
}
class Product extends Model<IProduct> {}

describe("Collection.reverse", () => {

    it("reverse()", () => {
        
        class Products extends Collection<Product> {
            public static data() {
                return {
                    name: "text",
                    price: "number"
                };
            }
        }

        const products = new Products([
            {name: "Pie", price: 10},
            {name: "Eggs", price: 1.8},
            {name: "Milk", price: 4}
        ]);

        assert.strictEqual( products.at(0).get("price"), 10 );
        assert.strictEqual( products.at(1).get("price"), 1.8 );
        assert.strictEqual( products.at(2).get("price"), 4 );

        products.reverse();

        assert.strictEqual( products.at(0).get("price"), 4 );
        assert.strictEqual( products.at(1).get("price"), 1.8 );
        assert.strictEqual( products.at(2).get("price"), 10 );
    });


});

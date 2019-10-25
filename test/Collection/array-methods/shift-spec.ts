
import {Collection, Model} from "../../../lib/index";
import assert from "assert";

interface IProduct {
    name: string;
    price: number;
}
class Product extends Model<IProduct> {}

describe("Collection.shift", () => {

    it("shift()", () => {
        
        class Products extends Collection<Product> {
            public static data() {
                return {
                    name: "text",
                    price: "number"
                };
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

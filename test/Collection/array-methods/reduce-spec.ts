
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

describe("Collection.reduce", () => {

    it("reduce()", () => {

        class Products extends Collection<Product> {
            Model = Product;
        }

        const products = new Products([
            {name: "Eggs", price: 1.8},
            {name: "Pie", price: 10},
            {name: "Milk", price: 4}
        ]);

        const total = products.reduce((currentTotal, product) =>
            currentTotal + product.get("price"),
            0
        );

        assert.strictEqual( total, 15.8 );
    });

});

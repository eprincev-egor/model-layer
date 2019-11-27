
import {Collection, Model, Types} from "../../../lib/index";
import assert from "assert";

describe("Collection.join", () => {

    it("join()", () => {
        
        class Product extends Model<Product> {
            public structure() {
                return {
                    name: Types.String,
                    price: Types.Number
                };
            }

            public toString() {
                return `${ this.get("name") } (${ this.get("price") })`;
            }
        }

        class Products extends Collection<Product> {
            public static data() {
                return Product;
            }
        }

        const products = new Products([
            {name: "Eggs", price: 1.8},
            {name: "Pie", price: 10},
            {name: "Milk", price: 4}
        ]);

        assert.strictEqual(
            products.join("; "),
            "Eggs (1.8); Pie (10); Milk (4)"
        );

        assert.strictEqual(
            products.join(),
            "Eggs (1.8),Pie (10),Milk (4)"
        );
    });


});

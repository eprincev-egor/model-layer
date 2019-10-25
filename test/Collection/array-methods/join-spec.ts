
import {Collection, Model} from "../../../lib/index";
import assert from "assert";

describe("Collection.join", () => {

    it("join()", () => {
        
        interface IProduct {
            name: string;
            price: number;
        }
        class Product extends Model<IProduct> {
            public static data() {
                return {
                    name: "text",
                    price: "number"
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


import {Collection, Model} from "../../../lib/index";
import assert from "assert";

interface IProduct {
    name: string;
    price: number;
}
class Product extends Model<IProduct> {}

describe("Collection.first", () => {

    it("first()", () => {
        
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


        const model = products.first();

        assert.strictEqual( products.at(0), model );

    });


});

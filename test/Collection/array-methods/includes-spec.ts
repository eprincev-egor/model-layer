
import {Collection, Model} from "../../../lib/index";
import assert from "assert";

interface IProduct {
    name: string;
    price: number;
}
class Product extends Model<IProduct> {}

describe("Collection.includes", () => {

    it("includes(model)", () => {

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

        const firstModel = products.at(0);
        const lastModel = products.at(2);

        class SomeModel extends Model<object> {
            public static data() {
                return {"*": "*"};
            }
        }
        const unknownModel = new SomeModel();

        
        let result = products.includes( lastModel );
        assert.strictEqual( result, true );

        result = products.includes( firstModel );
        assert.strictEqual( result, true );

        result = products.includes( unknownModel );
        assert.strictEqual( result, false );
    });

    it("includes(model, fromIndex)", () => {

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

        const firstModel = products.at(0);
        const lastModel = products.at(2);

        
        let result = products.includes( lastModel, 1 );
        assert.strictEqual( result, true );

        result = products.includes( firstModel, 1 );
        assert.strictEqual( result, false );
    });


});

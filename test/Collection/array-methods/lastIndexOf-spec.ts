
import {Collection, Model} from "../../../lib/index";
import assert from "assert";

interface IProduct {
    name: string;
    price: number;
}
class Product extends Model<IProduct> {}

describe("Collection.lastIndexOf", () => {

    it("lastIndexOf(model)", () => {

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

        
        let result = products.lastIndexOf( lastModel );
        assert.strictEqual( result, 2 );

        result = products.lastIndexOf( firstModel );
        assert.strictEqual( result, 0 );

        result = products.lastIndexOf( unknownModel );
        assert.strictEqual( result, -1 );
    });
    
    it("lastIndexOf(model, fromIndex)", () => {

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

        
        let result = products.lastIndexOf( lastModel, 1 );
        assert.strictEqual( result, -1 );

        result = products.lastIndexOf( firstModel, 1 );
        assert.strictEqual( result, 0 );
    });


});


import {Collection, Model} from "../../../lib/index";
import assert from "assert";

interface IProduct {
    name: string;
    price: number;
}
class Product extends Model<IProduct> {}

describe("Collection.indexOf", () => {

    it("indexOf(model)", () => {

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

        
        let result = products.indexOf( lastModel );
        assert.strictEqual( result, 2 );

        result = products.indexOf( firstModel );
        assert.strictEqual( result, 0 );

        result = products.indexOf( unknownModel );
        assert.strictEqual( result, -1 );
    });
    
    it("indexOf(model, fromIndex)", () => {

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

        
        let result = products.indexOf( lastModel, 1 );
        assert.strictEqual( result, 2 );

        result = products.indexOf( firstModel, 1 );
        assert.strictEqual( result, -1 );
    });


});

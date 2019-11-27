
import {Collection, Model, Types} from "../../../lib/index";
import assert from "assert";

class Product extends Model<Product> {
    public structure() {
        return {
            name: Types.String,
            price: Types.Number
        };
    }
}

describe("Collection.includes", () => {

    it("includes(model)", () => {

        class Products extends Collection<Product> {
            public Model = Product;
        }

        const products = new Products([
            {name: "Eggs", price: 1.8},
            {name: "Pie", price: 10},
            {name: "Milk", price: 4}
        ]);

        const firstModel = products.at(0);
        const lastModel = products.at(2);

        class SomeModel extends Model<SomeModel> {
            public structure() {
                return {
                    "*": Types.Any
                };
            }
        }
        const unknownModel = new SomeModel();

        
        let result = products.includes( lastModel );
        assert.strictEqual( result, true );

        result = products.includes( firstModel );
        assert.strictEqual( result, true );

        result = products.includes( unknownModel as any );
        assert.strictEqual( result, false );
    });

    it("includes(model, fromIndex)", () => {

        class Products extends Collection<Product> {
            public Model = Product;
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

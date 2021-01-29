
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

describe("Collection.indexOf", () => {

    it("indexOf(model)", () => {

        class Products extends Collection<Product> {
            Model() {
                return Product;
            }
        }

        const products = new Products([
            {name: "Eggs", price: 1.8},
            {name: "Pie", price: 10},
            {name: "Milk", price: 4}
        ]);

        const firstModel = products.at(0)!;
        const lastModel = products.at(2)!;

        class SomeModel extends Model<SomeModel> {
            structure() {
                return {
                    "*": Types.Any
                };
            }
        }
        const unknownModel = new SomeModel();

        
        let result = products.indexOf( lastModel );
        assert.strictEqual( result, 2 );

        result = products.indexOf( firstModel );
        assert.strictEqual( result, 0 );

        result = products.indexOf( unknownModel as any );
        assert.strictEqual( result, -1 );
    });
    
    it("indexOf(model, fromIndex)", () => {

        class Products extends Collection<Product> {
            Model() {
                return Product;
            }
        }

        const products = new Products([
            {name: "Eggs", price: 1.8},
            {name: "Pie", price: 10},
            {name: "Milk", price: 4}
        ]);

        const firstModel = products.at(0)!;
        const lastModel = products.at(2)!;

        
        let result = products.indexOf( lastModel, 1 );
        assert.strictEqual( result, 2 );

        result = products.indexOf( firstModel, 1 );
        assert.strictEqual( result, -1 );
    });


});

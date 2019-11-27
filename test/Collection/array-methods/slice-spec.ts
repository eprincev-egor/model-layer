
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

describe("Collection.slice", () => {

    it("slice()", () => {

        class Products extends Collection<Product> {
            Model = Product;
        }

        const products = new Products([
            {name: "Eggs", price: 1.8},
            {name: "Pie", price: 10},
            {name: "Milk", price: 4}
        ]);

        const result = products.slice();
        assert.strictEqual( result.length, 3 );
        assert.strictEqual( result[0].get("name"), "Eggs" );
        assert.strictEqual( result[1].get("name"), "Pie" );
        assert.strictEqual( result[2].get("name"), "Milk" );

    });
    
    it("slice(begin)", () => {

        class Products extends Collection<Product> {
            Model = Product;
        }

        const products = new Products([
            {name: "Eggs", price: 1.8},
            {name: "Pie", price: 10},
            {name: "Milk", price: 4}
        ]);

        let result = products.slice(0);
        assert.strictEqual( result.length, 3 );
        assert.strictEqual( result[0].get("name"), "Eggs" );
        assert.strictEqual( result[1].get("name"), "Pie" );
        assert.strictEqual( result[2].get("name"), "Milk" );


        result = products.slice(1);
        assert.strictEqual( result.length, 2 );
        assert.strictEqual( result[0].get("name"), "Pie" );
        assert.strictEqual( result[1].get("name"), "Milk" );
    });
    
    it("slice(begin, end)", () => {

        class Products extends Collection<Product> {
            Model = Product;
        }

        const products = new Products([
            {name: "Eggs", price: 1.8},
            {name: "Pie", price: 10},
            {name: "Milk", price: 4}
        ]);

        let result = products.slice(0, 2);
        assert.strictEqual( result.length, 2 );
        assert.strictEqual( result[0].get("name"), "Eggs" );
        assert.strictEqual( result[1].get("name"), "Pie" );


        result = products.slice(1, 2);
        assert.strictEqual( result.length, 1 );
        assert.strictEqual( result[0].get("name"), "Pie" );
    });

});

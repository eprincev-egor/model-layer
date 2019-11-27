
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

describe("Collection.each", () => {

    it("each", () => {

        class Products extends Collection<Product> {
            public Model = Product;
        }

        const products = new Products([
            {name: "Eggs", price: 1.2},
            {name: "Milk", price: 2.75}
        ]);

        
        assert.strictEqual( products.length, 2 );


        const names = [];
        const prices = [];
        const indexes = [];

        products.each((product, i) => {
            assert.ok( product instanceof Model );

            names.push( product.get("name") );
            prices.push( product.get("price") );
            indexes.push( i );
        });

        assert.deepStrictEqual( names, ["Eggs", "Milk"] );
        assert.deepStrictEqual( prices, [1.2, 2.75] );
        assert.deepStrictEqual( indexes, [0, 1] );
    });

    it("each(f, context)", () => {

        class Products extends Collection<Product> {
            public Model = Product;
        }

        const products = new Products([
            {name: "Eggs", price: 1.2}
        ]);

        
        const context = {
            changed: false
        };

        products.each(function() {
            this.changed = true;
        }, context);

        assert.strictEqual(context.changed, true);
    });

});

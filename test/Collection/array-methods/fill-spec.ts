
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

describe("Collection.fill", () => {

    it("fill(row, start, end)", () => {
        
        class Products extends Collection<Product> {
            public Model = Product;
        }

        const products = new Products([
            {name: "A"},
            {name: "B"},
            {name: "C"}
        ]);

        assert.strictEqual( products.length, 3 );

        products.fill({
            name: "X"
        }, 0, 3);
        
        assert.strictEqual( products.length, 3 );

        assert.strictEqual( products.at(0).get("name"), "X" );
        assert.strictEqual( products.at(1).get("name"), "X" );
        assert.strictEqual( products.at(2).get("name"), "X" );
        
        assert.ok( products.at(0) !== products.at(1) );
        assert.ok( products.at(1) !== products.at(2) );
        assert.ok( products.at(2) !== products.at(0) );

        products.first().set({name: "Y"});
        assert.strictEqual( products.at(0).get("name"), "Y" );
        assert.strictEqual( products.at(1).get("name"), "X" );
        assert.strictEqual( products.at(2).get("name"), "X" );

    });

    

    it("fill(row, start)", () => {
        
        class Products extends Collection<Product> {
            public Model = Product;
        }

        const products = new Products([
            {name: "A"},
            {name: "B"},
            {name: "C"}
        ]);

        assert.strictEqual( products.length, 3 );

        products.fill({
            name: "X"
        }, 1);
        
        assert.strictEqual( products.length, 3 );

        assert.strictEqual( products.at(0).get("name"), "A" );
        assert.strictEqual( products.at(1).get("name"), "X" );
        assert.strictEqual( products.at(2).get("name"), "X" );
        
        assert.ok( products.at(1) !== products.at(2) );

        products.at(1).set({name: "Y"});
        assert.strictEqual( products.at(0).get("name"), "A" );
        assert.strictEqual( products.at(1).get("name"), "Y" );
        assert.strictEqual( products.at(2).get("name"), "X" );

    });

    
    it("fill(row, -start)", () => {
        
        class Products extends Collection<Product> {
            public Model = Product;
        }

        const products = new Products([
            {name: "A"},
            {name: "B"},
            {name: "C"}
        ]);

        assert.strictEqual( products.length, 3 );

        products.fill({
            name: "X"
        }, -1);
        
        assert.strictEqual( products.length, 3 );

        assert.strictEqual( products.at(0).get("name"), "A" );
        assert.strictEqual( products.at(1).get("name"), "B" );
        assert.strictEqual( products.at(2).get("name"), "X" );
        
    });

    it("fill(row, -start, -end)", () => {
        
        class Products extends Collection<Product> {
            public Model = Product;
        }

        const products = new Products([
            {name: "A"},
            {name: "B"},
            {name: "C"}
        ]);

        assert.strictEqual( products.length, 3 );

        products.fill({
            name: "X"
        }, -2, -1);
        
        assert.strictEqual( products.length, 3 );

        assert.strictEqual( products.at(0).get("name"), "A" );
        assert.strictEqual( products.at(1).get("name"), "X" );
        assert.strictEqual( products.at(2).get("name"), "C" );
        
    });


});

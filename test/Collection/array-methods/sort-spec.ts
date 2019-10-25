

const {Collection} = require("../../../lib/index");
const assert = require("assert");

describe("Collection.sort", () => {

    it("sort(compareFunction)", () => {
        
        class Products extends Collection {
            static data() {
                return {
                    name: "text",
                    price: "number"
                };
            }
        }

        let products = new Products([
            {name: "Pie", price: 10},
            {name: "Eggs", price: 1.8},
            {name: "Milk", price: 4}
        ]);

        assert.strictEqual( products.at(0).get("price"), 10 );
        assert.strictEqual( products.at(1).get("price"), 1.8 );
        assert.strictEqual( products.at(2).get("price"), 4 );

        products.sort((productA, productB) =>
            productA.get("price") - productB.get("price")
        );

        assert.strictEqual( products.at(0).get("price"), 1.8 );
        assert.strictEqual( products.at(1).get("price"), 4 );
        assert.strictEqual( products.at(2).get("price"), 10 );
    });

    it("sort(key)", () => {
        
        class Products extends Collection {
            static data() {
                return {
                    name: "text",
                    price: "number"
                };
            }
        }

        let products = new Products([
            {name: "Pie", price: 10},
            {name: "Eggs", price: 1.8},
            {name: "Milk", price: 40}
        ]);

        assert.strictEqual( products.at(0).get("price"), 10 );
        assert.strictEqual( products.at(1).get("price"), 1.8 );
        assert.strictEqual( products.at(2).get("price"), 40 );

        products.sort("price");

        assert.strictEqual( products.at(0).get("price"), 1.8 );
        assert.strictEqual( products.at(1).get("price"), 10 );
        assert.strictEqual( products.at(2).get("price"), 40 );

        products.sort("name");

        assert.strictEqual( products.at(0).get("name"), "Eggs" );
        assert.strictEqual( products.at(1).get("name"), "Milk" );
        assert.strictEqual( products.at(2).get("name"), "Pie" );
    });

    it("sort(key1, key2)", () => {
        
        class Products extends Collection {
            static data() {
                return {
                    name: "text",
                    price: "number"
                };
            }
        }

        let products = new Products([
            {name: "Pie", price: 10},
            {name: "Pie", price: 2},
            {name: "Pie", price: 3},
            {name: "Eggs", price: 1.8},
            {name: "Eggs", price: 3},
            {name: "Milk", price: 40},
            {name: "Milk", price: 20}
        ]);

        products.sort("name", "price");

        assert.strictEqual( products.at(0).get("name"), "Eggs" );
        assert.strictEqual( products.at(0).get("price"), 1.8 );

        assert.strictEqual( products.at(1).get("name"), "Eggs" );
        assert.strictEqual( products.at(1).get("price"), 3 );

        assert.strictEqual( products.at(2).get("name"), "Milk" );
        assert.strictEqual( products.at(2).get("price"), 20 );

        assert.strictEqual( products.at(3).get("name"), "Milk" );
        assert.strictEqual( products.at(3).get("price"), 40 );

        assert.strictEqual( products.at(4).get("name"), "Pie" );
        assert.strictEqual( products.at(4).get("price"), 2 );

        assert.strictEqual( products.at(5).get("name"), "Pie" );
        assert.strictEqual( products.at(5).get("price"), 3 );

        assert.strictEqual( products.at(6).get("name"), "Pie" );
        assert.strictEqual( products.at(6).get("price"), 10 );
    });

    it("sort(somethingWrong)", () => {
        
        class Products extends Collection {
            static data() {
                return {
                    name: "text",
                    price: "number"
                };
            }
        }

        let products = new Products([
            {name: "Pie", price: 10},
            {name: "Eggs", price: 1.8},
            {name: "Milk", price: 40}
        ]);

        assert.throws(
            () => {
                products.sort();
            }, err =>
                err.message == "invalid compareFunction or key: undefined"
        );
    });

});


const {Collection} = require("../../../lib/index");
const assert = require("assert");

describe("Collection.create", () => {

    it("create(row)", () => {
        
        class Products extends Collection {
            static data() {
                return {
                    name: "text",
                    price: "number"
                };
            }
        }

        let products = new Products([
            {
                name: "Milk",
                price: 10
            }
        ]);
        assert.strictEqual( products.length, 1 );

        let model = products.create({
            name: "Eggs",
            price: 20
        });

        assert.strictEqual( products.length, 2 );
        assert.deepStrictEqual(model.data, {
            name: "Eggs",
            price: 20
        });
        assert.strictEqual( products.last(), model );
        assert.strictEqual( products.at(1), model );

    });


});
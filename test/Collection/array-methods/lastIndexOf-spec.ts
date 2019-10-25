"use strict";

const {Collection, Model} = require("../../../lib/index");
const assert = require("assert");

describe("Collection.lastIndexOf", () => {

    it("lastIndexOf(model)", () => {

        class Products extends Collection {
            static data() {
                return {
                    name: "text",
                    price: "number"
                };
            }
        }

        let products = new Products([
            {name: "Eggs", price: 1.8},
            {name: "Pie", price: 10},
            {name: "Milk", price: 4}
        ]);

        let firstModel = products.at(0);
        let lastModel = products.at(2);

        class SomeModel extends Model {
            static data() {
                return {"*": "*"};
            }
        }
        let unknownModel = new SomeModel();

        
        let result = products.lastIndexOf( lastModel );
        assert.strictEqual( result, 2 );

        result = products.lastIndexOf( firstModel );
        assert.strictEqual( result, 0 );

        result = products.lastIndexOf( unknownModel );
        assert.strictEqual( result, -1 );
    });
    
    it("lastIndexOf(model, fromIndex)", () => {

        class Products extends Collection {
            static data() {
                return {
                    name: "text",
                    price: "number"
                };
            }
        }

        let products = new Products([
            {name: "Eggs", price: 1.8},
            {name: "Pie", price: 10},
            {name: "Milk", price: 4}
        ]);

        let firstModel = products.at(0);
        let lastModel = products.at(2);

        
        let result = products.lastIndexOf( lastModel, 1 );
        assert.strictEqual( result, -1 );

        result = products.lastIndexOf( firstModel, 1 );
        assert.strictEqual( result, 0 );
    });


});
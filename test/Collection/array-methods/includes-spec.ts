"use strict";

const {Collection, Model} = require("../../../lib/index");
const assert = require("assert");

describe("Collection.includes", () => {

    it("includes(model)", () => {

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

        
        let result = products.includes( lastModel );
        assert.strictEqual( result, true );

        result = products.includes( firstModel );
        assert.strictEqual( result, true );

        result = products.includes( unknownModel );
        assert.strictEqual( result, false );
    });

    it("includes(model, fromIndex)", () => {

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

        
        let result = products.includes( lastModel, 1 );
        assert.strictEqual( result, true );

        result = products.includes( firstModel, 1 );
        assert.strictEqual( result, false );
    });


});
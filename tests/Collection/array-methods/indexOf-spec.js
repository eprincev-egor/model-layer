"use strict";

const {Collection} = require("../../../lib/index");
const assert = require("assert");

describe("Collection.indexOf", () => {

    it("indexOf(model)", () => {

        class Products extends Collection {
            static structure() {
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

        class SomeModel {
            static structure() {
                return {"*": "*"};
            }
        }
        let unknownModel = new SomeModel();

        
        let result = products.indexOf( lastModel );
        assert.strictEqual( result, 2 );

        result = products.indexOf( firstModel );
        assert.strictEqual( result, 0 );

        result = products.indexOf( unknownModel );
        assert.strictEqual( result, -1 );
    });
    
    it("indexOf(model, fromIndex)", () => {

        class Products extends Collection {
            static structure() {
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

        
        let result = products.indexOf( lastModel, 1 );
        assert.strictEqual( result, 2 );

        result = products.indexOf( firstModel, 1 );
        assert.strictEqual( result, -1 );
    });


});
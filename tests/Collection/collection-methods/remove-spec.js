"use strict";

const {Collection} = require("../../../lib/index");
const assert = require("assert");

describe("Collection.remove", () => {

    it("remove(model)", () => {
        
        class Products extends Collection {
            static structure() {
                return {
                    name: "text"
                };
            }
        }

        let products = new Products([
            {name: "Pie"},
            {name: "Milk"}
        ]);

        assert.deepStrictEqual( products.toJSON(), [
            {name: "Pie"},
            {name: "Milk"}
        ]);

        let firstModel = products.first();
        products.remove( firstModel );

        assert.deepStrictEqual( products.toJSON(), [
            {name: "Milk"}
        ]);

        // expected without errors
        products.remove( firstModel );
    });


});
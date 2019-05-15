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

    it("remove(id)", () => {
        
        class Companies extends Collection {
            static structure() {
                return {
                    id: {
                        type: "number",
                        primary: true
                    },
                    name: "text"
                };
            }
        }

        let companies = new Companies([
            {id: 1, name: "X"},
            {id: 2, name: "Y"}
        ]);

        assert.deepStrictEqual( companies.toJSON(), [
            {id: 1, name: "X"},
            {id: 2, name: "Y"}
        ]);

        
        companies.remove( 1 );

        assert.deepStrictEqual( companies.toJSON(), [
            {id: 2, name: "Y"}
        ]);

        // expected without errors
        companies.remove( 1 );
    });

});
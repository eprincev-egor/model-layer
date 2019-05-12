"use strict";

const {Collection} = require("../../../lib/index");
const assert = require("assert");

describe("Collection.concat", () => {

    it("concat(collection)", () => {
        
        class Products extends Collection {
            static structure() {
                return {
                    name: "text",
                    price: "number"
                };
            }
        }

        let arr1 = new Products([
            {name: "Eggs", price: 1.8},
            {name: "Pie", price: 10}
        ]);

        let arr2 = new Products([
            {name: "Bread", price: 2.3},
            {name: "Milk", price: 10}
        ]);

        let arr3 = arr1.concat( arr2 );
        assert.strictEqual( arr3.length, 4 );

        assert.strictEqual( arr3.at(1).get("name"), "Pie" );
        assert.strictEqual( arr3.at(2).get("name"), "Bread" );
    });

    it("concat(rows)", () => {
        
        class Products extends Collection {
            static structure() {
                return {
                    name: "text",
                    price: "number"
                };
            }
        }

        let arr1 = new Products([
            {name: "Eggs", price: 1.8},
            {name: "Pie", price: 10}
        ]);

        let arr2 = [
            {name: "Bread", price: 2.3},
            {name: "Milk", price: 10}
        ];

        let arr3 = arr1.concat( arr2 );
        assert.strictEqual( arr3.length, 4 );

        assert.strictEqual( arr3.at(1).get("name"), "Pie" );
        assert.strictEqual( arr3.at(2).get("name"), "Bread" );
    });

    it("concat(rows1, rows2)", () => {
        
        class Products extends Collection {
            static structure() {
                return {
                    name: "text",
                    price: "number"
                };
            }
        }

        let arr1 = new Products([
            {name: "Eggs", price: 1.8},
            {name: "Pie", price: 10}
        ]);

        let arr2 = [
            {name: "Bread", price: 2.3}
        ];
        let arr3 = [
            {name: "Milk", price: 10}
        ];

        let arr4 = arr1.concat( arr2, arr3 );
        assert.strictEqual( arr4.length, 4 );

        assert.strictEqual( arr4.at(1).get("name"), "Pie" );
        assert.strictEqual( arr4.at(2).get("name"), "Bread" );
        assert.strictEqual( arr4.at(3).get("name"), "Milk" );
    });

    it("concat(rows, collection)", () => {
        
        class Products extends Collection {
            static structure() {
                return {
                    name: "text",
                    price: "number"
                };
            }
        }

        let arr1 = new Products([
            {name: "Eggs", price: 1.8},
            {name: "Pie", price: 10}
        ]);

        let arr2 = [
            {name: "Bread", price: 2.3}
        ];
        let arr3 = new Products([
            {name: "Milk", price: 10}
        ]);

        let arr4 = arr1.concat( arr2, arr3 );
        assert.strictEqual( arr4.length, 4 );

        assert.strictEqual( arr4.at(1).get("name"), "Pie" );
        assert.strictEqual( arr4.at(2).get("name"), "Bread" );
        assert.strictEqual( arr4.at(3).get("name"), "Milk" );
    });

    
    it("concat()", () => {
        
        class Products extends Collection {
            static structure() {
                return {
                    name: "text",
                    price: "number"
                };
            }
        }

        let arr1 = new Products([
            {name: "Eggs", price: 1.8},
            {name: "Pie", price: 10}
        ]);

        let arr2 = arr1.concat();
        assert.strictEqual( arr2.length, 2 );

        assert.strictEqual( arr2.at(1).get("name"), "Pie" );
    });
});
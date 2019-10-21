"use strict";

const {Collection, Model} = require("../../../lib/index");
const assert = require("assert");

describe("Collection.equal", () => {

    it("equal()", () => {
        
        class Companies extends Collection {
            static structure() {
                return {
                    name: "text"
                };
            }
        }

        let collection1 = new Companies([
            {name: "X"}
        ]);
        let collection2 = new Companies([
            {name: "X"}
        ]);
        let collection3 = new Companies([
            {name: "X"},
            {name: "Y"}
        ]);
        let collection4 = new Companies([
            {name: "Y"}
        ]);
        let collection5 = new Companies();
        let arr1 = [
            {name: "X"}
        ];
        let arr2 = [
            {name: "Y"}
        ];

        
        assert.ok( collection1.equal( collection2 ) );
        assert.ok( collection2.equal( collection1 ) );

        assert.ok( !collection1.equal( collection3 ) );
        assert.ok( !collection3.equal( collection1 ) );

        assert.ok( !collection1.equal( collection4 ) );
        assert.ok( !collection1.equal( collection5 ) );
        assert.ok( !collection2.equal( collection5 ) );

        assert.ok( collection1.equal( arr1 ) );
        assert.ok( collection2.equal( arr1 ) );
        assert.ok( !collection1.equal( arr2 ) );

        assert.ok( collection4.equal( arr2 ) );
    });


    it("equal Collections, circular recursion", () => {
        class CustomCollection extends Collection {
            static structure() {
                return {
                    name: "text",
                    child: CustomCollection
                };
            }
        }

        let collection1 = new CustomCollection([
            {name: "X"}
        ]);
        collection1.first().set("child", collection1);

        let collection2 = new CustomCollection([
            {name: "X"}
        ]);
        collection2.first().set("child", collection2);

        assert.ok( collection1.equal( collection2 ) );
        assert.ok( collection2.equal( collection1 ) );
    });
    
});
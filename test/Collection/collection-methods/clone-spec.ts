"use strict";

const {Collection} = require("../../../lib/index");
const assert = require("assert");

describe("Collection.clone", () => {

    it("clone()", () => {
        
        class Companies extends Collection {
            static structure() {
                return {
                    name: "text"
                };
            }
        }

        let companies = new Companies([
            {name: "X"},
            {name: "Y"}
        ]);


        let clone = companies.clone();

        assert.deepStrictEqual(clone.toJSON(), [
            {name: "X"},
            {name: "Y"}
        ]);

        assert.ok( clone != companies );
        assert.ok( clone instanceof Companies );
    });


});
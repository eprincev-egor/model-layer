"use strict";

const {Collection} = require("../../../lib/index");
const assert = require("assert");

describe("Collection.toJSON", () => {

    it("toJSON()", () => {
        
        class Users extends Collection {
            static data() {
                return {
                    name: "text"
                };
            }
        }

        let users = new Users([
            {name: "a"},
            {name: "b"},
            {name: "c"},
            {name: "d"},
            {name: "e"}
        ]);

        assert.deepStrictEqual(
            users.toJSON(),
            [
                {name: "a"},
                {name: "b"},
                {name: "c"},
                {name: "d"},
                {name: "e"}
            ]
        );
    });


});
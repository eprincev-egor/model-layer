"use strict";

const {Collection} = require("../../../lib/index");
const assert = require("assert");

describe("Collection.copyWithin", () => {

    it("copyWithin(target, start)", () => {
        
        class Users extends Collection {
            static structure() {
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

        users.copyWithin(0, 3);

        assert.deepStrictEqual(
            users.toJSON(),
            [
                {name: "d"},
                {name: "e"},
                {name: "c"},
                {name: "d"},
                {name: "e"}
            ]
        );

        assert.ok( users.at(0) != users.at(3) );
        assert.ok( users.at(1) != users.at(4) );
    });

    it("copyWithin(target, start, end)", () => {
        
        class Users extends Collection {
            static structure() {
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

        users.copyWithin(0, 3, 4);

        assert.deepStrictEqual(
            users.toJSON(),
            [
                {name: "d"},
                {name: "b"},
                {name: "c"},
                {name: "d"},
                {name: "e"}
            ]
        );

        assert.ok( users.at(0) != users.at(3) );
    });


});
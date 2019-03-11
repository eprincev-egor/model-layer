"use strict";

// const {Model} = require("model-layer");
const {Model} = require("../lib/index");
const assert = require("assert");

class Tree extends Model {
    static structure() {
        return {
            name: "string",
            children: [Tree]
        };
    }
}

let tree = new Tree({
    name: "Grandfather",
    children: [
        {
            name: "Father",
            children: [
                {
                    name: "Son"
                }
            ]
        }
    ]
});

// any model has property .walk,
// for scan children models
let children = [];

tree.walk(child => {
    let name = child.get("name");
    children.push( name );
});

assert.deepEqual(
    children,
    ["Father", "Son"]
);
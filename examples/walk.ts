

// const {Model} = require("model-layer");
import {Model, Types} from "../lib/index";
import assert from "assert";

class Tree extends Model<Tree> {
    structure() {
        return {
            name: Types.String,
            children: Types.Array({
                element: Tree
            })
        };
    }
}

const tree = new Tree({
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
const children = [];

tree.walk((child: Tree) => {
    const name = child.get("name");
    children.push( name );
});

assert.deepEqual(
    children,
    ["Father", "Son"]
);



// const {Model} = require("model-layer");
import {Model} from "../lib/index";
import assert from "assert";

interface ITree {
    name?: string;
    children?: Array<Tree | ITree>;
}

class Tree extends Model<ITree> {
    static data() {
        return {
            name: "string",
            children: [Tree]
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

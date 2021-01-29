

// const {Model} = require("model-layer");
import {Model, Types} from "../lib/index";
import assert from "assert";
import { IStringType } from "../lib/type/StringType";
import { IArrayType } from "../lib/type/ArrayType";

class Tree extends Model<Tree> {
    structure(): {
        name: IStringType;
        children: IArrayType<Tree>;
    } {
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
const children: string[] = [];

tree.walk((child) => {
    const name = (child as Tree).get("name")!;
    children.push( name );
});

assert.deepEqual(
    children,
    ["Father", "Son"]
);



// const {Model} = require("model-layer");
import {Model, Types} from "../lib/index";
import assert from "assert";

class BinaryTreeModel extends Model<BinaryTreeModel> {
    structure() {
        return {
            // define model property
            left: BinaryTreeModel,
            right: BinaryTreeModel,
            
            id: Types.Number,
            name: Types.String
        };
    }

    findName(id: number): string | null {
        if ( id === this.get("id") ) {
            return this.get("name")!;
        }

        if ( id > this.get("id") ) {
            const right = this.get("right");
            if ( right ) {
                return right.findName(id);
            }
        }
        else {
            const left = this.get("left");
            if ( left ) {
                return left.findName(id);
            }
        }

        return null;
    }
}

const tree = new BinaryTreeModel({
    id: 4,
    name: "Bob",
    left: {
        id: 2,
        name: "Jack",
        left: {
            name: "Oscar",
            id: 1
        },
        right: {
            name: "Leo",
            id: 3
        }
    },
    right: {
        id: 5,
        name: "Harry",
        right: {
            name: "Oliver",
            id: 7
        }
    }
});

assert.strictEqual( tree.findName(1), "Oscar" );
assert.strictEqual( tree.findName(2), "Jack" );
assert.strictEqual( tree.findName(3), "Leo" );
assert.strictEqual( tree.findName(4), "Bob" );
assert.strictEqual( tree.findName(5), "Harry" );
assert.strictEqual( tree.findName(6), null );
assert.strictEqual( tree.findName(7), "Oliver" );
assert.strictEqual( tree.findName(8), null );
assert.strictEqual( tree.findName(9), null );
assert.strictEqual( tree.findName(1.1), null );
assert.strictEqual( tree.findName(0.9), null );

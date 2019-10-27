

// const {Model} = require("model-layer");
const {Model} = require("../lib/index");
const assert = require("assert");

class BinaryTreeModel extends Model {
    static data() {
        return {
            // define model property
            left: BinaryTreeModel,
            right: BinaryTreeModel,
            
            id: "number",
            name: "string"
        };
    }

    findName(id) {
        if ( id == this.get("id") ) {
            return this.get("name");
        }

        if ( id > this.get("id") ) {
            let right = this.get("right");
            if ( right ) {
                return right.findName(id);
            }
        }
        else {
            let left = this.get("left");
            if ( left ) {
                return left.findName(id);
            }
        }

        return null;
    }
}

let tree = new BinaryTreeModel({
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
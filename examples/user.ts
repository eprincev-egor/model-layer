

// const {Model} = require("model-layer");
const {Model} = require("../lib/index");
const assert = require("assert");

class UserModel extends Model {
    static data() {
        return {
            
            // simplest define string property
            name: "string",

            // defined required field
            // with validate by RegExp
            email: {
                type: "string",
                required: true,
                validate: /.@./
            }
        };
    }
}

let user = new UserModel({
    name: "Bob",
    email: "bob@mail.com"
});

// any model has property .data
assert.deepEqual(
    user.data,
    {
        name: "Bob",
        email: "bob@mail.com"
    }
);

// like in Backbone you can user method get(key)
assert.strictEqual( user.get("name"), "Bob" );
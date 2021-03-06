

// const {Model} = require("model-layer");
import {Model, Types} from "../lib/index";
import assert from "assert";

class UserModel extends Model<UserModel> {
    structure() {
        return {
            
            // simplest define string property
            name: Types.String,

            // defined required field
            // with validate by RegExp
            email: Types.String({
                required: true,
                validate: /.@./
            })
        };
    }
}

const user = new UserModel({
    name: "Bob",
    email: "bob@mail.com"
});

// any model has property .row
assert.deepEqual(
    user.row,
    {
        name: "Bob",
        email: "bob@mail.com"
    }
);

// like in Backbone you can user method get(key)
assert.strictEqual( user.get("name"), "Bob" );

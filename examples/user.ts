

// const {Model} = require("model-layer");
import {Model} from "../lib/index";
import assert from "assert";

interface IUser {
    name: string;
    email: string;
}

class UserModel extends Model<IUser> {
    public static data() {
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

const user = new UserModel({
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


import {Collection, Model, Types} from "../../../lib/index";
import assert from "assert";

describe("Collection.toJSON", () => {

    it("toJSON()", () => {
        class User extends Model<User> {
            structure() {
                return {
                    name: Types.String
                };
            }
        }
        
        class Users extends Collection<User> {
            Model = User;
        }

        const users = new Users([
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
    });


});

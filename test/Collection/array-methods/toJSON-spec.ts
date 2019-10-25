
import {Collection, Model} from "../../../lib/index";
import assert from "assert";

describe("Collection.toJSON", () => {

    it("toJSON()", () => {
        
        interface IUser {
            name: string;
        }
        class User extends Model<IUser> {}

        class Users extends Collection<User> {
            public static data() {
                return {
                    name: "text"
                };
            }
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


import {Collection, Model} from "../../../lib/index";
import assert from "assert";

describe("Collection.splice", () => {

    it("splice(start, deleteCount)", () => {
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
            {name: "Alice"},
            {name: "Oliver"},
            {name: "Steve"}
        ]);

        assert.strictEqual( users.length, 3 );
        assert.strictEqual( users.first().get("name"), "Alice" );

        users.splice(0, 1);
        assert.strictEqual( users.length, 2 );
        assert.strictEqual( users.first().get("name"), "Oliver" );

        users.splice(0, 0);
        assert.strictEqual( users.length, 2 );
        assert.strictEqual( users.first().get("name"), "Oliver" );
        assert.strictEqual( users.last().get("name"), "Steve" );

        users.splice(1, 1);
        assert.strictEqual( users.length, 1 );
        assert.strictEqual( users.first().get("name"), "Oliver" );
    });

    it("splice(start, deleteCount, row)", () => {
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
            {name: "Alice"},
            {name: "Steve"}
        ]);

        assert.strictEqual( users.length, 2 );
        assert.strictEqual( users.first().get("name"), "Alice" );
        assert.strictEqual( users.last().get("name"), "Steve" );

        users.splice(1, 0, {
            name: "Oliver"
        });
        assert.strictEqual( users.length, 3 );
        assert.strictEqual( users.at(0).get("name"), "Alice" );
        assert.strictEqual( users.at(1).get("name"), "Oliver" );
        assert.strictEqual( users.at(2).get("name"), "Steve" );

    });

    it("splice(start, deleteCount, row1, row2)", () => {
        
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
            {name: "Steve"}
        ]);

        assert.strictEqual( users.length, 1 );
        assert.strictEqual( users.first().get("name"), "Steve" );

        users.splice(
            0, 0,
            {name: "Alice"},
            {name: "Oliver"}
        );
        assert.strictEqual( users.length, 3 );
        assert.strictEqual( users.at(0).get("name"), "Alice" );
        assert.strictEqual( users.at(1).get("name"), "Oliver" );
        assert.strictEqual( users.at(2).get("name"), "Steve" );

    });

    it("splice(start, deleteCount, model)", () => {
        interface IUser {
            name: string;
        }
        
        class User extends Model<IUser> {
            public static data() {
                return {
                    name: "text"
                };
            }
        }

        class Users extends Collection<User> {
            public static data() {
                return User;
            }
        }

        const users = new Users([
            {name: "Alice"},
            {name: "Steve"}
        ]);

        assert.strictEqual( users.length, 2 );
        assert.strictEqual( users.first().get("name"), "Alice" );
        assert.strictEqual( users.last().get("name"), "Steve" );

        users.splice(1, 0, new User({
            name: "Oliver"
        }));
        assert.strictEqual( users.length, 3 );
        assert.strictEqual( users.at(0).get("name"), "Alice" );
        assert.strictEqual( users.at(1).get("name"), "Oliver" );
        assert.strictEqual( users.at(2).get("name"), "Steve" );

    });

});

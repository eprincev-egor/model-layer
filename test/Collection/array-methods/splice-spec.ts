
import {Collection, Model, Types} from "../../../lib/index";
import assert from "assert";
import { Type } from "../../../lib/type/Type";

describe("Collection.splice", () => {

    it("splice(start, deleteCount)", () => {
        
        class User extends Model<User> {
            structure() {
                return {
                    name: Types.String
                };
            }
        }
        
        class Users extends Collection<Users> {
            Model() {
                return User;
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
        class User extends Model<User> {
            structure() {
                return {
                    name: Types.String
                };
            }
        }
        
        class Users extends Collection<Users> {
            Model() {
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

        users.splice(1, 0, {
            name: "Oliver"
        });
        assert.strictEqual( users.length, 3 );
        assert.strictEqual( users.at(0).get("name"), "Alice" );
        assert.strictEqual( users.at(1).get("name"), "Oliver" );
        assert.strictEqual( users.at(2).get("name"), "Steve" );

    });

    it("splice(start, deleteCount, row1, row2)", () => {
        
        class User extends Model<User> {
            structure() {
                return {
                    name: Types.String
                };
            }
        }
        
        class Users extends Collection<Users> {
            Model() {
                return User;
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
        class User extends Model<User> {
            structure() {
                return {
                    name: Types.String
                };
            }
        }
        
        class Users extends Collection<Users> {
            Model() {
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

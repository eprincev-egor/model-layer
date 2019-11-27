
import {Collection, Model, Types} from "../../../lib/index";
import assert from "assert";

describe("Collection.unshift", () => {
    
    it("unshift object", () => {
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
            {name: "Oliver"}
        ]);
        
        assert.strictEqual( users.length, 1 );

        users.unshift({
            name: "Bob"
        });

        assert.strictEqual( users.length, 2 );

        const user = users.at(0);
        assert.ok( user instanceof Model );
        assert.strictEqual( user.get("name"), "Bob" );
    });

    it("unshift(a, b, ...)", () => {
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

        const users = new Users();
        
        assert.strictEqual( users.length, 0 );

        users.unshift({
            name: "Bob"
        }, {
            name: "James"
        }, {
            name: "Oliver"
        });

        assert.strictEqual( users.length, 3 );

        assert.ok( users.at(0) instanceof Model );
        assert.strictEqual( users.at(0).get("name"), "Bob" );

        assert.ok( users.at(1) instanceof Model );
        assert.strictEqual( users.at(1).get("name"), "James" );

        assert.ok( users.at(2) instanceof Model );
        assert.strictEqual( users.at(2).get("name"), "Oliver" );
    });

    it("unshift CustomModel", () => {
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

        const user = new User({
            name: "Bob"
        });
        const users = new Users();
        
        assert.strictEqual( users.length, 0 );

        users.unshift( user );

        assert.strictEqual( users.length, 1 );

        const firstUser = users.at(0);
        assert.ok( firstUser === user );
    });

    it("unshift SomeModel", () => {
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

        const user = new User({
            name: "Bob"
        });
        const users = new Users();
        
        assert.strictEqual( users.length, 0 );

        users.unshift( user );

        assert.strictEqual( users.length, 1 );

        const firstUser = users.at(0);
        assert.ok( firstUser instanceof Model );
        assert.ok( firstUser !== user );
    });

    it("unshift()", () => {

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

        const users = new Users();
        
        assert.strictEqual( users.length, 0 );

        users.unshift();

        assert.strictEqual( users.length, 0 );
    });

    it("unshift(undefined)", () => {

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

        const users = new Users();
        
        assert.throws(
            () => {
                users.unshift(undefined);
            }, (err) =>
                err.message === "invalid model: undefined"
        );
    });

});

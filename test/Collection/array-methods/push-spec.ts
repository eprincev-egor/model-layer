
import {Collection, Model} from "../../../lib/index";
import assert from "assert";

describe("Collection.push", () => {

    it("push object", () => {
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
            {name: "Oliver"}
        ]);
        
        assert.strictEqual( users.length, 1 );

        users.push({
            name: "Bob"
        });

        assert.strictEqual( users.length, 2 );

        const user = users.at(1);
        assert.ok( user instanceof Model );
        assert.strictEqual( user.get("name"), "Bob" );
    });

    it("push(a, b, ...)", () => {
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

        const users = new Users();
        
        assert.strictEqual( users.length, 0 );

        users.push({
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

    it("push CustomModel", () => {
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

        const user = new User({
            name: "Bob"
        });
        const users = new Users();
        
        assert.strictEqual( users.length, 0 );

        users.push( user );

        assert.strictEqual( users.length, 1 );

        const pushedUser = users.at(0);
        assert.ok( pushedUser === user );
    });

    it("push SomeModel", () => {
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
                return {
                    name: "text"
                };
            }
        }

        const user = new User({
            name: "Bob"
        });
        const users = new Users();
        
        assert.strictEqual( users.length, 0 );

        users.push( user );

        assert.strictEqual( users.length, 1 );

        const pushedUser = users.at(0);
        assert.ok( pushedUser instanceof Model );
        assert.ok( pushedUser !== user );
    });

    it("push()", () => {
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

        const users = new Users();
        
        assert.strictEqual( users.length, 0 );

        users.push();

        assert.strictEqual( users.length, 0 );
    });

    it("push(undefined)", () => {
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

        const users = new Users();
        
        assert.throws(
            () => {
                users.push(undefined);
            }, (err) =>
                err.message === "invalid model: undefined"
        );
    });

});

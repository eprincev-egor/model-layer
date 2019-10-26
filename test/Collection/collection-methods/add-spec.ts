
import {Collection, Model} from "../../../lib/index";
import assert from "assert";

describe("Collection.add", () => {

    it("add object", () => {
        
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

        users.add({
            name: "Bob"
        });

        assert.strictEqual( users.length, 2 );

        const user = users.at(1);
        assert.ok( user instanceof Model );
        assert.strictEqual( user.get("name"), "Bob" );
    });

    it("add(a, b, ...)", () => {

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

        users.add({
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

    it("add CustomModel", () => {
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

        users.add( user );

        assert.strictEqual( users.length, 1 );

        const addedUser = users.at(0);
        assert.ok( addedUser === user );
    });

    it("add SomeModel", () => {
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

        users.add( user );

        assert.strictEqual( users.length, 1 );

        const addedUser = users.at(0);
        assert.ok( addedUser instanceof Model );
        assert.ok( addedUser !== user );
    });

    it("add()", () => {

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

        users.add();

        assert.strictEqual( users.length, 0 );
    });

    it("add(undefined)", () => {

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
                users.add(undefined);
            }, (err) =>
                err.message === "invalid model: undefined"
        );
    });

    it("add([obj, obj])", () => {
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

        users.add([
            {
                name: "Bob"
            }, {
                name: "James"
            }, {
                name: "Oliver"
            }
        ]);

        assert.strictEqual( users.length, 3 );

        assert.ok( users.at(0) instanceof Model );
        assert.strictEqual( users.at(0).get("name"), "Bob" );

        assert.ok( users.at(1) instanceof Model );
        assert.strictEqual( users.at(1).get("name"), "James" );

        assert.ok( users.at(2) instanceof Model );
        assert.strictEqual( users.at(2).get("name"), "Oliver" );
    });

    it("add([obj, model])", () => {
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

        const users = new Users();
        
        assert.strictEqual( users.length, 0 );

        users.add([
            {
                name: "Bob"
            }, {
                name: "James"
            }, new User({
                name: "Oliver"
            })
        ]);

        assert.strictEqual( users.length, 3 );

        assert.ok( users.at(0) instanceof Model );
        assert.strictEqual( users.at(0).get("name"), "Bob" );

        assert.ok( users.at(1) instanceof Model );
        assert.strictEqual( users.at(1).get("name"), "James" );

        assert.ok( users.at(2) instanceof Model );
        assert.strictEqual( users.at(2).get("name"), "Oliver" );
    });

    it("add([obj], [model])", () => {
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

        const users = new Users();
        
        assert.strictEqual( users.length, 0 );

        users.add([
            {
                name: "Bob"
            }
        ], [
            new User({
                name: "Oliver"
            })
        ]);

        assert.strictEqual( users.length, 2 );

        assert.ok( users.at(0) instanceof Model );
        assert.strictEqual( users.at(0).get("name"), "Bob" );

        assert.ok( users.at(1) instanceof Model );
        assert.strictEqual( users.at(1).get("name"), "Oliver" );
    });

});

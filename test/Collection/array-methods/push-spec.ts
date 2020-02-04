
import {Collection, Model, Types} from "../../../lib/index";
import assert from "assert";

describe("Collection.push", () => {

    it("push object", () => {
        class User extends Model<User> {
            structure() {
                return {
                    name: Types.String
                };
            }
        }
        
        class Users extends Collection<User> {
            Model() {
                return User;
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
        class User extends Model<User> {
            structure() {
                return {
                    name: Types.String
                };
            }
        }

        class Users extends Collection<User> {
            Model() {
                return User;
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
        class User extends Model<User> {
            structure() {
                return {
                    name: Types.String
                };
            }
        }

        class Users extends Collection<User> {
            Model() {
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
        class User extends Model<User> {
            structure() {
                return {
                    name: Types.String
                };
            }
        }
        
        class AnotherModel extends Model<AnotherModel> {
            structure() {
                return {
                    name: Types.String
                };
            }
        }


        class Users extends Collection<User> {
            Model() {
                return User;
            }
        }

        const someModel = new AnotherModel();
        const users = new Users();
        
        assert.strictEqual( users.length, 0 );

        assert.throws(
            () => {
                users.push(someModel);
            }, (err) =>
                err.message === "Users: expected model constructor User, but have AnotherModel"
        );

        assert.strictEqual( users.length, 0 );
    });

    it("push()", () => {
        class User extends Model<User> {
            structure() {
                return {
                    name: Types.String
                };
            }
        }

        class Users extends Collection<User> {
            Model() {
                return User;
            }
        }

        const users = new Users();
        
        assert.strictEqual( users.length, 0 );

        users.push();

        assert.strictEqual( users.length, 0 );
    });

    it("push(undefined)", () => {
        class User extends Model<User> {
            structure() {
                return {
                    name: Types.String
                };
            }
        }

        class Users extends Collection<User> {
            Model() {
                return User;
            }
        }

        const users = new Users();
        
        assert.throws(
            () => {
                users.push(undefined);
            }, (err) =>
                err.message === "invalid row undefined for model User"
        );
    });

});

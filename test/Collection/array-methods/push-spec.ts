

const {Collection, Model} = require("../../../lib/index");
const assert = require("assert");

describe("Collection.push", () => {

    it("push object", () => {
        class Users extends Collection {
            static data() {
                return {
                    name: "text"
                };
            }
        }

        let users = new Users([
            {name: "Oliver"}
        ]);
        
        assert.strictEqual( users.length, 1 );

        users.push({
            name: "Bob"
        });

        assert.strictEqual( users.length, 2 );

        let user = users.at(1);
        assert.ok( user instanceof Model );
        assert.strictEqual( user.get("name"), "Bob" );
    });

    it("push(a, b, ...)", () => {
        class Users extends Collection {
            static data() {
                return {
                    name: "text"
                };
            }
        }

        let users = new Users();
        
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
        class User extends Model {
            static data() {
                return {
                    name: "text"
                };
            }
        }

        class Users extends Collection {
            static data() {
                return User;
            }
        }

        let user = new User({
            name: "Bob"
        });
        let users = new Users();
        
        assert.strictEqual( users.length, 0 );

        users.push( user );

        assert.strictEqual( users.length, 1 );

        let pushedUser = users.at(0);
        assert.ok( pushedUser == user );
    });

    it("push SomeModel", () => {
        class User extends Model {
            static data() {
                return {
                    name: "text"
                };
            }
        }

        class Users extends Collection {
            static data() {
                return {
                    name: "text"
                };
            }
        }

        let user = new User({
            name: "Bob"
        });
        let users = new Users();
        
        assert.strictEqual( users.length, 0 );

        users.push( user );

        assert.strictEqual( users.length, 1 );

        let pushedUser = users.at(0);
        assert.ok( pushedUser instanceof Model );
        assert.ok( pushedUser != user );
    });

    it("push()", () => {

        class Users extends Collection {
            static data() {
                return {
                    name: "text"
                };
            }
        }

        let users = new Users();
        
        assert.strictEqual( users.length, 0 );

        users.push();

        assert.strictEqual( users.length, 0 );
    });

    it("push(undefined)", () => {

        class Users extends Collection {
            static data() {
                return {
                    name: "text"
                };
            }
        }

        let users = new Users();
        
        assert.throws(
            () => {
                users.push(undefined);
            }, err =>
                err.message == "invalid model: undefined"
        );
    });

});
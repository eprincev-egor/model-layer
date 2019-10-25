"use strict";

const {Collection, Model} = require("../../lib/index");
const assert = require("assert");

describe("Collection tests", () => {

    it("create empty collection", () => {

        class Users extends Collection {
            static data() {
                return {
                    name: "text"
                };
            }
        }
        
        let users = new Users();

        assert.ok( users instanceof Users );
        assert.ok( users instanceof Collection );

        assert.strictEqual( users.length, 0 );
    });

    it("create collection with rows", () => {
        class Users extends Collection {
            static data() {
                return {
                    name: "text"
                };
            }
        }

        let users = new Users([
            {name: "Bob"}
        ]);

        assert.strictEqual( users.length, 1 );
        
       
        let user = users.at(0);

        assert.ok( user instanceof Model );
        assert.strictEqual( user.get("name"), "Bob" );

    });

    it("create collection with models", () => {
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
        let users = new Users([
            user
        ]);

        assert.strictEqual( users.length, 1 );
        
        let firstUser = users.at(0);

        assert.ok( firstUser == user );
        assert.strictEqual( firstUser.get("name"), "Bob" );

    });

    it("set model by index", () => {
        class Users extends Collection {
            static data() {
                return {
                    name: "text"
                };
            }
        }

        let users = new Users();
        
        assert.strictEqual( users.length, 0 );

        users.at( 0, {name: "Bob"} );

        assert.strictEqual( users.length, 1 );

        let user = users.at(0);
        assert.ok( user instanceof Model );
        assert.strictEqual( user.get("name"), "Bob" );
    });

    it("once call data", () => {
        let calls = 0;

        class Products extends Collection {
            static data() {
                calls++;
                return {
                    name: "text",
                    price: "number"
                };
            }
        }

        new Products();
        new Products();
        new Products([
            {name: "Pie", price: 10}
        ]);

        assert.strictEqual( calls, 1 );
    });

    it("one model inside two collections", () => {
        class Company extends Model {
            static data() {
                return {
                    name: "text"
                };
            }
        }

        class Companies extends Collection {
            static data() {
                return Company;
            }
        }

        let company = new Company({
            name: "MicroApple"
        });

        let collection1 = new Companies();
        let collection2 = new Companies();

        collection1.add( company );
        collection2.add( company );

        assert.ok( collection1.first() == collection2.first() );
    });

});
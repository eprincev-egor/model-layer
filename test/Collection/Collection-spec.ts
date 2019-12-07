
import {Collection, Model, Types} from "../../lib/index";
import assert from "assert";

describe("Collection tests", () => {

    it("create empty collection", () => {

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

        assert.ok( users instanceof Users );
        assert.ok( users instanceof Collection );

        assert.strictEqual( users.length, 0 );
    });

    it("create collection with rows", () => {
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
            {name: "Bob"}
        ]);

        assert.strictEqual( users.length, 1 );
        
       
        const user = users.at(0);

        assert.ok( user instanceof Model );
        assert.strictEqual( user.get("name"), "Bob" );

    });

    it("create collection with models", () => {
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
        const users = new Users([
            user
        ]);

        assert.strictEqual( users.length, 1 );
        
        const firstUser = users.at(0);

        assert.ok( firstUser === user );
        assert.strictEqual( firstUser.get("name"), "Bob" );

    });

    it("set model by index", () => {
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

        users.at( 0, {name: "Bob"} );

        assert.strictEqual( users.length, 1 );

        const user = users.at(0);
        assert.ok( user instanceof Model );
        assert.strictEqual( user.get("name"), "Bob" );
    });

    it("once call data", () => {
        let calls = 0;

        class Product extends Model<Product> {
            structure() {
                calls++;
                return {
                    name: Types.String,
                    price: Types.Number
                };
            }
        }

        class Products extends Collection<Product> {
            Model() {
                return Product;
            }
        }

        const products1 = new Products();
        const products2 = new Products();
        const products3 = new Products([
            {name: "Pie", price: 10}
        ]);

        assert.strictEqual( calls, 1 );
    });

    it("one model inside two collections", () => {

        class Company extends Model<Company> {
            structure() {
                return {
                    name: Types.String
                };
            }
        }

        class Companies extends Collection<Company> {
            Model() {
                return Company;
            }
        }

        const company = new Company({
            name: "MicroApple"
        });

        const collection1 = new Companies();
        const collection2 = new Companies();

        collection1.add( company );
        collection2.add( company );

        assert.ok( collection1.first() === collection2.first() );
    });

    it("Collection without Model method", () => {

        class Companies extends Collection<Model> {
        }

        assert.throws(
            () => {
                const collection = new Companies();
            }, (err) =>
                err.message === "Companies.Model() is not declared"
        );
    });

});

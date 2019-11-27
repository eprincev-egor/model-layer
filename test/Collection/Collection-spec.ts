
import {Collection, Model} from "../../lib/index";
import assert from "assert";

describe("Collection tests", () => {

    it("create empty collection", () => {

        interface IUser {
            name: string;
        }
        class User extends Model<IUser> {}

        class Users extends Collection<User> {
            static data() {
                return {
                    name: "text"
                };
            }
        }
        
        const users = new Users();

        assert.ok( users instanceof Users );
        assert.ok( users instanceof Collection );

        assert.strictEqual( users.length, 0 );
    });

    it("create collection with rows", () => {
        interface IUser {
            name: string;
        }
        class User extends Model<IUser> {}

        class Users extends Collection<User> {
            static data() {
                return {
                    name: "text"
                };
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
        interface IUser {
            name: string;
        }
        
        class User extends Model<IUser> {
            static data() {
                return {
                    name: "text"
                };
            }
        }

        class Users extends Collection<User> {
            static data() {
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
        interface IUser {
            name: string;
        }
        class User extends Model<IUser> {}

        class Users extends Collection<User> {
            static data() {
                return {
                    name: "text"
                };
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

        interface IProduct {
            name: string;
            price: number;
        }
        class Product extends Model<IProduct> {}

        class Products extends Collection<Product> {
            static data() {
                calls++;
                return {
                    name: "text",
                    price: "number"
                };
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
        interface ICompany {
            name: string;
        }

        class Company extends Model<ICompany> {
            static data() {
                return {
                    name: "text"
                };
            }
        }

        class Companies extends Collection<Company> {
            static data() {
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

});

"use strict";

const {Collection, Model} = require("../../lib/index");
const assert = require("assert");

describe("Collection tests", () => {

    it("create empty collection", () => {

        class Users extends Collection {
            static structure() {
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
            static structure() {
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

    it("set model by index", () => {
        class Users extends Collection {
            static structure() {
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

    it("push object", () => {
        class Users extends Collection {
            static structure() {
                return {
                    name: "text"
                };
            }
        }

        let users = new Users();
        
        assert.strictEqual( users.length, 0 );

        users.push({
            name: "Bob"
        });

        assert.strictEqual( users.length, 1 );

        let user = users.at(0);
        assert.ok( user instanceof Model );
        assert.strictEqual( user.get("name"), "Bob" );
    });

    it("push(a, b, ...)", () => {
        class Users extends Collection {
            static structure() {
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
            static structure() {
                return {
                    name: "text"
                };
            }
        }

        class Users extends Collection {
            static structure() {
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
            static structure() {
                return {
                    name: "text"
                };
            }
        }

        class Users extends Collection {
            static structure() {
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
            static structure() {
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
            static structure() {
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

    it("forEach", () => {

        class Products extends Collection {
            static structure() {
                return {
                    name: "text",
                    price: "number"
                };
            }
        }

        let products = new Products([
            {name: "Eggs", price: 1.2},
            {name: "Milk", price: 2.75}
        ]);

        
        assert.strictEqual( products.length, 2 );


        let names = [];
        let prices = [];
        let indexes = [];

        products.forEach((product, i) => {
            assert.ok( product instanceof Model );

            names.push( product.get("name") );
            prices.push( product.get("price") );
            indexes.push( i );
        });

        assert.deepStrictEqual( names, ["Eggs", "Milk"] );
        assert.deepStrictEqual( prices, [1.2, 2.75] );
        assert.deepStrictEqual( indexes, [0, 1] );
    });

    it("forEach(f, context)", () => {

        class Products extends Collection {
            static structure() {
                return {
                    name: "text",
                    price: "number"
                };
            }
        }

        let products = new Products([
            {name: "Eggs", price: 1.2}
        ]);

        
        let context = {
            changed: false
        };

        products.forEach(function() {
            this.changed = true;
        }, context);

        assert.strictEqual(context.changed, true);
    });

    it("each", () => {

        class Products extends Collection {
            static structure() {
                return {
                    name: "text",
                    price: "number"
                };
            }
        }

        let products = new Products([
            {name: "Eggs", price: 1.2},
            {name: "Milk", price: 2.75}
        ]);

        
        assert.strictEqual( products.length, 2 );


        let names = [];
        let prices = [];
        let indexes = [];

        products.each((product, i) => {
            assert.ok( product instanceof Model );

            names.push( product.get("name") );
            prices.push( product.get("price") );
            indexes.push( i );
        });

        assert.deepStrictEqual( names, ["Eggs", "Milk"] );
        assert.deepStrictEqual( prices, [1.2, 2.75] );
        assert.deepStrictEqual( indexes, [0, 1] );
    });

    it("each(f, context)", () => {

        class Products extends Collection {
            static structure() {
                return {
                    name: "text",
                    price: "number"
                };
            }
        }

        let products = new Products([
            {name: "Eggs", price: 1.2}
        ]);

        
        let context = {
            changed: false
        };

        products.each(function() {
            this.changed = true;
        }, context);

        assert.strictEqual(context.changed, true);
    });

    it("once call structure", () => {
        let calls = 0;

        class Products extends Collection {
            static structure() {
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

    
    it("find()", () => {

        class Colors extends Collection {
            static structure() {
                return {
                    name: "text"
                };
            }
        }

        let colors = new Colors([
            {name: "red"},
            {name: "green"},
            {name: "blue"}
        ]);

        let red = colors.find(color =>
            color.get("name") == "red"
        );

        assert.strictEqual( red.get("name"), "red" );
    });
    
    it("find(f, context)", () => {
        class Products extends Collection {
            static structure() {
                return {
                    name: "text",
                    price: "number"
                };
            }
        }

        let products = new Products([
            {name: "Eggs", price: 1.2}
        ]);

        
        let context = {
            changed: false
        };

        products.find(function() {
            this.changed = true;
        }, context);

        assert.strictEqual(context.changed, true);
    });


    it("findIndex()", () => {

        class Colors extends Collection {
            static structure() {
                return {
                    name: "text"
                };
            }
        }

        let colors = new Colors([
            {name: "red"},
            {name: "green"},
            {name: "blue"}
        ]);

        let index = colors.findIndex(color =>
            color.get("name") == "green"
        );

        assert.strictEqual( index, 1 );
    });
    
    it("findIndex(f, context)", () => {
        class Products extends Collection {
            static structure() {
                return {
                    name: "text",
                    price: "number"
                };
            }
        }

        let products = new Products([
            {name: "Eggs", price: 1.2}
        ]);

        
        let context = {
            changed: false
        };

        products.findIndex(function() {
            this.changed = true;
        }, context);

        assert.strictEqual(context.changed, true);
    });

    it("filter()", () => {

        class Products extends Collection {
            static structure() {
                return {
                    name: "text",
                    price: "number"
                };
            }
        }

        let products = new Products([
            {name: "Eggs", price: 1.8},
            {name: "Pie", price: 10},
            {name: "Milk", price: 4}
        ]);

        let result = products.filter(product =>
            product.get("price") > 2
        );

        assert.strictEqual( result.length, 2 );
        assert.strictEqual( result[0].get("name"), "Pie" );
        assert.strictEqual( result[1].get("name"), "Milk" );
    });
    
    it("filter(f, context)", () => {
        class Products extends Collection {
            static structure() {
                return {
                    name: "text",
                    price: "number"
                };
            }
        }

        let products = new Products([
            {name: "Eggs", price: 1.2}
        ]);

        
        let context = {
            changed: false
        };

        products.filter(function() {
            this.changed = true;
        }, context);

        assert.strictEqual(context.changed, true);
    });

    it("map()", () => {

        class Products extends Collection {
            static structure() {
                return {
                    name: "text",
                    price: "number"
                };
            }
        }

        let products = new Products([
            {name: "Eggs", price: 1.8},
            {name: "Pie", price: 10},
            {name: "Milk", price: 4}
        ]);

        let prices = products.map(product =>
            product.get("price")
        );

        assert.deepStrictEqual( prices, [1.8, 10, 4] );
    });
    
    it("map(f, context)", () => {
        class Products extends Collection {
            static structure() {
                return {
                    name: "text",
                    price: "number"
                };
            }
        }

        let products = new Products([
            {name: "Eggs", price: 1.2}
        ]);

        
        let context = {
            changed: false
        };

        products.map(function() {
            this.changed = true;
        }, context);

        assert.strictEqual(context.changed, true);
    });

});
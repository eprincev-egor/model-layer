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

    it("reduce()", () => {

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

        let total = products.reduce((total, product) =>
            total + product.get("price"),
        0
        );

        assert.strictEqual( total, 15.8 );
    });
    
    it("every()", () => {

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

        let result = products.every(product =>
            product.get("price") > 5
        );
        assert.strictEqual( result, false );


        result = products.every(product =>
            product.get("price") > 1
        );
        assert.strictEqual( result, true );
    });
    
    it("every(f, context)", () => {
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

        products.every(function() {
            this.changed = true;
        }, context);

        assert.strictEqual(context.changed, true);
    });

    it("some()", () => {

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

        let result = products.some(product =>
            product.get("price") > 5
        );
        assert.strictEqual( result, true );


        result = products.some(product =>
            product.get("price") > 20
        );
        assert.strictEqual( result, false );
    });
    
    it("some(f, context)", () => {
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

        products.some(function() {
            this.changed = true;
        }, context);

        assert.strictEqual(context.changed, true);
    });
    
    it("slice(begin)", () => {

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

        let result = products.slice(0);
        assert.strictEqual( result.length, 3 );
        assert.strictEqual( result[0].get("name"), "Eggs" );
        assert.strictEqual( result[1].get("name"), "Pie" );
        assert.strictEqual( result[2].get("name"), "Milk" );


        result = products.slice(1);
        assert.strictEqual( result.length, 2 );
        assert.strictEqual( result[0].get("name"), "Pie" );
        assert.strictEqual( result[1].get("name"), "Milk" );
    });
    
    it("slice(begin, end)", () => {

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

        let result = products.slice(0, 2);
        assert.strictEqual( result.length, 2 );
        assert.strictEqual( result[0].get("name"), "Eggs" );
        assert.strictEqual( result[1].get("name"), "Pie" );


        result = products.slice(1, 2);
        assert.strictEqual( result.length, 1 );
        assert.strictEqual( result[0].get("name"), "Pie" );
    });

    it("indexOf(model)", () => {

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

        let firstModel = products.at(0);
        let lastModel = products.at(2);

        class SomeModel {
            static structure() {
                return {"*": "*"};
            }
        }
        let unknownModel = new SomeModel();

        
        let result = products.indexOf( lastModel );
        assert.strictEqual( result, 2 );

        result = products.indexOf( firstModel );
        assert.strictEqual( result, 0 );

        result = products.indexOf( unknownModel );
        assert.strictEqual( result, -1 );
    });
    
    it("indexOf(model, fromIndex)", () => {

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

        let firstModel = products.at(0);
        let lastModel = products.at(2);

        
        let result = products.indexOf( lastModel, 1 );
        assert.strictEqual( result, 2 );

        result = products.indexOf( firstModel, 1 );
        assert.strictEqual( result, -1 );
    });


    it("includes(model)", () => {

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

        let firstModel = products.at(0);
        let lastModel = products.at(2);

        class SomeModel {
            static structure() {
                return {"*": "*"};
            }
        }
        let unknownModel = new SomeModel();

        
        let result = products.includes( lastModel );
        assert.strictEqual( result, true );

        result = products.includes( firstModel );
        assert.strictEqual( result, true );

        result = products.includes( unknownModel );
        assert.strictEqual( result, false );
    });

    it("includes(model, fromIndex)", () => {

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

        let firstModel = products.at(0);
        let lastModel = products.at(2);

        
        let result = products.includes( lastModel, 1 );
        assert.strictEqual( result, true );

        result = products.includes( firstModel, 1 );
        assert.strictEqual( result, false );
    });

    it("pop()", () => {
        
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

        assert.strictEqual( products.length, 3 );

        let result = products.pop();
        assert.strictEqual( result.get("name"), "Milk" );
        assert.strictEqual( products.length, 2 );

        result = products.pop();
        assert.strictEqual( result.get("name"), "Pie" );
        assert.strictEqual( products.length, 1 );

        result = products.pop();
        assert.strictEqual( result.get("name"), "Eggs" );
        assert.strictEqual( products.length, 0 );

        result = products.pop();
        assert.strictEqual( result, undefined );
        assert.strictEqual( products.length, 0 );
    });

    it("shift()", () => {
        
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

        assert.strictEqual( products.length, 3 );

        let result = products.shift();
        assert.strictEqual( result.get("name"), "Eggs" );
        assert.strictEqual( products.length, 2 );

        result = products.shift();
        assert.strictEqual( result.get("name"), "Pie" );
        assert.strictEqual( products.length, 1 );

        result = products.shift();
        assert.strictEqual( result.get("name"), "Milk" );
        assert.strictEqual( products.length, 0 );

        result = products.shift();
        assert.strictEqual( result, undefined );
        assert.strictEqual( products.length, 0 );
    });


    
    it("unshift object", () => {
        class Users extends Collection {
            static structure() {
                return {
                    name: "text"
                };
            }
        }

        let users = new Users([
            {name: "Oliver"}
        ]);
        
        assert.strictEqual( users.length, 1 );

        users.unshift({
            name: "Bob"
        });

        assert.strictEqual( users.length, 2 );

        let user = users.at(0);
        assert.ok( user instanceof Model );
        assert.strictEqual( user.get("name"), "Bob" );
    });

    it("unshift(a, b, ...)", () => {
        class Users extends Collection {
            static structure() {
                return {
                    name: "text"
                };
            }
        }

        let users = new Users();
        
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

        users.unshift( user );

        assert.strictEqual( users.length, 1 );

        let firstUser = users.at(0);
        assert.ok( firstUser == user );
    });

    it("unshift SomeModel", () => {
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

        users.unshift( user );

        assert.strictEqual( users.length, 1 );

        let firstUser = users.at(0);
        assert.ok( firstUser instanceof Model );
        assert.ok( firstUser != user );
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

        users.unshift();

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
                users.unshift(undefined);
            }, err =>
                err.message == "invalid model: undefined"
        );
    });

});
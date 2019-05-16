"use strict";

const {Model, Collection} = require("../../lib/index");
const assert = require("assert");
const {eol} = require("../../lib/utils");

describe("CollectionType", () => {

    it("Collection property", () => {
        class Products extends Collection {
            static structure() {
                return {
                    name: "text"
                };
            }
        }

        class Cart extends Model {
            static structure() {
                return {
                    products: Products
                };
            }
        }

        let cart = new Cart();

        assert.ok(
            cart.get("products") === null
        );

        assert.throws(
            () => {
                new Cart({
                    products: false
                });
            },
            err =>
                err.message == "invalid collection Products for products: false"
        );

        let products = new Products();
        cart = new Cart({
            products
        });

        assert.ok( cart.get("products") === products );
    });

    it("create Collection by array", () => {
        class Products extends Collection {
            static structure() {
                return {
                    name: "text"
                };
            }
        }

        class Cart extends Model {
            static structure() {
                return {
                    products: Products
                };
            }
        }

        let cart = new Cart({
            products: [
                {name: "nice"}
            ]
        });

        assert.deepStrictEqual( cart.toJSON(), {
            products: [
                {name: "nice"}
            ]
        });
    });

    it("Collection.toJSON()", () => {
        class SomeCollection extends Collection {
            static structure() {
                return {
                    name: "text"
                };
            }
        }

        class SomeModel extends Model {
            static structure() {
                return {
                    some: SomeCollection
                };
            }
        }

        let value = new SomeCollection();
        let model = new SomeModel({
            some: value
        });

        assert.deepEqual(
            model.toJSON(),
            {
                some: []
            }
        );
    });


    it("Collection.clone()", () => {
        class SomeCollection extends Collection {
            static structure() {
                return {
                    name: "text"
                };
            }
        }

        class SomeModel extends Model {
            static structure() {
                return {
                    some: SomeCollection
                };
            }
        }

        let value = new SomeCollection();
        let model = new SomeModel({
            some: value
        });

        let clone = model.clone();
        
        assert.ok(
            clone.get("some") != value
        );
    });

    
    it("array of Collection", () => {
        class MyCollection extends Collection {
            static structure() {
                return {
                    id: {
                        type: "number",
                        primary: true
                    }
                };
            }
        }

        class SomeModel extends Model {
            static structure() {
                return {
                    arr: [MyCollection]
                };
            }
        }

        assert.throws(
            () => {
                new SomeModel({
                    arr: [false]
                });
            },
            err =>
                err.message == `invalid array[collection MyCollection] for arr: [false],${eol} invalid collection MyCollection for 0: false`
        );
    });

    
    it("equal Collections", () => {
        class CustomCollection extends Collection {
            static structure() {
                return {
                    name: "text"
                };
            }
        }

        let collection1 = new CustomCollection([
            {name: "X"}
        ]);
        let collection2 = new CustomCollection([
            {name: "X"}
        ]);
        let collection3 = new CustomCollection([
            {name: "X"},
            {name: "Y"}
        ]);
        let collection4 = new CustomCollection([
            {name: "Y"}
        ]);
        let collection5 = new CustomCollection();
        let arr1 = [
            {name: "X"}
        ];
        let arr2 = [
            {name: "Y"}
        ];

        let pairs = [
            [null, null, true],
            [null, collection1, false],
            [collection1, collection1, true],
            [collection1, collection2, true],
            [collection1, collection3, false],
            [collection1, collection4, false],
            [collection3, collection4, false],
            [collection2, collection4, false],
            [collection1, collection5, false],
            [collection1, arr1, true],
            [collection4, arr2, true]
        ];

        pairs.forEach(pair => {
            class TestModel extends Model {
                static structure() {
                    return {
                        custom: CustomCollection
                    };
                }
            }

            let model1 = new TestModel({
                custom: pair[0]
            });

            let model2 = new TestModel({
                custom: pair[1]
            });

            assert.strictEqual(
                model1.equal( model2 ),
                pair[2],
                JSON.stringify(pair)
            );

            assert.strictEqual(
                model2.equal( model1 ),
                pair[2],
                JSON.stringify(pair)
            );
        });
    });

    it("equal Collections, circular recursion", () => {
        class CustomCollection extends Collection {
            static structure() {
                return {
                    name: "text",
                    child: CustomCollection
                };
            }
        }

        class TestModel extends Model {
            static structure() {
                return {
                    collection: CustomCollection
                };
            }
        }

        let collection1 = new CustomCollection([
            {name: "X"}
        ]);
        collection1.first().set("child", collection1);

        let collection2 = new CustomCollection([
            {name: "X"}
        ]);
        collection2.first().set("child", collection2);

        let model1 = new TestModel({
            collection: collection1
        });

        let model2 = new TestModel({
            collection: collection2
        });

        assert.ok( model1.equal( model2 ) );
        assert.ok( model2.equal( model1 ) );
        assert.ok( model1.equal( model1 ) );
    });
   
});
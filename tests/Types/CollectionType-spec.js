"use strict";

const {Model, Collection} = require("../../lib/index");
const assert = require("assert");
// const {eol} = require("../../lib/utils");

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

    /*
    it("array of CustomClass", () => {
        class MyClass {}

        class SomeModel extends Model {
            static structure() {
                return {
                    arr: [MyClass]
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
                err.message == `invalid array[MyClass] for arr: [false],${eol} invalid MyClass for 0: false`
        );
    });

    
    it("equal CustomClass", () => {
        class CustomClass {}

        let obj1 = new CustomClass();
        let obj2 = new CustomClass();

        let pairs = [
            [null, null, true],
            [null, obj1, false],
            [obj1, obj1, true],
            [obj1, obj2, false]
        ];

        pairs.forEach(pair => {
            class TestModel extends Model {
                static structure() {
                    return {
                        custom: CustomClass
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
    */
});
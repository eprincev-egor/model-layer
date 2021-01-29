
import {Model, Collection, Types} from "../../lib/index";
import assert from "assert";
import {eol} from "../../lib/utils";

describe("CollectionType", () => {

    it("Collection property", () => {
        class Product extends Model<Product> {
            structure() {
                return {
                    name: Types.String
                };
            }
        }

        class Products extends Collection<Product> {
            Model() {
                return Product;
            }
        }

        class Cart extends Model<Cart> {
            structure() {
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
                const AnyCart = Cart as any;
                const someCart = new AnyCart({
                    products: false
                });
            },
            (err: Error) =>
                err.message === "invalid collection Products for products: false"
        );

        const products = new Products();
        cart = new Cart({
            products
        });

        assert.ok( cart.get("products") === products );
    });

    it("create Collection by array", () => {
        class Product extends Model<Product> {
            structure() {
                return {
                    name: Types.String
                };
            }
        }

        class Products extends Collection<Product> {
            Model() {
                return Product;
            }
        }

        class Cart extends Model<Cart> {
            structure() {
                return {
                    products: Products
                };
            }
        }

        const cart = new Cart({
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
        
        class Data extends Model<Data> {
            structure() {
                return {
                    name: Types.String
                };
            }
        }

        class SomeCollection extends Collection<Data> {
            Model() {
                return Data;
            }
        }


        class SomeModel extends Model<SomeModel> {
            structure() {
                return {
                    some: SomeCollection
                };
            }
        }

        const value = new SomeCollection();
        const model = new SomeModel({
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
        class Data extends Model<Data> {
            structure() {
                return {
                    name: Types.String
                };
            }
        }

        class SomeCollection extends Collection<Data> {
            Model() {
                return Data;
            }
        }


        class SomeModel extends Model<SomeModel> {
            structure() {
                return {
                    some: SomeCollection
                };
            }
        }

        const value = new SomeCollection();
        const model = new SomeModel({
            some: value
        });

        const clone = model.clone();
        
        assert.ok(
            clone.get("some") !== value
        );
    });

    
    it("array of Collection", () => {
        
        class Data extends Model<Data> {
            structure() {
                return {
                    id: Types.Number({
                        primary: true
                    })
                };
            }
        }

        class MyCollection extends Collection<Data> {
            Model() {
                return Data;
            }
        }


        class SomeModel extends Model<SomeModel> {
            structure() {
                return {
                    arr: Types.Array({
                        element: MyCollection
                    })
                };
            }
        }

        assert.throws(
            () => {
                const AnyModel = SomeModel as any;
                const someModel = new AnyModel({
                    arr: [false]
                });
            },
            (err: Error) =>
                err.message === `invalid element for array collection MyCollection[] at 0 for model field arr: [false],${eol} invalid collection MyCollection for 0: false`
        );

        const model = new SomeModel({
            arr: [
                [{id: 1}]
            ]
        });

        assert.deepStrictEqual(model.toJSON(), {
            arr: [
                [{id: 1}]
            ]
        });
    });

    
    it("equal Collections", () => {
        
        class Data extends Model<Data> {
            structure() {
                return {
                    name: Types.String
                };
            }
        }

        class CustomCollection extends Collection<Data> {
            Model() {
                return Data;
            }
        }

        const collection1 = new CustomCollection([
            {name: "X"}
        ]);
        const collection2 = new CustomCollection([
            {name: "X"}
        ]);
        const collection3 = new CustomCollection([
            {name: "X"},
            {name: "Y"}
        ]);
        const collection4 = new CustomCollection([
            {name: "Y"}
        ]);
        const collection5 = new CustomCollection();
        const arr1 = [
            {name: "X"}
        ];
        const arr2 = [
            {name: "Y"}
        ];

        const pairs: any[][] = [
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

        interface ITest {
            custom: CustomCollection;
        }

        pairs.forEach((pair) => {
            class TestModel extends Model<TestModel> {
                structure() {
                    return {
                        custom: CustomCollection
                    };
                }
            }

            const model1 = new TestModel({
                custom: pair[0]
            });

            const model2 = new TestModel({
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
        
        class Item extends Model<Item> {
            structure() {
                return {
                    name: Types.String,
                    child: CustomCollection
                };
            }
        }

        class CustomCollection extends Collection<Item> {
            Model() {
                return Item;
            }
        }

        class TestModel extends Model<TestModel> {
            structure() {
                return {
                    collection: CustomCollection
                };
            }
        }

        const collection1 = new CustomCollection([
            {name: "X"}
        ]);
        collection1.first().set({child: collection1});

        const collection2 = new CustomCollection([
            {name: "X"}
        ]);
        collection2.first().set({child: collection2});

        const model1 = new TestModel({
            collection: collection1
        });

        const model2 = new TestModel({
            collection: collection2
        });

        assert.ok( model1.equal( model2 ) );
        assert.ok( model2.equal( model1 ) );
        assert.ok( model1.equal( model1 ) );
    });
   

    it("nullAsEmpty", () => {
        class Product extends Model<Product> {
            structure() {
                return {
                    name: Types.String
                };
            }
        }

        class Products extends Collection<Product> {
            Model() {
                return Product;
            }
        }

        class SomeModel extends Model<SomeModel> {
            structure() {
                return {
                    products: Types.Collection({
                        Collection: Products,
                        nullAsEmpty: true
                    })
                };
            }
        }

        const model = new SomeModel();
        assert.deepEqual( model.toJSON(), {
            products: []
        });

        model.set({
            products: [{
                name: "Milk"
            }]
        });
        assert.deepEqual( model.toJSON(), {
            products: [{
                name: "Milk"
            }]
        });

        model.set({products: null as any});
        assert.deepEqual( model.toJSON(), {
            products: []
        });
    });

    it("circular structure to json", () => {
        
        class MyModel extends Model<MyModel> {
            structure() {
                return {
                    collection: MyCollection
                };
            }
        }
        class MyCollection extends Collection<MyModel> {
            Model() {
                return MyModel;
            }
        }

        const collection = new MyCollection();
        const model = new MyModel({
            collection
        });
        collection.add(model);

        assert.throws(
            () => {
                model.toJSON();
            },
            (err: Error) =>
                err.message === "Cannot converting circular structure to JSON"
        );
    });

});

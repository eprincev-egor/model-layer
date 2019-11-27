
import {Model, Collection} from "../../lib/index";
import assert from "assert";
import {eol} from "../../lib/utils";

describe("CollectionType", () => {

    it("Collection property", () => {
        interface IProduct {
            name: string;
        }
        class Product extends Model<IProduct> {}

        class Products extends Collection<Product> {
            static data() {
                return {
                    name: "text"
                };
            }
        }

        interface ICart {
            products: Products;
        }

        class Cart extends Model<ICart> {
            static data() {
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
            (err) =>
                err.message === "invalid collection Products for products: false"
        );

        const products = new Products();
        cart = new Cart({
            products
        });

        assert.ok( cart.get("products") === products );
    });

    it("create Collection by array", () => {
        interface IProduct {
            name: string;
        }
        class Product extends Model<IProduct> {}

        class Products extends Collection<Product> {
            static data() {
                return {
                    name: "text"
                };
            }
        }

        interface ICart {
            products: Products;
        }

        class Cart extends Model<ICart> {
            static data() {
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
        interface IData {
            name: string;
        }
        class Data extends Model<IData> {}

        class SomeCollection extends Collection<Data> {
            static data() {
                return {
                    name: "text"
                };
            }
        }

        interface ISome {
            some: SomeCollection;
        }

        class SomeModel extends Model<ISome> {
            static data() {
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
        interface IData {
            name: string;
        }
        class Data extends Model<IData> {}

        class SomeCollection extends Collection<Data> {
            static data() {
                return {
                    name: "text"
                };
            }
        }

        interface ISome {
            some: SomeCollection;
        }

        class SomeModel extends Model<ISome> {
            static data() {
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
        interface IData {
            id: number;
        }
        class Data extends Model<IData> {}

        class MyCollection extends Collection<Data> {
            static data() {
                return {
                    id: {
                        type: "number",
                        primary: true
                    }
                };
            }
        }

        interface ISome {
            arr: Array<MyCollection | IData[]>;
        }

        class SomeModel extends Model<ISome> {
            static data() {
                return {
                    arr: [MyCollection]
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
            (err) =>
                err.message === `invalid array[collection MyCollection] for arr: [false],${eol} invalid collection MyCollection for 0: false`
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
        interface IData {
            name: string;
        }
        class Data extends Model<IData> {}

        class CustomCollection extends Collection<Data> {
            static data() {
                return {
                    name: "text"
                };
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
            class TestModel extends Model<ITest> {
                static data() {
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
        interface IItem {
            name: string;
            child: CustomCollection;
        }
        class Item extends Model<IItem> {}

        class CustomCollection extends Collection<Item> {
            static data() {
                return {
                    name: "text",
                    child: CustomCollection
                };
            }
        }

        interface ITest {
            collection: CustomCollection;
        }
        class TestModel extends Model<ITest> {
            static data() {
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
        interface IProduct {
            name: string;
        }
        class Product extends Model<IProduct> {}

        class Products extends Collection<Product> {
            static data() {
                return {
                    name: "text"
                };
            }
        }

        interface ISome {
            products: Products;
        }

        class SomeModel extends Model<ISome> {
            static data() {
                return {
                    products: {
                        type: Products,
                        nullAsEmpty: true
                    }
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

        model.set({products: null});
        assert.deepEqual( model.toJSON(), {
            products: []
        });
    });

});

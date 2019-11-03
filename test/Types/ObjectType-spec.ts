
import {Model, Collection} from "../../lib/index";
import assert from "assert";
import {eol} from "../../lib/utils";
import { ISimpleObject } from "../../lib/Model";

describe("ObjectType", () => {
    
    it("object", () => {
        interface ISomeModel {
            map: {
                [key: string]: any;
            };
        }

        class SomeModel extends Model<ISomeModel> {
            public static data() {
                return {
                    map: "object"
                };
            }
        }
        const AnyModel = SomeModel as any;

        assert.throws(
            () => {
                const someModel = new AnyModel({
                    map: false
                });
            }, 
            (err) => 
                err.message ===  "invalid object for map: false"
        );
        

        assert.throws(
            () => {
                const someModel = new AnyModel({
                    map: true
                });
            }, 
            (err) => 
                err.message ===  "invalid object for map: true"
        );
        

        assert.throws(
            () => {
                const someModel = new AnyModel({
                    map: "1,2"
                });
            }, 
            (err) => 
                err.message ===  "invalid object for map: \"1,2\""
        );
        

        assert.throws(
            () => {
                const someModel = new AnyModel({
                    map: NaN
                });
            }, 
            (err) => 
                err.message ===  "invalid object for map: NaN"
        );
        

        assert.throws(
            () => {
                const someModel = new AnyModel({
                    map: /x/
                });
            }, 
            (err) => 
                err.message ===  "invalid object for map: /x/"
        );
        
        assert.throws(
            () => {
                const someModel = new AnyModel({
                    map: []
                });
            }, 
            (err) => 
                err.message ===  "invalid object for map: []"
        );
        

        assert.throws(
            () => {
                const someModel = new AnyModel({
                    map: Infinity
                });
            }, 
            (err) => 
                err.message ===  "invalid object for map: Infinity"
        );
        

        assert.throws(
            () => {
                const someModel = new AnyModel({
                    map: -Infinity
                });
            }, 
            (err) =>
                err.message === "invalid object for map: -Infinity"
        );
        

        assert.throws(
            () => {
                const someModel = new AnyModel({
                    map: 0
                });
            }, 
            (err) => 
                err.message ===  "invalid object for map: 0"
        );
        


        assert.throws(
            () => {
                const someModel = new AnyModel({
                    map: [false]
                });
            }, 
            (err) => 
                err.message === "invalid object for map: [false]"
        );
        


        const outsideObj = {
            a: "1",
            b: "2"
        };
        const model = new SomeModel({
            map: outsideObj
        });

        const map = model.get("map");

        assert.deepEqual( map, outsideObj );

        assert.ok( outsideObj !== map );


        // array should be frozen
        assert.throws(
            () => {
                map.a = 10;
            },
            (err) =>
                /Cannot assign to read only property/.test(err.message)
        );
        

        assert.deepEqual( map, outsideObj );
    });

    
    
    it("emptyAsNull", () => {
        interface ISomeData {
            words: object;
        }

        class SomeModel extends Model<ISomeData> {
            public static data() {
                return {
                    words: {
                        type: "object",
                        emptyAsNull: true
                    }
                };
            }
        }

        const model = new SomeModel();
        assert.strictEqual( model.data.words, null );

        model.set({words: {red: true}});
        assert.deepEqual( model.data.words, {red: true} );

        model.set({words: {}});
        assert.strictEqual( model.data.words, null );
    });

    it("nullAsEmpty", () => {
        interface ISomeData {
            words: object;
        }

        class SomeModel extends Model<ISomeData> {
            public static data() {
                return {
                    words: {
                        type: "object",
                        nullAsEmpty: true
                    }
                };
            }
        }

        const model = new SomeModel();
        assert.deepEqual( model.data.words, [] );

        model.set({words: {water: true}});
        assert.deepEqual( model.data.words, {water: true} );

        model.set({words: null});
        assert.deepEqual( model.data.words, {} );
    });

    it("recursive clone object", () => {
        interface ISomeData {
            tree: any;
        }

        class SomeModel extends Model<ISomeData> {
            public static data() {
                return {
                    tree: "object"
                };
            }
        }

        const model = new SomeModel({
            tree: {
                name: "test",
                tree: {
                    name: "nice",
                    arr: [{ x: 1 }]
                }
            }
        });

        assert.deepEqual( model.data, {
            tree: {
                name: "test",
                tree: {
                    name: "nice",
                    arr: [{ x: 1 }]
                }
            }
        });

        const clone = model.clone();

        assert.deepEqual( clone.data, {
            tree: {
                name: "test",
                tree: {
                    name: "nice",
                    arr: [{ x: 1 }]
                }
            }
        });

        assert.ok(
            clone.data.tree !== model.data.tree
        );

        assert.ok(
            clone.data.tree.tree !== model.data.tree.tree
        );

        assert.ok(
            clone.data.tree.tree.arr !== model.data.tree.tree.arr
        );

        assert.ok(
            clone.data.tree.tree.arr[0] !== model.data.tree.tree.arr[0]
        );
    });
    
    it("model.toJSON with object property", () => {
        interface ISomeData {
            names: {
                [key: string]: boolean;
            };
        }

        class SomeModel extends Model<ISomeData> {
            public static data() {
                return {
                    names: "object"
                };
            }
        }

        const model = new SomeModel({
            names: {
                Bob: true,
                James: true
            }
        });

        assert.deepEqual(
            model.toJSON(),
            {
                names: {
                    Bob: true,
                    James: true
                }
            }
        );
    });

    it("recursive convert object to json", () => {
        interface ISomeData {
            tree: any;
        }

        class SomeModel extends Model<ISomeData> {
            public static data() {
                return {
                    tree: "object"
                };
            }
        }

        const model = new SomeModel({
            tree: {
                name: "test",
                tree: {
                    name: "nice",
                    arr: [{ x: 1 }]
                }
            }
        });

        const json = model.toJSON();

        assert.deepEqual( json, {
            tree: {
                name: "test",
                tree: {
                    name: "nice",
                    arr: [{ x: 1 }]
                }
            }
        });

        assert.ok(
            json.tree !== model.data.tree
        );

        assert.ok(
            json.tree.tree !== model.data.tree.tree
        );

        assert.ok(
            json.tree.tree.arr !== model.data.tree.tree.arr
        );

        assert.ok(
            json.tree.tree.arr[0] !== model.data.tree.tree.arr[0]
        );
    });

    it("prepare object value", () => {
        interface ISomeData {
            object: {
                [key: string]: number | string;
            };
        }

        class SomeModel extends Model<ISomeData> {
            public static data() {
                return {
                    object: {
                        type: "object",
                        element: "number"
                    }
                };
            }
        }

        const model = new SomeModel({
            object: {
                a: "10",
                b: "20"
            }
        });
        assert.strictEqual( model.data.object.a, 10 );
        assert.strictEqual( model.data.object.b, 20 );
    });

    it("object of any values", () => {
        interface ISomeData {
            object: object;
        }

        class SomeModel extends Model<ISomeData> {
            public static data() {
                return {
                    object: {}
                };
            }
        }

        const model = new SomeModel({
            object: {
                a: 10,
                b: true,
                c: "nice"
            }
        });

        assert.deepStrictEqual( model.data, {
            object: {
                a: 10,
                b: true,
                c: "nice"
            }
        });
    });

    it("validate element", () => {
        interface ISomeData {
            object: {
                [key: string]: number | string;
            };
        }

        class SomeModel extends Model<ISomeData> {
            public static data() {
                return {
                    object: {
                        type: "object",
                        element: "number"
                    }
                };
            }
        }

        assert.throws(
            () => {
                const model = new SomeModel({
                    object: {
                        a: 10,
                        b: "nice"
                    }
                });
            }, 
            (err) => 
                err.message === `invalid object[number] for object: {"a":10,"b":"nice"},${eol} invalid number for b: "nice"`
        );
    });

    it("equal objects", () => {
        const pairs: any[][] = [
            [null, null, true],
            [null, {}, false],
            [{}, {}, true],
            [{x: 1}, {x: 1}, true],
            [{x: 1}, {x: 1, y: 2}, false]
        ];

        interface ISomeData {
            obj: {
                [key: string]: number | string;
            };
        }

        pairs.forEach((pair) => {
            class TestModel extends Model<ISomeData> {
                public static data() {
                    return {
                        obj: {element: "number"}
                    };
                }
            }

            const model1 = new TestModel({
                obj: pair[0]
            });

            const model2 = new TestModel({
                obj: pair[1]
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


    it("equal circular objects", () => {
        const circular1: any = {};
        circular1.self = circular1;

        const circular2: any = {};
        circular2.self = circular2;

        const circular3: any = {};
        circular3.self = circular3;
        circular3.x = {};

        const pairs = [
            [circular1, circular1, true],
            [circular1, circular2, true],
            [circular2, circular2, true],
            [circular1, circular3, false],
            [circular2, circular3, false]
        ];

        interface ISomeData {
            obj: any;
        }

        pairs.forEach((pair) => {
            class TestModel extends Model<ISomeData> {
                public static data() {
                    return {
                        obj: {
                            element: {
                                type: "object",
                                element: "object"
                            }
                        }
                    };
                }
            }

            const model1 = new TestModel({
                obj: pair[0]
            });

            const model2 = new TestModel({
                obj: pair[1]
            });

            assert.strictEqual(
                model1.equal( model2 ),
                pair[2],
                pair.toString()
            );

            assert.strictEqual(
                model2.equal( model1 ),
                pair[2],
                pair.toString()
            );
        });
    });

    
    // when in type defined BaseModel, and in data we have ChildModel (extends BaseModel), 
    // then clone should be instance of ChildModel
    it("clone object of models, should return object of instance of Child", () => {
        
        class FirstLevel extends Model<ISimpleObject> {}

        class SecondLevel extends FirstLevel {
            public static data() {
                return {
                    level: {
                        type: "number",
                        default: 2
                    }
                };
            }
        }

        interface IMain {
            obj: {
                [key: string]: FirstLevel
            };
        }
        class MainModel extends Model<IMain> {
            public static data() {
                return {
                    obj: {element: FirstLevel}
                };
            }
        }

        const second = new SecondLevel();
        const main = new MainModel({
            obj: {prop: second}
        });

        assert.deepEqual(
            main.toJSON(),
            {
                obj: {prop: {
                    level: 2
                }}
            }
        );

        const clone = main.clone();

        assert.ok( clone.get("obj").prop instanceof SecondLevel );

    });

    it("conflicting parameters: nullAsEmpty and emptyAsNull", () => {
        interface ISomeData {
            obj: object;
        }

        class SomeModel extends Model<ISomeData> {
            public static data() {
                return {
                    obj: {
                        type: "object",
                        nullAsEmpty: true,
                        emptyAsNull: true
                    }
                };
            }
        }

        assert.throws(
            () => {
                const model = new SomeModel();
            },
            (err) =>
                err.message === "obj: conflicting parameters: use only nullAsEmpty or only emptyAsNull"
        );
    });

});

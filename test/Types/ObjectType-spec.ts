
import {Model, Types} from "../../lib/index";
import assert from "assert";
import {eol} from "../../lib/utils";

describe("ObjectType", () => {
    
    it("object", () => {

        class SomeModel extends Model<SomeModel> {
            structure() {
                return {
                    map: Types.Object
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
        class SomeModel extends Model<SomeModel> {
            structure() {
                return {
                    words: Types.Object({
                        element: Types.Any,
                        emptyAsNull: true
                    })
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

        class SomeModel extends Model<SomeModel> {
            structure() {
                return {
                    words: Types.Object({
                        element: Types.Any,
                        nullAsEmpty: true
                    })
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
        class SomeModel extends Model<SomeModel> {
            structure() {
                return {
                    tree: Types.Object
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

        class SomeModel extends Model<SomeModel> {
            structure() {
                return {
                    names: Types.Object({
                        element: Types.Boolean
                    })
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

        class SomeModel extends Model<SomeModel> {
            structure() {
                return {
                    tree: Types.Object
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

        class SomeModel extends Model<SomeModel> {
            structure() {
                return {
                    object: Types.Object({
                        element: Types.Number
                    })
                };
            }
        }

        const model = new SomeModel({
            object: {
                a: "10" as any,
                b: "20" as any
            }
        });
        assert.strictEqual( model.data.object.a, 10 );
        assert.strictEqual( model.data.object.b, 20 );
    });

    it("object of any values", () => {

        class SomeModel extends Model<SomeModel> {
            structure() {
                return {
                    object: Types.Object
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

        class SomeModel extends Model<SomeModel> {
            structure() {
                return {
                    object: Types.Object({
                        element: Types.Number
                    })
                };
            }
        }

        assert.throws(
            () => {
                const model = new SomeModel({
                    object: {
                        a: 10,
                        b: "nice" as any
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

        pairs.forEach((pair) => {
            class TestModel extends Model<TestModel> {
                structure() {
                    return {
                        obj: Types.Object({
                            element: Types.Number
                        })
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


        pairs.forEach((pair) => {
            class TestModel extends Model<TestModel> {
                structure() {
                    return {
                        obj: Types.Object({
                            element: Types.Object({
                                element: Types.Object
                            })
                        })
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
        
        class FirstLevel extends Model<FirstLevel> {}

        class SecondLevel extends FirstLevel {
            structure() {
                return {
                    level: Types.Number({
                        default: 2
                    })
                };
            }
        }

        class MainModel extends Model<MainModel> {
            structure() {
                return {
                    obj: Types.Object({
                        element: FirstLevel
                    })
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

        class SomeModel extends Model<SomeModel> {
            structure() {
                return {
                    obj: Types.Object({
                        element: Types.Any,
                        nullAsEmpty: true,
                        emptyAsNull: true
                    })
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

    it("circular structure to json", () => {
        
        class MyModel extends Model<MyModel> {
            structure() {
                return {
                    obj: Types.Object({
                        element: Types.Object({
                            element: Types.Object
                        })
                    })
                };
            }
        }

        const obj: any = {};
        obj.obj = obj;

        const model = new MyModel({
            obj
        });

        assert.throws(
            () => {
                model.toJSON();
            },
            (err) =>
                err.message === "Cannot converting circular structure to JSON"
        );
    });

    it("circular structure to json (object of models)", () => {
        
        class MyModel extends Model<MyModel> {
            structure() {
                return {
                    obj: Types.Object({
                        element: MyModel
                    })
                };
            }
        }

        const model = new MyModel();
        model.set({
            obj: {
                model
            }
        });

        assert.throws(
            () => {
                model.toJSON();
            },
            (err) =>
                err.message === "Cannot converting circular structure to JSON"
        );
    });

    it("same model as value in two fields", () => {
        
        class MyModel extends Model<MyModel> {
            structure() {
                return {
                    obj: Types.Object({
                        element: MyModel
                    })
                };
            }
        }

        const child = new MyModel();
        const model = new MyModel({
            obj: {
                a: child,
                b: child
            }
        });

        assert.deepStrictEqual(model.toJSON(), {
            obj: {
                a: {obj: null},
                b: {obj: null}
            }
        });
    });

});

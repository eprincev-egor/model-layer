"use strict";

const {Model} = require("../../lib/index");
const assert = require("assert");

describe("ObjectType", () => {
    
    it("object", () => {
        class SomeModel extends Model {
            static structure() {
                return {
                    map: "object"
                };
            }
        }

        assert.throws(
            () => {
                new SomeModel({
                    map: false
                });
            }, 
            err => 
                err.message ==  "invalid object for map: false"
        );
        

        assert.throws(
            () => {
                new SomeModel({
                    map: true
                });
            }, 
            err => 
                err.message ==  "invalid object for map: true"
        );
        

        assert.throws(
            () => {
                new SomeModel({
                    map: "1,2"
                });
            }, 
            err => 
                err.message ==  "invalid object for map: \"1,2\""
        );
        

        assert.throws(
            () => {
                new SomeModel({
                    map: NaN
                });
            }, 
            err => 
                err.message ==  "invalid object for map: NaN"
        );
        

        assert.throws(
            () => {
                new SomeModel({
                    map: /x/
                });
            }, 
            err => 
                err.message ==  "invalid object for map: /x/"
        );
        
        assert.throws(
            () => {
                new SomeModel({
                    map: []
                });
            }, 
            err => 
                err.message ==  "invalid object for map: []"
        );
        

        assert.throws(
            () => {
                new SomeModel({
                    map: Infinity
                });
            }, 
            err => 
                err.message ==  "invalid object for map: Infinity"
        );
        

        assert.throws(
            () => {
                new SomeModel({
                    map: -Infinity
                });
            }, 
            err =>
                err.message == "invalid object for map: -Infinity"
        );
        

        assert.throws(
            () => {
                new SomeModel({
                    map: 0
                });
            }, 
            err => 
                err.message ==  "invalid object for map: 0"
        );
        


        assert.throws(
            () => {
                new SomeModel({
                    map: [false]
                });
            }, 
            err => 
                err.message == "invalid object for map: [false]"
        );
        


        let outsideObj = {
            a: "1",
            b: "2"
        };
        let model = new SomeModel({
            map: outsideObj
        });

        let map = model.get("map");

        assert.deepEqual( map, outsideObj );

        assert.ok( outsideObj != map );


        // array should be frozen
        assert.throws(
            () => {
                map.a = 10;
            },
            err =>
                /Cannot assign to read only property/.test(err.message)
        );
        

        assert.deepEqual( map, outsideObj );
    });

    
    
    it("emptyAsNull", () => {
        class SomeModel extends Model {
            static structure() {
                return {
                    words: {
                        type: "object",
                        emptyAsNull: true
                    }
                };
            }
        }

        let model = new SomeModel();
        assert.strictEqual( model.data.words, null );

        model.set("words", {red: true});
        assert.deepEqual( model.data.words, {red: true} );

        model.set("words", {});
        assert.strictEqual( model.data.words, null );
    });

    it("nullAsEmpty", () => {
        class SomeModel extends Model {
            static structure() {
                return {
                    words: {
                        type: "object",
                        nullAsEmpty: true
                    }
                };
            }
        }

        let model = new SomeModel();
        assert.deepEqual( model.data.words, [] );

        model.set("words", {water: true});
        assert.deepEqual( model.data.words, {water: true} );

        model.set("words", null);
        assert.deepEqual( model.data.words, {} );
    });

    it("recursive clone object", () => {
        class SomeModel extends Model {
            static structure() {
                return {
                    tree: "object"
                };
            }
        }

        let model = new SomeModel({
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

        let clone = model.clone();

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
            clone.data.tree != model.data.tree
        );

        assert.ok(
            clone.data.tree.tree != model.data.tree.tree
        );

        assert.ok(
            clone.data.tree.tree.arr != model.data.tree.tree.arr
        );

        assert.ok(
            clone.data.tree.tree.arr[0] != model.data.tree.tree.arr[0]
        );
    });
    
    it("model.toJSON with object property", () => {
        class SomeModel extends Model {
            static structure() {
                return {
                    names: "object"
                };
            }
        }

        let model = new SomeModel({
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
        class SomeModel extends Model {
            static structure() {
                return {
                    tree: "object"
                };
            }
        }

        let model = new SomeModel({
            tree: {
                name: "test",
                tree: {
                    name: "nice",
                    arr: [{ x: 1 }]
                }
            }
        });

        let json = model.toJSON();

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
            json.tree != model.data.tree
        );

        assert.ok(
            json.tree.tree != model.data.tree.tree
        );

        assert.ok(
            json.tree.tree.arr != model.data.tree.tree.arr
        );

        assert.ok(
            json.tree.tree.arr[0] != model.data.tree.tree.arr[0]
        );
    });

    it("prepare object value", () => {
        class SomeModel extends Model {
            static structure() {
                return {
                    object: {
                        type: "object",
                        element: "number"
                    }
                };
            }
        }

        let model = new SomeModel({
            object: {
                a: "10",
                b: "20"
            }
        });
        assert.strictEqual( model.data.object.a, 10 );
        assert.strictEqual( model.data.object.b, 20 );
    });

    it("object of any values", () => {
        class SomeModel extends Model {
            static structure() {
                return {
                    object: {}
                };
            }
        }

        let model = new SomeModel({
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
        class SomeModel extends Model {
            static structure() {
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
                new SomeModel({
                    object: {
                        a: 10,
                        b: "nice"
                    }
                });
            }, 
            err => 
                err.message == "invalid object[number] for object: {\"a\":10,\"b\":\"nice\"},\n invalid number for b: \"nice\""
        );
    });

});
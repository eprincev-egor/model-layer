
import {Model, Types} from "../../lib/index";
import assert from "assert";
import {invalidValuesAsString} from "../../lib/utils";

describe("OrType", () => {
    
    it("constructor with string or number", () => {

        class SomeModel extends Model<SomeModel> {
            structure() {
                return {
                    id: Types.Or({
                        or: [Types.Number, Types.String]
                    })
                };
            }
        }

        const model1 = new SomeModel({
            id: 1
        });

        const model2 = new SomeModel({
            id: "b"
        });

        assert.strictEqual(model1.row.id, 1);
        assert.strictEqual(model2.row.id, "b");
        
    });

    it("set string or number", () => {

        class SomeModel extends Model<SomeModel> {
            structure() {
                return {
                    id: Types.Or({
                        or: [Types.Number, Types.String]
                    })
                };
            }
        }

        const model1 = new SomeModel();
        const model2 = new SomeModel();

        assert.strictEqual(model1.row.id, null);
        assert.strictEqual(model2.row.id, null);

        model1.set({
            id: 1
        });
        model2.set({
            id: "b"
        });

        assert.strictEqual(model1.row.id, 1);
        assert.strictEqual(model2.row.id, "b");
        
    });

    it("id is a number or string, but we set object", () => {

        class SomeModel extends Model<SomeModel> {
            structure() {
                return {
                    id: Types.Or({
                        or: [Types.Number, Types.String]
                    })
                };
            }
        }

        assert.throws(
            () => {
                const model = new SomeModel({
                    id: {} as any
                });
            },
            (err: Error) =>
                err.message === "invalid value for types: number or string, for id: {}"
        );
        
    });

    it("expected 'or' array of type descriptions", () => {
        assert.throws(
            () => {
                class WrongModel extends Model<WrongModel> {
                    structure() {
                        return {
                            id: Types.Or({
                                
                            } as any)
                        };
                    }
                }

                const model = new WrongModel();
            },
            (err: Error) =>
                err.message === "id: required 'or' array of type descriptions"
        );
    });

    it("invalid type description", () => {
        assert.throws(
            () => {
                class WrongModel extends Model<WrongModel> {
                    structure() {
                        return {
                            id: Types.Or({
                                or: [{wrong: true}]
                            } as any)
                        };
                    }
                }

                const model = new WrongModel();
            },
            (err: Error) =>
                err.message === "id: invalid type description or[0]: {\"wrong\":true}"
        );
    });

    it("empty array of type description", () => {
        assert.throws(
            () => {
                class WrongModel extends Model<WrongModel> {
                    structure() {
                        return {
                            id: Types.Or({
                                or: []
                            } as any)
                        };
                    }
                }

                const model = new WrongModel();
            },
            (err: Error) =>
                err.message === "id: empty 'or' array of type descriptions"
        );
    });

    it("prior type", () => {
        class StringFirst extends Model<StringFirst> {
            structure() {
                return {
                    value: Types.Or({
                        or: [Types.String, Types.Number]
                    })
                };
            }
        }

        class NumberFirst extends Model<NumberFirst> {
            structure() {
                return {
                    value: Types.Or({
                        or: [Types.Number, Types.String]
                    })
                };
            }
        }

        const stringModel = new StringFirst({
            value: "1"
        });
        const numberModel = new NumberFirst({
            value: "1"
        });

        assert.strictEqual(stringModel.row.value, "1");
        assert.strictEqual(numberModel.row.value, 1);
    });

    it("model to json", () => {
        class User extends Model<User> {
            structure() {
                return {
                    id: Types.Number,
                    name: Types.String
                };
            }
        }

        class MyModel extends Model<MyModel> {
            structure() {
                return {
                    user: Types.Or({
                        or: [Types.Number, User]
                    })
                };
            }
        }

        const model = new MyModel({
            user: {
                id: 1,
                name: "Bob"
            }
        });

        assert.ok(model.row.user instanceof User);

        assert.deepStrictEqual(model.toJSON(), {
            user: {
                id: 1,
                name: "Bob"
            }
        });



        model.set({
            user: 2
        });

        assert.strictEqual(model.row.user, 2);
        assert.deepStrictEqual(model.toJSON(), {
            user: 2
        });
    });

    it("array to json", () => {
        class MyModel extends Model<MyModel> {
            structure() {
                return {
                    value: Types.Or({
                        or: [Types.Number, Types.Array({
                            element: Types.Number
                        })]
                    })
                };
            }
        }

        const model = new MyModel({
            value: [1, 2]
        });

        assert.deepStrictEqual(model.row.value, [1, 2]);

        const json = model.toJSON();
        assert.deepStrictEqual(json, {
            value: [1, 2]
        });
        assert.ok(json.value !== model.row.value);



        model.set({
            value: 3
        });

        assert.strictEqual(model.row.value, 3);
        assert.deepStrictEqual(model.toJSON(), {
            value: 3
        });
    });

    it("date to json", () => {
        
        const date = new Date();
        const isoDate = date.toISOString();

        class MyModel extends Model<MyModel> {
            structure() {
                return {
                    value: Types.Or({
                        or: [Types.Number, Types.Date]
                    })
                };
            }
        }

        const model = new MyModel({
            value: date
        });

        assert.ok(model.row.value instanceof Date);
        assert.strictEqual(+model.row.value, +date);

        
        assert.deepStrictEqual(model.toJSON(), {
            value: isoDate
        });



        model.set({
            value: 1
        });

        assert.strictEqual(model.row.value, 1);
        assert.deepStrictEqual(model.toJSON(), {
            value: 1
        });
    });

    it("object to json", () => {
        class MyModel extends Model<MyModel> {
            structure() {
                return {
                    value: Types.Or({
                        or: [Types.Number, Types.Object({
                            element: Types.Number
                        })]
                    })
                };
            }
        }

        const model = new MyModel({
            value: {a: 1, b: 2}
        });

        assert.deepStrictEqual(model.row.value, {a: 1, b: 2});

        const json = model.toJSON();
        assert.deepStrictEqual(json, {
            value: {a: 1, b: 2}
        });
        assert.ok(json.value !== model.row.value);



        model.set({
            value: 3
        });

        assert.strictEqual(model.row.value, 3);
        assert.deepStrictEqual(model.toJSON(), {
            value: 3
        });
    });

    it("recursive to json", () => {

        const date = new Date();
        const isoDate = date.toISOString();

        class User extends Model<User> {
            structure() {
                return {
                    name: Types.String,
                    bornDate: Types.Date
                };
            }
        }

        class MyModel extends Model<MyModel> {
            structure() {
                return {
                    value: Types.Or({
                        or: [Types.Number, Types.Array({
                            element: Types.Object({
                                element: User
                            })
                        })]
                    })
                };
            }
        }

        const model = new MyModel({
            value: [{
                user: {
                    name: "Bob",
                    bornDate: date
                }
            }]
        });

        const json = model.toJSON();
        assert.deepStrictEqual(json, {
            value: [{
                user: {
                    name: "Bob",
                    bornDate: isoDate
                }
            }]
        });
        assert.ok(json.value !== model.row.value);
        assert.ok(json.value[0] !== model.row.value[0]);
    });

    it("circular structure to json, or: [Model]", () => {

        class MyModel extends Model<MyModel> {
            structure() {
                return {
                    model: Types.Or({
                        or: [MyModel]
                    })
                };
            }
        }

        const model = new MyModel({
            model: {}
        });
        model.set({model});

        assert.throws(
            () => {
                model.toJSON();
            },
            (err: Error) =>
                err.message === "Cannot converting circular structure to JSON"
        );
    });

    it("circular structure to json, or: [Array]", () => {

        class MyModel extends Model<MyModel> {
            structure() {
                return {
                    value: Types.Or({
                        or: [
                            Types.Array,
                            Types.Object
                        ]
                    })
                };
            }
        }

        const model = new MyModel();

        // self model inside array
        model.set({
            value: [
                model
            ]
        });

        assert.throws(
            () => {
                model.toJSON();
            },
            (err: Error) =>
                err.message === "Cannot converting circular structure to JSON"
        );

        // circular array
        const arr = [];
        arr[0] = arr;
        model.set({
            value: arr
        });

        assert.throws(
            () => {
                model.toJSON();
            },
            (err: Error) =>
                err.message === "Cannot converting circular structure to JSON"
        );
    });

    it("circular structure to json, or: [Object]", () => {

        class MyModel extends Model<MyModel> {
            structure() {
                return {
                    value: Types.Or({
                        or: [
                            Types.Array,
                            Types.Object
                        ]
                    })
                };
            }
        }

        const model = new MyModel();

        // self model inside array
        model.set({
            value: {model}
        });

        assert.throws(
            () => {
                model.toJSON();
            },
            (err: Error) =>
                err.message === "Cannot converting circular structure to JSON"
        );

        // circular object
        const obj: any = {};
        obj.obj = obj;

        model.set({
            value: obj
        });

        assert.throws(
            () => {
                model.toJSON();
            },
            (err: Error) =>
                err.message === "Cannot converting circular structure to JSON"
        );
        
        // but we can convert primitives to json 
        model.set({
            value: [{
                x: "",
                a: 1,
                b: true,
                c: {
                    x: "",
                    a: 1,
                    b: true,
                    c: {
                        x: "",
                        a: 1,
                        b: true
                    }
                }
            }]
        });
        assert.deepStrictEqual(model.toJSON(), {
            value: [{
                x: "",
                a: 1,
                b: true,
                c: {
                    x: "",
                    a: 1,
                    b: true,
                    c: {
                        x: "",
                        a: 1,
                        b: true
                    }
                }
            }]
        });
    });

    it("equal any values", () => {

        const now1 = new Date();
        const now2 = new Date( +now1 );
        const date2000 = new Date(2000);

        class CustomClass {}
        const obj1 = new CustomClass();
        const obj2 = new CustomClass();

        class SomeModel extends Model<SomeModel> {
            structure() {
                return {
                    "*": Types.Any
                };
            }
        }
        const emptyModel1 = new SomeModel();
        const emptyModel2 = new SomeModel();
        const sameModel1 = new SomeModel({
            x: {a: 1}
        });
        const sameModel2 = new SomeModel({
            x: {a: 1}
        });

        // circular object
        const circularObj1: any = {};
        circularObj1.self = circularObj1;

        const circularObj2: any = {};
        circularObj2.self = circularObj2;

        const circularObj3: any = {x: 1};
        circularObj3.self = circularObj3;

        const circularObj4: any = {};
        circularObj4.self = circularObj2;

        // circular arr
        const circularArr1 = [];
        circularArr1[0] = circularArr1;

        const circularArr2 = [];
        circularArr2[0] = circularArr2;

        const circularArr3 = [];
        circularArr3[0] = circularArr3;
        circularArr3[1] = 0;

        // circular model
        const circularModel1 = new SomeModel();
        circularModel1.set({self: circularModel1});

        const circularModel2 = new SomeModel();
        circularModel2.set({self: circularModel2});

        const circularModel3 = new SomeModel({x: 1});
        circularModel3.set({self: circularModel3});


        const pairs = [
            [null, null, true],
            [undefined, undefined, true],

            [null, false, false],
            [false, false, true],

            [false, 0, false],
            [0, 0, true],

            [null, "", false],
            ["", "", true],
            ["x", "x", true],

            ["1", 1, false],
            ["0", 0, false],

            [null, Infinity, false],
            [Infinity, Infinity, true],
            [-Infinity, +Infinity, false],

            [null, NaN, false],
            [NaN, NaN, true],

            [null, [], false],
            [0, [], false],
            [0, [0], false],
            [[], [], true],
            [[2], [2], true],
            [[1], [2], false],
            [[1, 2], [2], false],
            [[[]], [[]], true],
            [[[1]], [[1]], true],
            [[[1]], [[2]], false],

            [null, /xx/, false],
            [/xx/, /xx/, true],
            [/xx/g, /xx/i, false],
            [/xx/, /xxx/, false],

            [null, now1, false],
            [now1, now1, true],
            [now1, now2, true],
            [now1, date2000, false],

            [null, {}, false],
            [{}, {}, true],
            [{}, {x: 1}, false],
            [{x: 1}, {x: 1}, true],
            [{x: 1}, {x: 1, y: 2}, false],
            [{x: {a: 1}}, {x: {a: 1}}, true],

            [
                [{x: {a: 1}}, 1], 
                [{x: {a: 1}}, 1], 
                true
            ],
            [
                [{x: {a: 1}}, 1], 
                [{x: {a: 1}}, true], 
                false
            ],
            
            [null, obj1, false],
            [obj1, obj1, true],
            [obj1, obj2, false],

            [null, emptyModel1, false],
            [emptyModel1, emptyModel1, true],
            [emptyModel1, emptyModel2, true],
            [emptyModel1, sameModel1, false],
            [sameModel1, sameModel1, true],
            [sameModel1, sameModel2, true],

            [circularObj1, circularObj1, true],
            [circularObj1, circularObj2, true],
            [circularObj2, circularObj2, true],
            [circularObj1, circularObj3, false],
            [circularObj2, circularObj3, false],
            
            // [circularObj2, circularObj4, false],

            [circularArr1, circularArr1, true],
            [circularArr1, circularArr2, true],
            [circularArr2, circularArr2, true],
            [circularArr1, circularArr3, false],
            [circularArr2, circularArr3, false],

            [circularModel1, circularModel1, true],
            [circularModel1, circularModel2, true],
            [circularModel2, circularModel2, true],
            [circularModel1, circularModel3, false],
            [circularModel2, circularModel3, false],

            [-0, +0, true]
        ];

        pairs.forEach((pair, i) => {
            class TestModel extends Model<TestModel> {
                structure() {
                    return {
                        value: Types.Or({
                            or: [
                                // for Infinity, NaN, regExp, ...
                                Types.Any,
                                SomeModel
                            ]
                        })
                    };
                }
            }

            const model1 = new TestModel({
                value: pair[0]
            });

            const model2 = new TestModel({
                value: pair[1]
            });

            assert.strictEqual(
                model1.equal( model2 ),
                pair[2],
                i + ": " + invalidValuesAsString(pair)
            );

            assert.strictEqual(
                model2.equal( model1 ),
                pair[2],
                i + ": " + invalidValuesAsString(pair)
            );
        });
    });

    it("model.clone()", () => {
        class User extends Model<User> {
            structure() {
                return {
                    id: Types.Number,
                    name: Types.String
                };
            }
        }

        class MyModel extends Model<MyModel> {
            structure() {
                return {
                    user: Types.Or({
                        or: [Types.Number, User]
                    })
                };
            }
        }

        const model = new MyModel({
            user: {
                id: 1,
                name: "Bob"
            }
        });

        assert.ok(model.row.user instanceof User);

        const clone = model.clone();

        assert.deepStrictEqual(clone.toJSON(), {
            user: {
                id: 1,
                name: "Bob"
            }
        });



        model.set({
            user: 2
        });

        assert.strictEqual(model.row.user, 2);
        assert.deepStrictEqual(clone.toJSON(), {
            user: {
                id: 1,
                name: "Bob"
            }
        });
    });

});

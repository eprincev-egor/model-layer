
import {Model, Types} from "../../lib/index";
import assert from "assert";

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

        assert.strictEqual(model1.data.id, 1);
        assert.strictEqual(model2.data.id, "b");
        
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

        assert.strictEqual(model1.data.id, null);
        assert.strictEqual(model2.data.id, null);

        model1.set({
            id: 1
        });
        model2.set({
            id: "b"
        });

        assert.strictEqual(model1.data.id, 1);
        assert.strictEqual(model2.data.id, "b");
        
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
            (err) =>
                err.message === "invalid number or string for id: {}"
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
            (err) =>
                err.message === "id: expected 'or' array of type descriptions"
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
            (err) =>
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
            (err) =>
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

        assert.strictEqual(stringModel.data.value, "1");
        assert.strictEqual(numberModel.data.value, 1);
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

        assert.ok(model.data.user instanceof User);

        assert.deepStrictEqual(model.toJSON(), {
            user: {
                id: 1,
                name: "Bob"
            }
        });



        model.set({
            user: 2
        });

        assert.strictEqual(model.data.user, 2);
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

        assert.deepStrictEqual(model.data.value, [1, 2]);

        const json = model.toJSON();
        assert.deepStrictEqual(json, {
            value: [1, 2]
        });
        assert.ok(json.value !== model.data.value);



        model.set({
            value: 3
        });

        assert.strictEqual(model.data.value, 3);
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

        assert.ok(model.data.value instanceof Date);
        assert.strictEqual(+model.data.value, +date);

        
        assert.deepStrictEqual(model.toJSON(), {
            value: isoDate
        });



        model.set({
            value: 1
        });

        assert.strictEqual(model.data.value, 1);
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

        assert.deepStrictEqual(model.data.value, {a: 1, b: 2});

        const json = model.toJSON();
        assert.deepStrictEqual(json, {
            value: {a: 1, b: 2}
        });
        assert.ok(json.value !== model.data.value);



        model.set({
            value: 3
        });

        assert.strictEqual(model.data.value, 3);
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
        assert.ok(json.value !== model.data.value);
        assert.ok(json.value[0] !== model.data.value[0]);
    });

});

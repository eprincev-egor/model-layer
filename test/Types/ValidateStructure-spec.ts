
import {Model} from "../../lib/index";
import assert from "assert";

describe("validate and prepare model data", () => {
    
    it("model without data", () => {
        
        class SomeModel extends Model<object> {}

        assert.throws(
            () => {
                const model = new SomeModel();
            },
            (err) =>
                err.message === "static SomeModel.data() is not declared"
        );

    });

    it("unknown type", () => {
        class InvalidModel extends Model<object> {
            public static data() {
                return {
                    prop: "wrong"
                };
            }
        }

        assert.throws(
            () => {
                const someModel = new InvalidModel();
            },
            (err) =>
                err.message === "prop: unknown type: wrong"
        );

        class CustomClass {}
        class SomeModel extends Model<object> {}

        class ValidModel extends Model<object> {
            public static data() {
                return {
                    any: "*",

                    string: "string",
                    number: "number",
                    date: "date",
                    array: "array",
                    object: "object",
                    boolean: "boolean",
                    class: CustomClass,
                    model: SomeModel,

                    arrayOfString: ["string"],
                    arrayOfNumber: ["number"],
                    arrayOfArray: ["array"],
                    arrayOfObject: ["object"],
                    arrayOfBoolean: ["boolean"],
                    arrayOfClass: [CustomClass],
                    arrayOfModel: [SomeModel],
                    arrayOfAny: ["*"]
                };
            }
        }

        // create valid model without errors
        const model = new ValidModel();
    });

    it("once call static data method", () => {

        interface ISomeData {
            name: string;
            age: number | string;
        }
        
        let count = 0;
        class SomeModel extends Model<ISomeData> {
            public static data() {
                count++;

                return {
                    name: "string",
                    age: "number"
                };
            }
        }

        const model = new SomeModel({
            age: 10
        });

        assert.deepEqual(model.data, {
            name: null,
            age: 10
        });

        assert.strictEqual( count, 1 );


        model.set({
            name: "Bob"
        });

        assert.deepEqual(model.data, {
            name: "Bob",
            age: 10
        });

        assert.strictEqual( count, 1 );


        // calling data only in first constructor call
        // (save data to prototype)

        const model2 = new SomeModel({
            age: "20"
        });

        assert.deepEqual(model2.data, {
            name: null,
            age: 20
        });

        assert.strictEqual( count, 1 );
    });

    it("data is freeze object", () => {
        
        interface IObj {
            [key: string]: number;
        }

        interface ISomeData {
            arr: number[];
            obj: IObj;
        }

        class SomeModel extends Model<ISomeData> {
            public static data() {
                return {
                    arr: ["number"],
                    obj: {element: "number"}
                };
            }
        }

        const model = new SomeModel();

        assert.throws(
            () => {
                const anyModel = model as any;
                anyModel.data.arr = 10;
            },
            (err) =>
                /Cannot assign to read only property/.test(err.message)
        );

        assert.throws(
            () => {
                const anyModel = model as any;
                anyModel.data.arr.element.type = 10;
            },
            (err) =>
                /Cannot assign to read only property/.test(err.message)
        );

        assert.throws(
            () => {
                const anyModel = model as any;
                anyModel.data.obj.element.type = 10;
            },
            (err) =>
                /Cannot assign to read only property/.test(err.message)
        );
    });

    it("prepare data, and save to model.data", () => {
        interface IAny {
            [key: string]: any;
        }

        class TestModel extends Model<object> {}

        class SomeModel extends Model<IAny> {
            public static data() {
                return {
                    name: "string",
                    text: "text",
                    user: TestModel,
                    arrayOfModels: [TestModel],
                    arrayOfNumbers: ["number"],
                    arrayOfAny: [],
                    arrayOfDates: {
                        type: ["date"]
                    },
                    arrayOfObjects: [{}],
                    obj1: "object",
                    obj2: {},
                    obj3: {element: "number"},
                    obj4: {type: {element: "string"}}
                };
            }
        }

        const model = new SomeModel();

        assert.deepEqual(
            model.data,
            {
                name: {
                    type: "string",
                    required: false,
                    emptyAsNull: false,
                    nullAsEmpty: false,
                    trim: false,
                    upper: false,
                    lower: false
                },
                text: {
                    type: "string",
                    required: false,
                    emptyAsNull: false,
                    nullAsEmpty: false,
                    trim: false,
                    upper: false,
                    lower: false
                },
                user: {
                    type: "model",
                    Models: [TestModel],
                    getConstructorByData: model.getDescription("user").getConstructorByData,
                    required: false
                },
                arrayOfModels: {
                    type: "array",
                    sort: false, 
                    emptyAsNull: false, 
                    nullAsEmpty: false,
                    required: false,
                    unique: false,
                    element: {
                        type: "model",
                        Models: [TestModel],
                        required: false,
                        getConstructorByData: (
                            model.getDescription("arrayOfModels")
                                .element
                                .getConstructorByData
                        )
                    }
                },
                arrayOfNumbers: {
                    type: "array",
                    sort: false, 
                    emptyAsNull: false, 
                    nullAsEmpty: false,
                    required: false,
                    unique: false,
                    element: {
                        type: "number",
                        required: false,
                        ceil: null,
                        round: null,
                        floor: null,
                        nullAsZero: false,
                        zeroAsNull: false
                    }
                },
                arrayOfAny: {
                    type: "array",
                    sort: false, 
                    emptyAsNull: false, 
                    nullAsEmpty: false,
                    required: false,
                    unique: false,
                    element: {
                        type: "*",
                        required: false
                    }
                },
                arrayOfDates: {
                    type: "array",
                    sort: false, 
                    emptyAsNull: false, 
                    nullAsEmpty: false,
                    required: false,
                    unique: false,
                    element: {
                        type: "date",
                        required: false
                    }
                },
                arrayOfObjects: {
                    type: "array",
                    sort: false, 
                    emptyAsNull: false, 
                    nullAsEmpty: false,
                    required: false,
                    unique: false,
                    element: {
                        type: "object",
                        required: false,
                        nullAsEmpty: false,
                        emptyAsNull: false,
                        element: {
                            type: "*",
                            required: false
                        }
                    }
                },
                obj1: {
                    type: "object",
                    required: false,
                    nullAsEmpty: false,
                    emptyAsNull: false,
                    element: {
                        type: "*",
                        required: false
                    }
                },
                obj2: {
                    type: "object",
                    required: false,
                    nullAsEmpty: false,
                    emptyAsNull: false,
                    element: {
                        type: "*",
                        required: false
                    }
                },
                obj3: {
                    type: "object",
                    required: false,
                    nullAsEmpty: false,
                    emptyAsNull: false,
                    element: {
                        type: "number",
                        required: false,
                        ceil: null,
                        round: null,
                        floor: null,
                        nullAsZero: false,
                        zeroAsNull: false
                    }
                },
                obj4: {
                    type: "object",
                    required: false,
                    nullAsEmpty: false,
                    emptyAsNull: false,
                    element: {
                        type: "string",
                        required: false,
                        emptyAsNull: false,
                        nullAsEmpty: false,
                        trim: false,
                        upper: false,
                        lower: false
                    }
                }
            }
        );
    });

    it("invalid validate", () => {
        interface ISomeData {
            prop: number;
        }

        class SomeModel extends Model<ISomeData> {
            public static data() {
                return {
                    prop: {
                        type: "number",
                        validate: "wrong"
                    }
                };
            }
        }

        assert.throws(
            () => {
                const model = new SomeModel();
            },
            (err) =>
                err.message === "prop: validate should be function or RegExp: \"wrong\""
        );

    });

    it("invalid validate key", () => {
        
        class SomeModel extends Model<object> {
            public static data() {
                return {
                    "*": {
                        type: "number",
                        key: "wrong"
                    }
                };
            }
        }

        assert.throws(
            () => {
                const model = new SomeModel();
            },
            (err) =>
                err.message === "*: validate key should be function or RegExp: \"wrong\""
        );

    });

});

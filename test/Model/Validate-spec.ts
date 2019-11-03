
import {Model} from "../../lib/index";
import assert from "assert";
import { ISimpleObject } from "../../lib/Model";

describe("Model validate", () => {
    
    it("required field", () => {
        interface ISomeData {
            name: string;
            age: number;
        }

        class SomeModel extends Model<ISomeData> {
            public static data() {
                return {
                    name: {
                        type: "string",
                        required: true
                    },
                    age: "number"
                };
            }
        }

        assert.throws(
            () => {
                const someModel = new SomeModel();
            },
            (err) =>
                err.message === "required name"
        );


        const model = new SomeModel({
            name: "Andrew"
        });
        assert.equal( model.get("name"), "Andrew" );
        assert.equal( model.data.name, "Andrew" );

        model.set({age: 40});
        assert.strictEqual( model.get("age"), 40 );
        assert.strictEqual( model.data.age, 40 );

        assert.throws(
            () => {
                model.set({name: null});
            },
            (err) =>
                err.message === "required name"
        );


        assert.equal( model.get("name"), "Andrew" );
        assert.equal( model.data.name, "Andrew" );
        assert.strictEqual( model.get("age"), 40 );
        assert.strictEqual( model.data.age, 40 );
    });

    it("validate method", () => {
        interface ISomeData {
            age: number;
        }

        class AgeModel extends Model<ISomeData> {
            public static data() {
                return {
                    age: {
                        type: "number",
                        default: 0
                    }
                };
            }

            public validate(data) {
                if ( data.age < 0 ) {
                    throw new Error("invalid age");
                }
            }
        }

        // validate in constructor
        assert.throws(
            () => {
                const ageModel = new AgeModel({
                    age: -1
                });
            },
            (err) =>
                err.message === "invalid age"
        );


        const model = new AgeModel({
            age: 100
        });

        // validate in set
        assert.throws(
            () => {
                model.set({
                    age: -100
                });
            },
            (err) =>
                err.message === "invalid age"
        );

        // error in validate, returns previous state
        assert.equal( model.data.age, 100 );
    });

    it("cannot change state in validate method", () => {
        interface ISomeData {
            age: number;
        }

        class AgeModel extends Model<ISomeData> {
            public static data() {
                return {
                    age: {
                        type: "number",
                        default: 0
                    }
                };
            }

            public validate(data) {
                data.age = 200;
            }
        }

        assert.throws(
            () => {
                const ageModel = new AgeModel({ age: 1 });
            },
            (err) =>
                /Cannot assign to read only property/.test(err.message)
        );
    });

    it("this.data in validate is previous state", () => {
        interface ISomeData {
            age: number;
        }

        class AgeModel extends Model<ISomeData> {
            public static data() {
                return {
                    age: {
                        type: "number",
                        default: 100
                    }
                };
            }

            public validate(data) {
                assert.equal( this.data.age, 100 );
                assert.equal( data.age, 200 );
            }
        }
        
        const ageModel = new AgeModel({
            age: 200
        });
    });

    it("validate field", () => {
        interface ISomeData {
            age: number;
        }

        class AgeModel extends Model<ISomeData> {
            public static data() {
                return {
                    age: {
                        type: "number",
                        default: 0,
                        validate: (age) =>
                            age >= 0
                    }
                };
            }
        }

        // validate in constructor
        assert.throws(
            () => {
                const ageModel = new AgeModel({
                    age: -1
                });
            },
            (err) =>
                err.message === "invalid age: -1"
        );


        const model = new AgeModel({
            age: 100
        });

        // validate in set
        assert.throws(
            () => {
                model.set({
                    age: -100
                });
            },
            (err) =>
                err.message === "invalid age: -100"
        );

        // error in validate, returns previous state
        assert.equal( model.data.age, 100 );
    });

    it("do not validate null value", () => {
        interface ISomeData {
            prop: string;
        }

        class SomeModel extends Model<ISomeData> {
            public static data() {
                return {
                    prop: {
                        type: "string",
                        validate: (value) => 
                            value === "nice"
                    }
                };
            }
        }

        let model;

        // safety create empty model
        const someModel = new SomeModel();

        // safety set null
        model = new SomeModel({
            prop: "nice"
        });

        assert.strictEqual(model.data.prop, "nice");


        model.set({prop: null});
        assert.strictEqual(model.data.prop, null);
    });


    it("validate field by RegExp", () => {
        interface ISomeData {
            word: string;
        }

        class WordModel extends Model<ISomeData> {
            public static data() {
                return {
                    word: {
                        type: "string",
                        validate: /^\w+$/
                    }
                };
            }
        }

        // validate in constructor
        assert.throws(
            () => {
                const wordModel = new WordModel({
                    word: " some 12123 "
                });
            },
            (err) =>
                err.message === "invalid word: \" some 12123 \""
        );


        const model = new WordModel({
            word: "test"
        });

        // validate in set
        assert.throws(
            () => {
                model.set({
                    word: "some wrong"
                });
            },
            (err) =>
                err.message === "invalid word: \"some wrong\""
        );

        // error in validate, returns previous state
        assert.equal( model.data.word, "test" );
    });

    it("enum validate", () => {
        interface ISomeData {
            color: string;
        }

        class EnumModel extends Model<ISomeData> {
            public static data() {
                return {
                    color: {
                        type: "string",
                        enum: ["red", "green", "blue"]
                    }
                };
            }
        }

        const model = new EnumModel();
        assert.strictEqual( model.data.color, null );

        // validate in set
        assert.throws(
            () => {
                model.set({
                    color: "orange"
                });
            },
            (err) =>
                err.message === "invalid color: \"orange\""
        );

        // error in validate, returns previous state
        assert.strictEqual( model.data.color, null );


        // validate in constructor
        assert.throws(
            () => {
                const enumModel = new EnumModel({
                    color: "dark blue"
                });
            },
            (err) =>
                err.message === "invalid color: \"dark blue\""
        );


        model.set({color: "red"});
        assert.equal(model.get("color"), "red");

        // null is valid value for enum validation
        model.set({color: null});
        assert.equal(model.get("color"), null);
    });

    it("isValid(data)", () => {
        interface ISomeData {
            sale: number;
            buy: number;
            color: string;
            word: string;
            age: number;
            prop: string;
        }

        class SomeModel extends Model<ISomeData> {
            public static data() {
                return {
                    sale: {
                        type: "number",
                        required: true
                    },
                    buy: {
                        type: "number",
                        required: true
                    },
                    color: {
                        type: "string",
                        enum: ["red", "green", "blue"]
                    },
                    word: {
                        type: "string",
                        validate: /^\w+$/
                    },
                    age: {
                        type: "number",
                        validate: (age) => 
                            age > 0
                    },
                    prop: "string"
                };
            }

            public validate(data) {
                if ( data.buy > data.sale ) {
                    throw new Error("invalid sale");
                }
            }
        }

        const model = new SomeModel({
            buy: 10,
            sale: 30
        });

        // valid
        assert.strictEqual(model.isValid({
            buy: 100,
            sale: 200
        }), true);

        // ignore required error, because isValid we using before .set
        assert.strictEqual(model.isValid({}), true);
            
        // buy > sale
        assert.strictEqual(model.isValid({
            buy: 1000
        }), false);

        // enum validate
        assert.strictEqual(model.isValid({
            buy: 100,
            sale: 200,
            color: "pink"
        }), false);

        // regexp validate
        assert.strictEqual(model.isValid({
            buy: 1,
            sale: 10,
            word: "wrong word"
        }), false);

        // function validate for field
        assert.strictEqual(model.isValid({
            buy: 1,
            sale: 2,
            age: -1
        }), false);

        const anyModel = model as any;

        // unknown property
        assert.strictEqual(anyModel.isValid({
            buy: 1,
            sale: 101,
            xx: true
        }), false);

        // custom validate data
        assert.strictEqual(model.isValid({
            buy: 100,
            sale: 20
        }), false);

        assert.throws(
            () => {
                anyModel.isValid();
            },
            (err) =>
                err.message === "data must be are object"
        );
    });

    it("const prop", () => {
        interface ISomeData {
            name: string;
        }

        class SomeModel extends Model<ISomeData> {
            public static data() {
                return {
                    name: {
                        type: "string",
                        const: true
                    }
                };
            }
        }

        let model = new SomeModel();

        assert.strictEqual( model.data.name, null );

        assert.throws(
            () => {
                model.set({name: "new name"});
            },
            (err) =>
                err.message === "cannot assign to read only property: name"
        );


        model = new SomeModel({
            name: "Bob"
        });
        assert.equal( model.data.name, "Bob" );

        assert.throws(
            () => {
                model.set({name: "new name"});
            },
            (err) =>
                err.message === "cannot assign to read only property: name"
        );
    });

    
});

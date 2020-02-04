
import {Model, Types} from "../../lib/index";
import assert from "assert";

describe("Model validate", () => {
    
    it("required field", () => {

        class SomeModel extends Model<SomeModel> {
            structure() {
                return {
                    name: Types.String({
                        required: true
                    }),
                    age: Types.Number
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
        assert.equal( model.row.name, "Andrew" );

        model.set({age: 40});
        assert.strictEqual( model.get("age"), 40 );
        assert.strictEqual( model.row.age, 40 );

        assert.throws(
            () => {
                model.set({name: null});
            },
            (err) =>
                err.message === "required name"
        );


        assert.equal( model.get("name"), "Andrew" );
        assert.equal( model.row.name, "Andrew" );
        assert.strictEqual( model.get("age"), 40 );
        assert.strictEqual( model.row.age, 40 );
    });

    it("validate method", () => {

        class AgeModel extends Model<AgeModel> {
            structure() {
                return {
                    age: Types.Number({
                        default: 0
                    })
                };
            }

            validate(row) {
                if ( row.age < 0 ) {
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
        assert.equal( model.row.age, 100 );
    });

    it("cannot change state in validate method", () => {

        class AgeModel extends Model<AgeModel> {
            structure() {
                return {
                    age: Types.Number({
                        default: 0
                    })
                };
            }

            validate(row) {
                row.age = 200;
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

    it("this.row in validate is previous state", () => {

        class AgeModel extends Model<AgeModel> {
            structure() {
                return {
                    age: Types.Number({
                        default: 100
                    })
                };
            }

            validate(row) {
                assert.equal( this.row.age, 100 );
                assert.equal( row.age, 200 );
            }
        }
        
        const ageModel = new AgeModel({
            age: 200
        });
    });

    it("validate field", () => {

        class AgeModel extends Model<AgeModel> {
            structure() {
                return {
                    age: Types.Number({
                        default: 0,
                        validate: (age) =>
                            age >= 0
                    })
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
        assert.equal( model.row.age, 100 );
    });

    it("do not validate null value", () => {

        class SomeModel extends Model<SomeModel> {
            structure() {
                return {
                    prop: Types.String({
                        validate: (value) => 
                            value === "nice"
                    })
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

        assert.strictEqual(model.row.prop, "nice");


        model.set({prop: null});
        assert.strictEqual(model.row.prop, null);
    });


    it("validate field by RegExp", () => {

        class WordModel extends Model<WordModel> {
            structure() {
                return {
                    word: Types.String({
                        validate: /^\w+$/
                    })
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
        assert.equal( model.row.word, "test" );
    });

    it("enum validate", () => {


        class EnumModel extends Model<EnumModel> {
            structure() {
                return {
                    color: Types.String({
                        enum: ["red", "green", "blue"]
                    })
                };
            }
        }

        const model = new EnumModel();
        assert.strictEqual( model.row.color, null );

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
        assert.strictEqual( model.row.color, null );


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

    it("isValid(row)", () => {

        class SomeModel extends Model<SomeModel> {
            structure() {
                return {
                    sale: Types.Number({
                        required: true
                    }),
                    buy: Types.Number({
                        required: true
                    }),
                    color: Types.String({
                        enum: ["red", "green", "blue"]
                    }),
                    word: Types.String({
                        validate: /^\w+$/
                    }),
                    age: Types.Number({
                        validate: (age) => 
                            age > 0
                    }),
                    prop: Types.String
                };
            }

            validate(row) {
                if ( row.buy > row.sale ) {
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

        // custom validate row
        assert.strictEqual(model.isValid({
            buy: 100,
            sale: 20
        }), false);

        assert.throws(
            () => {
                anyModel.isValid();
            },
            (err) =>
                err.message === "row must be are object"
        );
    });

    it("const prop", () => {

        class SomeModel extends Model<SomeModel> {
            structure() {
                return {
                    name: Types.String({
                        const: true
                    })
                };
            }
        }

        let model = new SomeModel();

        assert.strictEqual( model.row.name, null );

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
        assert.equal( model.row.name, "Bob" );

        assert.throws(
            () => {
                model.set({name: "new name"});
            },
            (err) =>
                err.message === "cannot assign to read only property: name"
        );
    });

    
});

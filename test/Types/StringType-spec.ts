
import {Model, Types} from "../../lib/index";
import assert from "assert";

describe("StringType", () => {
    
    it("prepare string", () => {

        class SomeModel extends Model<SomeModel> {
            structure() {
                return {
                    name: Types.String({
                        default: 10 as any
                    })
                };
            }
        }
        let model: SomeModel;

        model = new SomeModel();
        assert.strictEqual( model.data.name, "10" );

        model = new SomeModel({
            name: -20 as any
        });
        assert.strictEqual( model.data.name, "-20" );
        
        model.set({name: 1.1 as any});
        assert.strictEqual( model.data.name, "1.1" );

        model.set({name: null});
        assert.strictEqual( model.data.name, null );

        model.set({name: "nice"});
        assert.strictEqual( model.data.name, "nice" );

        
        assert.throws(
            () => {
                const anyModel = model as any;
                anyModel.set({name: {}});
            },
            (err) =>
                err.message === "invalid string for name: {}"
        );

        assert.throws(
            () => {
                const anyModel = model as any;
                anyModel.set({name: {name: 1}});
            },
            (err) =>
                err.message === "invalid string for name: {\"name\":1}"
        );

        assert.throws(
            () => {
                const anyModel = model as any;
                anyModel.set({name: false});
            },
            (err) =>
                err.message === "invalid string for name: false"
        );

        assert.throws(
            () => {
                const anyModel = model as any;
                anyModel.set({name: true});
            },
            (err) =>
                err.message === "invalid string for name: true"
        );

        assert.throws(
            () => {
                model.set({name: -1 / 0 as any});
            },
            (err) =>
                err.message === "invalid string for name: -Infinity"
        );

        assert.throws(
            () => {
                model.set({name: 1 / 0 as any});
            },
            (err) =>
                err.message === "invalid string for name: Infinity"
        );

        assert.throws(
            () => {
                model.set({name: NaN as any});
            },
            (err) =>
                err.message === "invalid string for name: NaN"
        );

        assert.throws(
            () => {
                const anyModel = model as any;
                anyModel.set({name: /x/});
            },
            (err) =>
                err.message === "invalid string for name: /x/"
        );

        assert.throws(
            () => {
                const anyModel = model as any;
                anyModel.set({name: [0]});
            },
            (err) =>
                err.message === "invalid string for name: [0]"
        );

        assert.strictEqual( model.data.name, "nice" );
    });

    it("prepare trim", () => {

        class SomeModel extends Model<SomeModel> {
            structure() {
                return {
                    name: Types.String({
                        default: " bob ",
                        trim: true
                    })
                };
            }
        }

        const model = new SomeModel();
        assert.strictEqual( model.data.name, "bob" );

        model.set({name: " word "});
        assert.strictEqual( model.data.name, "word" );
    });

    it("prepare emptyAsNull", () => {

        class SomeModel extends Model<SomeModel> {
            structure() {
                return {
                    name: Types.String({
                        default: "",
                        emptyAsNull: true
                    })
                };
            }
        }

        const model = new SomeModel();
        assert.strictEqual( model.data.name, null );

        model.set({name: "word"});
        assert.strictEqual( model.data.name, "word" );

        model.set({name: ""});
        assert.strictEqual( model.data.name, null );
    });

    it("prepare nullAsEmpty", () => {

        class SomeModel extends Model<SomeModel> {
            structure() {
                return {
                    name: Types.String({
                        nullAsEmpty: true
                    })
                };
            }
        }

        const model = new SomeModel();
        assert.strictEqual( model.data.name, "" );

        model.set({name: "word"});
        assert.strictEqual( model.data.name, "word" );

        model.set({name: null});
        assert.strictEqual( model.data.name, "" );
    });

    it("prepare trim and emptyAsNull", () => {

        class SomeModel extends Model<SomeModel> {
            structure() {
                return {
                    name: Types.String({
                        default: " ",
                        trim: true,
                        emptyAsNull: true
                    })
                };
            }
        }

        const model = new SomeModel();
        assert.strictEqual( model.data.name, null );

        model.set({name: " word "});
        assert.strictEqual( model.data.name, "word" );

        model.set({name: "   "});
        assert.strictEqual( model.data.name, null );
    });

    it("prepare lower", () => {

        class SomeModel extends Model<SomeModel> {
            structure() {
                return {
                    name: Types.String({
                        default: "BOB",
                        lower: true
                    })
                };
            }
        }

        const model = new SomeModel();
        assert.strictEqual( model.data.name, "bob" );

        model.set({name: "WORD"});
        assert.strictEqual( model.data.name, "word" );
    });

    it("prepare upper", () => {

        class SomeModel extends Model<SomeModel> {
            structure() {
                return {
                    name: Types.String({
                        default: "bob",
                        upper: true
                    })
                };
            }
        }

        const model = new SomeModel();
        assert.strictEqual( model.data.name, "BOB" );

        model.set({name: "word"});
        assert.strictEqual( model.data.name, "WORD" );
    });

    it("prepare lower and trim", () => {

        class SomeModel extends Model<SomeModel> {
            structure() {
                return {
                    name: Types.String({
                        default: " Bob ",
                        lower: true,
                        trim: true
                    })
                };
            }
        }

        const model = new SomeModel();
        assert.strictEqual( model.data.name, "bob" );

        model.set({name: "WORD "});
        assert.strictEqual( model.data.name, "word" );
    });

    it("equal strings", () => {
        const pairs: any[][] = [
            [null, null, true],
            [null, "", false],
            ["", null, false],
            [" ", " ", true],
            ["  ", " ", false],
            ["nice", "nice", true],
            ["nice", "Nice", false]
        ];

        pairs.forEach((pair) => {
            class TestModel extends Model<TestModel> {
                structure() {
                    return {
                        str: Types.String
                    };
                }
            }

            const model1 = new TestModel({
                str: pair[0]
            });

            const model2 = new TestModel({
                str: pair[1]
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

    it("conflicting parameters: nullAsEmpty and emptyAsNull", () => {

        class SomeModel extends Model<SomeModel> {
            structure() {
                return {
                    name: Types.String({
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
                err.message === "name: conflicting parameters: use only nullAsEmpty or only emptyAsNull"
        );
    });

    it("conflicting parameters: lower and upper", () => {

        class SomeModel extends Model<SomeModel> {
            structure() {
                return {
                    name: Types.String({
                        lower: true,
                        upper: true
                    })
                };
            }
        }

        assert.throws(
            () => {
                const model = new SomeModel();
            },
            (err) =>
                err.message === "name: conflicting parameters: use only lower or only upper"
        );
    });

});

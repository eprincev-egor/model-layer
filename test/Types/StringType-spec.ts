
import {Model} from "../../lib/index";
import assert from "assert";

describe("StringType", () => {
    
    it("prepare string", () => {
        interface ISomeData {
            name: string | number;
        }

        class SomeModel extends Model<ISomeData> {
            static data() {
                return {
                    name: {
                        type: "string",
                        default: 10
                    }
                };
            }
        }
        let model: SomeModel;

        model = new SomeModel();
        assert.strictEqual( model.data.name, "10" );

        model = new SomeModel({
            name: -20
        });
        assert.strictEqual( model.data.name, "-20" );
        
        model.set({name: 1.1});
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
                model.set({name: -1 / 0});
            },
            (err) =>
                err.message === "invalid string for name: -Infinity"
        );

        assert.throws(
            () => {
                model.set({name: 1 / 0});
            },
            (err) =>
                err.message === "invalid string for name: Infinity"
        );

        assert.throws(
            () => {
                model.set({name: NaN});
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
        interface ISomeData {
            name: string;
        }

        class SomeModel extends Model<ISomeData> {
            static data() {
                return {
                    name: {
                        type: "string",
                        default: " bob ",
                        trim: true
                    }
                };
            }
        }

        const model = new SomeModel();
        assert.strictEqual( model.data.name, "bob" );

        model.set({name: " word "});
        assert.strictEqual( model.data.name, "word" );
    });

    it("prepare emptyAsNull", () => {
        interface ISomeData {
            name: string;
        }

        class SomeModel extends Model<ISomeData> {
            static data() {
                return {
                    name: {
                        type: "string",
                        default: "",
                        emptyAsNull: true
                    }
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
        interface ISomeData {
            name: string;
        }

        class SomeModel extends Model<ISomeData> {
            static data() {
                return {
                    name: {
                        type: "string",
                        nullAsEmpty: true
                    }
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
        interface ISomeData {
            name: string;
        }

        class SomeModel extends Model<ISomeData> {
            static data() {
                return {
                    name: {
                        type: "string",
                        default: " ",
                        trim: true,
                        emptyAsNull: true
                    }
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
        interface ISomeData {
            name: string;
        }

        class SomeModel extends Model<ISomeData> {
            static data() {
                return {
                    name: {
                        type: "string",
                        default: "BOB",
                        lower: true
                    }
                };
            }
        }

        const model = new SomeModel();
        assert.strictEqual( model.data.name, "bob" );

        model.set({name: "WORD"});
        assert.strictEqual( model.data.name, "word" );
    });

    it("prepare upper", () => {
        interface ISomeData {
            name: string;
        }

        class SomeModel extends Model<ISomeData> {
            static data() {
                return {
                    name: {
                        type: "string",
                        default: "bob",
                        upper: true
                    }
                };
            }
        }

        const model = new SomeModel();
        assert.strictEqual( model.data.name, "BOB" );

        model.set({name: "word"});
        assert.strictEqual( model.data.name, "WORD" );
    });

    it("prepare lower and trim", () => {
        interface ISomeData {
            name: string;
        }

        class SomeModel extends Model<ISomeData> {
            static data() {
                return {
                    name: {
                        type: "string",
                        default: " Bob ",
                        lower: true,
                        trim: true
                    }
                };
            }
        }

        const model = new SomeModel();
        assert.strictEqual( model.data.name, "bob" );

        model.set({name: "WORD "});
        assert.strictEqual( model.data.name, "word" );
    });

    it("redefine standard prepare string", () => {
        let callArgs: any = false;

        const StringType = Model.getType("string");
        const originalPrepare = StringType.prototype.prepare;

        StringType.prototype.prepare = function(value, key, anyModel) {
            callArgs = [value, key];
            return originalPrepare.call(this, value, key, anyModel);
        };

        interface ISomeData {
            name: string | number;
        }

        class SomeModel extends Model<ISomeData> {
            static data() {
                return {
                    name: "string"
                };
            }
        }

        const model = new SomeModel({
            name: 0
        });

        assert.strictEqual( model.data.name, "0" );
        assert.deepEqual( callArgs, [
            0, "name"
        ]);

        StringType.prototype.prepare = originalPrepare;
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

        interface ISomeData {
            str: string;
        }

        pairs.forEach((pair) => {
            class TestModel extends Model<ISomeData> {
                static data() {
                    return {
                        str: "string"
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
        interface ISomeData {
            name: string;
        }

        class SomeModel extends Model<ISomeData> {
            static data() {
                return {
                    name: {
                        type: "string",
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
                err.message === "name: conflicting parameters: use only nullAsEmpty or only emptyAsNull"
        );
    });

    it("conflicting parameters: lower and upper", () => {
        interface ISomeData {
            name: string;
        }

        class SomeModel extends Model<ISomeData> {
            static data() {
                return {
                    name: {
                        type: "string",
                        lower: true,
                        upper: true
                    }
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

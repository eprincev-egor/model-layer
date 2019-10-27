

const {Model} = require("../../lib/index");
const assert = require("assert");

describe("StringType", () => {
    
    it("prepare string", () => {
        class SomeModel extends Model {
            static data() {
                return {
                    name: {
                        type: "string",
                        default: 10
                    }
                };
            }
        }
        let model;

        model = new SomeModel();
        assert.strictEqual( model.data.name, "10" );

        model = new SomeModel({
            name: -20
        });
        assert.strictEqual( model.data.name, "-20" );
        
        model.set("name", 1.1);
        assert.strictEqual( model.data.name, "1.1" );

        model.set("name", null);
        assert.strictEqual( model.data.name, null );

        model.set("name", "nice");
        assert.strictEqual( model.data.name, "nice" );

        
        assert.throws(
            () => {
                model.set("name", {});
            },
            err =>
                err.message == "invalid string for name: {}"
        );

        assert.throws(
            () => {
                model.set("name", {name: 1});
            },
            err =>
                err.message == "invalid string for name: {\"name\":1}"
        );

        assert.throws(
            () => {
                model.set("name", false);
            },
            err =>
                err.message == "invalid string for name: false"
        );

        assert.throws(
            () => {
                model.set("name", true);
            },
            err =>
                err.message == "invalid string for name: true"
        );

        assert.throws(
            () => {
                model.set("name", -1 / 0);
            },
            err =>
                err.message == "invalid string for name: -Infinity"
        );

        assert.throws(
            () => {
                model.set("name", 1 / 0);
            },
            err =>
                err.message == "invalid string for name: Infinity"
        );

        assert.throws(
            () => {
                model.set("name", NaN);
            },
            err =>
                err.message == "invalid string for name: NaN"
        );

        assert.throws(
            () => {
                model.set("name", /x/);
            },
            err =>
                err.message == "invalid string for name: /x/"
        );

        assert.throws(
            () => {
                model.set("name", [0]);
            },
            err =>
                err.message == "invalid string for name: [0]"
        );

        assert.strictEqual( model.data.name, "nice" );
    });

    it("prepare trim", () => {
        class SomeModel extends Model {
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

        let model = new SomeModel();
        assert.strictEqual( model.data.name, "bob" );

        model.set("name", " word ");
        assert.strictEqual( model.data.name, "word" );
    });

    it("prepare emptyAsNull", () => {
        class SomeModel extends Model {
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

        let model = new SomeModel();
        assert.strictEqual( model.data.name, null );

        model.set("name", "word");
        assert.strictEqual( model.data.name, "word" );

        model.set("name", "");
        assert.strictEqual( model.data.name, null );
    });

    it("prepare nullAsEmpty", () => {
        class SomeModel extends Model {
            static data() {
                return {
                    name: {
                        type: "string",
                        nullAsEmpty: true
                    }
                };
            }
        }

        let model = new SomeModel();
        assert.strictEqual( model.data.name, "" );

        model.set("name", "word");
        assert.strictEqual( model.data.name, "word" );

        model.set("name", null);
        assert.strictEqual( model.data.name, "" );
    });

    it("prepare trim and emptyAsNull", () => {
        class SomeModel extends Model {
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

        let model = new SomeModel();
        assert.strictEqual( model.data.name, null );

        model.set("name", " word ");
        assert.strictEqual( model.data.name, "word" );

        model.set("name", "   ");
        assert.strictEqual( model.data.name, null );
    });

    it("prepare lower", () => {
        class SomeModel extends Model {
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

        let model = new SomeModel();
        assert.strictEqual( model.data.name, "bob" );

        model.set("name", "WORD");
        assert.strictEqual( model.data.name, "word" );
    });

    it("prepare upper", () => {
        class SomeModel extends Model {
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

        let model = new SomeModel();
        assert.strictEqual( model.data.name, "BOB" );

        model.set("name", "word");
        assert.strictEqual( model.data.name, "WORD" );
    });

    it("prepare lower and trim", () => {
        class SomeModel extends Model {
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

        let model = new SomeModel();
        assert.strictEqual( model.data.name, "bob" );

        model.set("name", "WORD ");
        assert.strictEqual( model.data.name, "word" );
    });

    it("redefine standard prepare string", () => {
        let callArgs = false;

        const StringType = Model.getType("string");
        let originalPrepare = StringType.prototype.prepare;

        StringType.prototype.prepare = function(value, key, model) {
            callArgs = [value, key];
            return originalPrepare.call(this, value, key, model);
        };

        class SomeModel extends Model {
            static data() {
                return {
                    name: "string"
                };
            }
        }

        let model = new SomeModel({
            name: 0
        });

        assert.strictEqual( model.data.name, "0" );
        assert.deepEqual( callArgs, [
            0, "name"
        ]);

        StringType.prototype.prepare = originalPrepare;
    });

    it("equal strings", () => {
        let pairs = [
            [null, null, true],
            [null, "", false],
            ["", null, false],
            [" ", " ", true],
            ["  ", " ", false],
            ["nice", "nice", true],
            ["nice", "Nice", false]
        ];

        pairs.forEach(pair => {
            class TestModel extends Model {
                static data() {
                    return {
                        str: "string"
                    };
                }
            }

            let model1 = new TestModel({
                str: pair[0]
            });

            let model2 = new TestModel({
                str: pair[1]
            });

            assert.strictEqual(
                model1.equal( model2 ),
                pair[2],
                pair
            );

            assert.strictEqual(
                model2.equal( model1 ),
                pair[2],
                pair
            );
        });
    });

});
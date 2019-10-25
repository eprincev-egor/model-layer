

const {Model} = require("../../lib/index");
const assert = require("assert");

describe("BooleanType", () => {
    
    it("prepare boolean", () => {
        class SomeModel extends Model {
            static structure() {
                return {
                    some: {
                        type: "boolean",
                        default: 0
                    }
                };
            }
        }
        let model;

        model = new SomeModel();
        assert.strictEqual( model.data.some, false );

        model = new SomeModel({
            some: 1
        });
        assert.strictEqual( model.data.some, true );
        
        model.set("some", false);
        assert.strictEqual( model.data.some, false );

        model.set("some", null);
        assert.strictEqual( model.data.some, null );

        model.set("some", true);
        assert.strictEqual( model.data.some, true );

        
        assert.throws(
            () => {
                model.set("some", {});
            },
            err =>
                err.message == "invalid boolean for some: {}"
        );

        assert.throws(
            () => {
                model.set("some", {some: 1});
            },
            err =>
                err.message == "invalid boolean for some: {\"some\":1}"
        );

        assert.throws(
            () => {
                model.set("some", -1 / 0);
            },
            err =>
                err.message == "invalid boolean for some: -Infinity"
        );

        assert.throws(
            () => {
                model.set("some", 1 / 0);
            },
            err =>
                err.message == "invalid boolean for some: Infinity"
        );

        assert.throws(
            () => {
                model.set("some", NaN);
            },
            err =>
                err.message == "invalid boolean for some: NaN"
        );

        assert.throws(
            () => {
                model.set("some", /x/);
            },
            err =>
                err.message == "invalid boolean for some: /x/"
        );

        assert.throws(
            () => {
                model.set("some", "wrong");
            },
            err =>
                err.message == "invalid boolean for some: \"wrong\""
        );

        assert.throws(
            () => {
                model.set("some", [0]);
            },
            err =>
                err.message == "invalid boolean for some: [0]"
        );

        assert.strictEqual( model.data.some, true );
    });


    it("prepare falseAsNull", () => {
        class SomeModel extends Model {
            static structure() {
                return {
                    some: {
                        type: "boolean",
                        default: false,
                        falseAsNull: true
                    }
                };
            }
        }

        let model = new SomeModel();
        assert.strictEqual( model.data.some, null );

        model.set("some", false);
        assert.strictEqual( model.data.some, null );

        model.set("some", true);
        assert.strictEqual( model.data.some, true );

        model.set("some", 0);
        assert.strictEqual( model.data.some, null );

        model.set("some", 1);
        assert.strictEqual( model.data.some, true );
    });

    it("prepare nullAsFalse", () => {
        class SomeModel extends Model {
            static structure() {
                return {
                    some: {
                        type: "boolean",
                        nullAsFalse: true
                    }
                };
            }
        }

        let model = new SomeModel();
        assert.strictEqual( model.data.some, false );

        model.set("some", true);
        assert.strictEqual( model.data.some, true );

        model.set("some", null);
        assert.strictEqual( model.data.some, false );
    });


    it("redefine standard prepare boolean", () => {
        let callArgs = false;

        const BooleanType = Model.getType("boolean");
        let originalPrepare = BooleanType.prototype.prepare;

        BooleanType.prototype.prepare = function(value, key, model) {
            callArgs = [value, key];
            return originalPrepare.call(this, value, key, model);
        };

        class SomeModel extends Model {
            static structure() {
                return {
                    some: "boolean"
                };
            }
        }

        let model = new SomeModel({
            some: 0
        });

        assert.strictEqual( model.data.some, false );
        assert.deepEqual( callArgs, [
            0, "some"
        ]);

        BooleanType.prototype.prepare = originalPrepare;
    });


    it("equal booleans", () => {
        let pairs = [
            [null, false, false],
            [null, true, false],
            [false, false, true],
            [false, true, false],
            [true, true, true],
            [1, true, true]
        ];

        pairs.forEach(pair => {
            class TestModel extends Model {
                static structure() {
                    return {
                        bool: "boolean"
                    };
                }
            }

            let model1 = new TestModel({
                bool: pair[0]
            });

            let model2 = new TestModel({
                bool: pair[1]
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
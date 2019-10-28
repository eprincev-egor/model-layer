
import {Model} from "../../lib/index";
import assert from "assert";

describe("BooleanType", () => {
    
    it("prepare boolean", () => {
        interface ISomeData {
            some: boolean | 0 | 1;
        }

        class SomeModel extends Model<ISomeData> {
            public static data() {
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
            (err) =>
                err.message === "invalid boolean for some: {}"
        );

        assert.throws(
            () => {
                model.set("some", {some: 1});
            },
            (err) =>
                err.message === "invalid boolean for some: {\"some\":1}"
        );

        assert.throws(
            () => {
                model.set("some", -1 / 0);
            },
            (err) =>
                err.message === "invalid boolean for some: -Infinity"
        );

        assert.throws(
            () => {
                model.set("some", 1 / 0);
            },
            (err) =>
                err.message === "invalid boolean for some: Infinity"
        );

        assert.throws(
            () => {
                model.set("some", NaN);
            },
            (err) =>
                err.message === "invalid boolean for some: NaN"
        );

        assert.throws(
            () => {
                model.set("some", /x/);
            },
            (err) =>
                err.message === "invalid boolean for some: /x/"
        );

        assert.throws(
            () => {
                model.set("some", "wrong");
            },
            (err) =>
                err.message === "invalid boolean for some: \"wrong\""
        );

        assert.throws(
            () => {
                model.set("some", [0]);
            },
            (err) =>
                err.message === "invalid boolean for some: [0]"
        );

        assert.strictEqual( model.data.some, true );
    });


    it("prepare falseAsNull", () => {
        interface ISomeData {
            some: boolean | 0 | 1;
        }

        class SomeModel extends Model<ISomeData> {
            public static data() {
                return {
                    some: {
                        type: "boolean",
                        default: false,
                        falseAsNull: true
                    }
                };
            }
        }

        const model = new SomeModel();
        assert.strictEqual( model.data.some, null );

        model.set({some: false});
        assert.strictEqual( model.data.some, null );

        model.set({some: true});
        assert.strictEqual( model.data.some, true );

        model.set({some: 0});
        assert.strictEqual( model.data.some, null );

        model.set({some: 1});
        assert.strictEqual( model.data.some, true );
    });

    it("prepare nullAsFalse", () => {
        interface ISomeData {
            some: boolean | 0 | 1;
        }

        class SomeModel extends Model<ISomeData> {
            public static data() {
                return {
                    some: {
                        type: "boolean",
                        nullAsFalse: true
                    }
                };
            }
        }

        const model = new SomeModel();
        assert.strictEqual( model.data.some, false );

        model.set({some: true});
        assert.strictEqual( model.data.some, true );

        model.set({some: null});
        assert.strictEqual( model.data.some, false );
    });


    it("redefine standard prepare boolean", () => {
        let callArgs: any = false;

        const BooleanType = Model.getType("boolean");
        const originalPrepare = BooleanType.prototype.prepare;

        BooleanType.prototype.prepare = function(value, key, anyModel) {
            callArgs = [value, key];
            return originalPrepare.call(this, value, key, anyModel);
        };

        interface ISomeData {
            some: boolean | 0 | 1;
        }

        class SomeModel extends Model<ISomeData> {
            public static data() {
                return {
                    some: "boolean"
                };
            }
        }

        const model = new SomeModel({
            some: 0
        });

        assert.strictEqual( model.data.some, false );
        assert.deepEqual( callArgs, [
            0, "some"
        ]);

        BooleanType.prototype.prepare = originalPrepare;
    });


    it("equal booleans", () => {
        const pairs: Array<Array<boolean | 0 | 1>> = [
            [null, false, false],
            [null, true, false],
            [false, false, true],
            [false, true, false],
            [true, true, true],
            [1, true, true]
        ];

        interface ISomeData {
            bool: boolean | 0 | 1;
        }

        pairs.forEach((pair) => {
            class TestModel extends Model<ISomeData> {
                public static data() {
                    return {
                        bool: "boolean"
                    };
                }
            }

            const model1 = new TestModel({
                bool: pair[0]
            });

            const model2 = new TestModel({
                bool: pair[1]
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

    
});

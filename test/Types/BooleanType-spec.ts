
import {Model, Types} from "../../lib/index";
import assert from "assert";

describe("BooleanType", () => {
    
    it("prepare boolean", () => {

        class SomeModel extends Model<SomeModel> {
            structure() {
                return {
                    some: Types.Boolean({
                        default: false
                    })
                };
            }
        }
        let model;

        model = new SomeModel();
        assert.strictEqual( model.row.some, false );

        model.set({some: false});
        assert.strictEqual( model.row.some, false );

        model.set({some: null});
        assert.strictEqual( model.row.some, null );

        model.set({some: true});
        assert.strictEqual( model.row.some, true );

        
        assert.throws(
            () => {
                model = new SomeModel({
                    some: 1 as any
                });
            },
            (err) =>
                err.message === "invalid boolean for some: 1"
        );

        assert.throws(
            () => {
                model.set({some: {}});
            },
            (err) =>
                err.message === "invalid boolean for some: {}"
        );

        assert.throws(
            () => {
                model.set({some: {some: 1}});
            },
            (err) =>
                err.message === "invalid boolean for some: {\"some\":1}"
        );

        assert.throws(
            () => {
                model.set({some: -1 / 0});
            },
            (err) =>
                err.message === "invalid boolean for some: -Infinity"
        );

        assert.throws(
            () => {
                model.set({some: 1 / 0});
            },
            (err) =>
                err.message === "invalid boolean for some: Infinity"
        );

        assert.throws(
            () => {
                model.set({some: NaN});
            },
            (err) =>
                err.message === "invalid boolean for some: NaN"
        );

        assert.throws(
            () => {
                model.set({some: /x/});
            },
            (err) =>
                err.message === "invalid boolean for some: /x/"
        );

        assert.throws(
            () => {
                model.set({some: "wrong"});
            },
            (err) =>
                err.message === "invalid boolean for some: \"wrong\""
        );

        assert.throws(
            () => {
                model.set({some: [0]});
            },
            (err) =>
                err.message === "invalid boolean for some: [0]"
        );

        assert.strictEqual( model.row.some, true );
    });


    it("prepare falseAsNull", () => {

        class SomeModel extends Model<SomeModel> {
            structure() {
                return {
                    some: Types.Boolean({
                        default: false,
                        falseAsNull: true
                    })
                };
            }
        }

        const model = new SomeModel();
        assert.strictEqual( model.row.some, null );

        model.set({some: false});
        assert.strictEqual( model.row.some, null );

        model.set({some: true});
        assert.strictEqual( model.row.some, true );

    });

    it("prepare nullAsFalse", () => {

        class SomeModel extends Model<SomeModel> {
            structure() {
                return {
                    some: Types.Boolean({
                        nullAsFalse: true
                    })
                };
            }
        }

        const model = new SomeModel();
        assert.strictEqual( model.row.some, false );

        model.set({some: true});
        assert.strictEqual( model.row.some, true );

        model.set({some: null});
        assert.strictEqual( model.row.some, false );
    });


    it("equal booleans", () => {
        const pairs: boolean[][] = [
            [null, false, false],
            [null, true, false],
            [false, false, true],
            [false, true, false],
            [true, true, true]
        ];
        
        pairs.forEach((pair) => {
            class TestModel extends Model<TestModel> {
                structure() {
                    return {
                        bool: Types.Boolean
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

    it("conflicting parameters: nullAsFalse and falseAsNull", () => {

        class SomeModel extends Model<SomeModel> {
            structure() {
                return {
                    flag: Types.Boolean({
                        nullAsFalse: true,
                        falseAsNull: true
                    })
                };
            }
        }

        assert.throws(
            () => {
                const model = new SomeModel();
            },
            (err) =>
                err.message === "flag: conflicting parameters: use only nullAsFalse or only falseAsNull"
        );
    });

    
});

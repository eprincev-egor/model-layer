
import {Model, Types} from "../../lib/index";
import assert from "assert";

describe("DateType", () => {
    
    it("prepare date", () => {
        // Date.parse trimming ms
        const now = Date.parse(
            new Date().toString()
        );
        const nowDate = new Date( now );

        class SomeModel extends Model<SomeModel> {
            structure() {
                return {
                    bornDate: Types.Date({
                        default: now as any
                    })
                };
            }
        }
        let model: SomeModel;

        model = new SomeModel();
        assert.strictEqual( +model.row.bornDate, now );
        assert.ok( model.row.bornDate instanceof Date );

        model = new SomeModel({
            bornDate: nowDate
        });
        assert.strictEqual( +model.row.bornDate, now );
        assert.ok( model.row.bornDate instanceof Date );
        
        model.set({bornDate: now});
        assert.strictEqual( +model.row.bornDate, now );
        assert.ok( model.row.bornDate instanceof Date );

        model.set({bornDate: null});
        assert.strictEqual( model.row.bornDate, null );

        model.set({bornDate: nowDate.toString()});
        assert.strictEqual( +model.row.bornDate, now );
        assert.ok( model.row.bornDate instanceof Date );

        model.set({bornDate: null});
        assert.strictEqual( model.row.bornDate, null );

        model.set({bornDate: nowDate.toISOString()});
        assert.strictEqual( +model.row.bornDate, now );
        assert.ok( model.row.bornDate instanceof Date );

        assert.throws(
            () => {
                model.set({bornDate: "wrong"});
            },
            (err: Error) =>
                err.message === "invalid date for bornDate: \"wrong\""
        );

        assert.throws(
            () => {
                const anyModel = model as any;
                anyModel.set({bornDate: {}});
            },
            (err: Error) =>
                err.message === "invalid date for bornDate: {}"
        );

        assert.throws(
            () => {
                const anyModel = model as any;
                anyModel.set({bornDate: {bornDate: 1}});
            },
            (err: Error) =>
                err.message === "invalid date for bornDate: {\"bornDate\":1}"
        );

        assert.throws(
            () => {
                const anyModel = model as any;
                anyModel.set({bornDate: false});
            },
            (err: Error) =>
                err.message === "invalid date for bornDate: false"
        );

        assert.throws(
            () => {
                const anyModel = model as any;
                anyModel.set({bornDate: true});
            },
            (err: Error) =>
                err.message === "invalid date for bornDate: true"
        );

        assert.throws(
            () => {
                const anyModel = model as any;
                anyModel.set({bornDate: -1 / 0});
            },
            (err: Error) =>
                err.message === "invalid date for bornDate: -Infinity"
        );

        assert.throws(
            () => {
                const anyModel = model as any;
                anyModel.set({bornDate: 1 / 0});
            },
            (err: Error) =>
                err.message === "invalid date for bornDate: Infinity"
        );

        assert.throws(
            () => {
                const anyModel = model as any;
                anyModel.set({bornDate: NaN});
            },
            (err: Error) =>
                err.message === "invalid date for bornDate: NaN"
        );

        assert.throws(
            () => {
                const anyModel = model as any;
                anyModel.set({bornDate: /x/});
            },
            (err: Error) =>
                err.message === "invalid date for bornDate: /x/"
        );

        assert.throws(
            () => {
                const anyModel = model as any;
                anyModel.set({bornDate: [0]});
            },
            (err: Error) =>
                err.message === "invalid date for bornDate: [0]"
        );

        assert.strictEqual( +model.row.bornDate, now );
        assert.ok( model.row.bornDate instanceof Date );
    });

    it("equal Date", () => {
        const now1 = new Date();
        const now2 = new Date( +now1 );

        const pairs: any[][] = [
            [null, null, true],
            [null, 0, false],
            [null, now1, false],
            [null, now2, false],
            [now1, now2, true]
        ];

        pairs.forEach((pair) => {
            class TestModel extends Model<TestModel> {
                structure() {
                    return {
                        date: Types.Date
                    };
                }
            }

            const model1 = new TestModel({
                date: pair[0]
            });

            const model2 = new TestModel({
                date: pair[1]
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

    it("date value toJSON()", () => {

        const date = new Date();
        const isoDate = date.toISOString();

        class SomeModel extends Model<SomeModel> {
            structure() {
                return {
                    date: Types.Date
                };
            }
        }

        const model = new SomeModel({
            date
        });
        
        assert.deepStrictEqual(model.toJSON(), {
            date: isoDate
        });
    });
});

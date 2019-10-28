
import {Model} from "../../lib/index";
import assert from "assert";

describe("DateType", () => {
    
    it("prepare date", () => {
        interface ISomeData {
            bornDate: Date | number | string;
        }

        // Date.parse trimming ms
        const now = Date.parse(
            new Date().toString()
        );
        const nowDate = new Date( now );

        class SomeModel extends Model<ISomeData> {
            public static data() {
                return {
                    bornDate: {
                        type: "date",
                        default: now
                    }
                };
            }
        }
        let model: SomeModel;

        model = new SomeModel();
        assert.strictEqual( +model.data.bornDate, now );
        assert.ok( model.data.bornDate instanceof Date );

        model = new SomeModel({
            bornDate: nowDate
        });
        assert.strictEqual( +model.data.bornDate, now );
        assert.ok( model.data.bornDate instanceof Date );
        
        model.set({bornDate: now});
        assert.strictEqual( +model.data.bornDate, now );
        assert.ok( model.data.bornDate instanceof Date );

        model.set({bornDate: null});
        assert.strictEqual( model.data.bornDate, null );

        model.set({bornDate: nowDate.toString()});
        assert.strictEqual( +model.data.bornDate, now );
        assert.ok( model.data.bornDate instanceof Date );

        model.set({bornDate: null});
        assert.strictEqual( model.data.bornDate, null );

        model.set({bornDate: nowDate.toISOString()});
        assert.strictEqual( +model.data.bornDate, now );
        assert.ok( model.data.bornDate instanceof Date );

        assert.throws(
            () => {
                model.set({bornDate: "wrong"});
            },
            (err) =>
                err.message === "invalid date for bornDate: \"wrong\""
        );

        assert.throws(
            () => {
                const anyModel = model as any;
                anyModel.set({bornDate: {}});
            },
            (err) =>
                err.message === "invalid date for bornDate: {}"
        );

        assert.throws(
            () => {
                const anyModel = model as any;
                anyModel.set({bornDate: {bornDate: 1}});
            },
            (err) =>
                err.message === "invalid date for bornDate: {\"bornDate\":1}"
        );

        assert.throws(
            () => {
                const anyModel = model as any;
                anyModel.set({bornDate: false});
            },
            (err) =>
                err.message === "invalid date for bornDate: false"
        );

        assert.throws(
            () => {
                const anyModel = model as any;
                anyModel.set({bornDate: true});
            },
            (err) =>
                err.message === "invalid date for bornDate: true"
        );

        assert.throws(
            () => {
                const anyModel = model as any;
                anyModel.set({bornDate: -1 / 0});
            },
            (err) =>
                err.message === "invalid date for bornDate: -Infinity"
        );

        assert.throws(
            () => {
                const anyModel = model as any;
                anyModel.set({bornDate: 1 / 0});
            },
            (err) =>
                err.message === "invalid date for bornDate: Infinity"
        );

        assert.throws(
            () => {
                const anyModel = model as any;
                anyModel.set({bornDate: NaN});
            },
            (err) =>
                err.message === "invalid date for bornDate: NaN"
        );

        assert.throws(
            () => {
                const anyModel = model as any;
                anyModel.set({bornDate: /x/});
            },
            (err) =>
                err.message === "invalid date for bornDate: /x/"
        );

        assert.throws(
            () => {
                const anyModel = model as any;
                anyModel.set({bornDate: [0]});
            },
            (err) =>
                err.message === "invalid date for bornDate: [0]"
        );

        assert.strictEqual( +model.data.bornDate, now );
        assert.ok( model.data.bornDate instanceof Date );
    });

    it("redefine standard prepare date", () => {
        let callArgs: any = false;

        const DateType = Model.getType("date");
        const originalPrepare = DateType.prototype.prepare;

        DateType.prototype.prepare = function(value, key, anyModel) {
            callArgs = [value, key];
            return originalPrepare.call(this, value, key, anyModel);
        };

        interface ISomeData {
            bornDate: Date | number | string;
        }

        class SomeModel extends Model<ISomeData> {
            public static data() {
                return {
                    bornDate: "date"
                };
            }
        }

        const now = Date.now();
        const model = new SomeModel({
            bornDate: now
        });

        assert.strictEqual( +model.data.bornDate, now );
        assert.ok( model.data.bornDate instanceof Date );
        assert.deepEqual( callArgs, [
            now, "bornDate"
        ]);

        DateType.prototype.prepare = originalPrepare;
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

        interface ISomeData {
            date: Date | number | string;
        }

        pairs.forEach((pair) => {
            class TestModel extends Model<ISomeData> {
                public static data() {
                    return {
                        date: "date"
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
});

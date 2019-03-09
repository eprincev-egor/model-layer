"use strict";

const {Model} = require("../../lib/index");
const assert = require("assert");

describe("DateType", () => {
    
    it("prepare date", () => {
        // Date.parse trimming ms
        let now = Date.parse(
            new Date().toString()
        );
        let nowDate = new Date( now );

        class SomeModel extends Model {
            static structure() {
                return {
                    bornDate: {
                        type: "date",
                        default: now
                    }
                };
            }
        }
        let model;

        model = new SomeModel();
        assert.strictEqual( +model.data.bornDate, now );
        assert.ok( model.data.bornDate instanceof Date );

        model = new SomeModel({
            bornDate: nowDate
        });
        assert.strictEqual( +model.data.bornDate, now );
        assert.ok( model.data.bornDate instanceof Date );
        
        model.set("bornDate", now);
        assert.strictEqual( +model.data.bornDate, now );
        assert.ok( model.data.bornDate instanceof Date );

        model.set("bornDate", null);
        assert.strictEqual( model.data.bornDate, null );

        model.set("bornDate", nowDate.toString());
        assert.strictEqual( +model.data.bornDate, now );
        assert.ok( model.data.bornDate instanceof Date );

        model.set("bornDate", null);
        assert.strictEqual( model.data.bornDate, null );

        model.set("bornDate", nowDate.toISOString());
        assert.strictEqual( +model.data.bornDate, now );
        assert.ok( model.data.bornDate instanceof Date );

        assert.throws(
            () => {
                model.set("bornDate", "wrong");
            },
            err =>
                err.message == "invalid date for bornDate: \"wrong\""
        );

        assert.throws(
            () => {
                model.set("bornDate", {});
            },
            err =>
                err.message == "invalid date for bornDate: {}"
        );

        assert.throws(
            () => {
                model.set("bornDate", {bornDate: 1});
            },
            err =>
                err.message == "invalid date for bornDate: {\"bornDate\":1}"
        );

        assert.throws(
            () => {
                model.set("bornDate", false);
            },
            err =>
                err.message == "invalid date for bornDate: false"
        );

        assert.throws(
            () => {
                model.set("bornDate", true);
            },
            err =>
                err.message == "invalid date for bornDate: true"
        );

        assert.throws(
            () => {
                model.set("bornDate", -1 / 0);
            },
            err =>
                err.message == "invalid date for bornDate: -Infinity"
        );

        assert.throws(
            () => {
                model.set("bornDate", 1 / 0);
            },
            err =>
                err.message == "invalid date for bornDate: Infinity"
        );

        assert.throws(
            () => {
                model.set("bornDate", NaN);
            },
            err =>
                err.message == "invalid date for bornDate: NaN"
        );

        assert.throws(
            () => {
                model.set("bornDate", /x/);
            },
            err =>
                err.message == "invalid date for bornDate: /x/"
        );

        assert.throws(
            () => {
                model.set("bornDate", [0]);
            },
            err =>
                err.message == "invalid date for bornDate: [0]"
        );

        assert.strictEqual( +model.data.bornDate, now );
        assert.ok( model.data.bornDate instanceof Date );
    });

    it("redefine standard prepare date", () => {
        let callArgs = false;

        const DateType = Model.getType("date");
        let originalPrepare = DateType.prototype.prepare;

        DateType.prototype.prepare = function(value, key, model) {
            callArgs = [value, key];
            return originalPrepare.call(this, value, key, model);
        };

        class SomeModel extends Model {
            static structure() {
                return {
                    bornDate: "date"
                };
            }
        }

        let now = Date.now();
        let model = new SomeModel({
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
        let now1 = new Date();
        let now2 = new Date( +now1 );

        let pairs = [
            [null, null, true],
            [null, 0, false],
            [null, now1, false],
            [null, now2, false],
            [now1, now2, true]
        ];

        pairs.forEach(pair => {
            class TestModel extends Model {
                static structure() {
                    return {
                        date: "date"
                    };
                }
            }

            let model1 = new TestModel({
                date: pair[0]
            });

            let model2 = new TestModel({
                date: pair[1]
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
"use strict";

const {Model} = require("../../lib/index");
const assert = require("assert");
const {invalidValuesAsString} = require("../../lib/utils");

describe("AnyType", () => {

    it("any value", () => {
        
        class SomeModel extends Model {
            static structure() {
                return {
                    any: "*"
                };
            }
        }

        let model = new SomeModel();
        assert.strictEqual(model.data.any, null);

        model.set("any", 10);
        assert.strictEqual(model.data.any, 10);
        
        model.set("any", "text");
        assert.strictEqual(model.data.any, "text");

        model.set("any", true);
        assert.strictEqual(model.data.any, true);
    });

    it("any value toJSON()", () => {
        
        let date = new Date();
        let isoDate = date.toISOString();

        class SomeModel extends Model {
            static structure() {
                return {
                    any: "*"
                };
            }
        }

        let model = new SomeModel({
            any: {
                str: "",
                numb: 0,
                bool: false,
                arr: [{
                    some: true
                }],
                obj: {
                    arr: ["xxx", 8, 0, false],
                    someDate: date,
                    customToJSON: {
                        toJSON() {
                            return "customToJSON";
                        }
                    }
                }
            }
        });
        
        assert.deepStrictEqual(model.toJSON(), {
            any: {
                str: "",
                numb: 0,
                bool: false,
                arr: [{
                    some: true
                }],
                obj: {
                    arr: ["xxx", 8, 0, false],
                    someDate: isoDate,
                    customToJSON: "customToJSON"
                }
            }
        });
    });

    it("equal any values", () => {
        let now1 = new Date();
        let now2 = new Date( +now1 );
        let date2000 = new Date(2000);

        class CustomClass {}
        let obj1 = new CustomClass();
        let obj2 = new CustomClass();

        class SomeModel extends Model {
            static structure() {
                return {
                    "*": "*"
                };
            }
        }
        let emptyModel1 = new SomeModel();
        let emptyModel2 = new SomeModel();
        let sameModel1 = new SomeModel({
            x: {a: 1}
        });
        let sameModel2 = new SomeModel({
            x: {a: 1}
        });

        // circular object
        let circularObj1 = {};
        circularObj1.self = circularObj1;

        let circularObj2 = {};
        circularObj2.self = circularObj2;

        let circularObj3 = {x: 1};
        circularObj3.self = circularObj3;

        let circularObj4 = {};
        circularObj4.self = circularObj2;

        // circular arr
        let circularArr1 = [];
        circularArr1[0] = circularArr1;

        let circularArr2 = [];
        circularArr2[0] = circularArr2;

        let circularArr3 = [];
        circularArr3[0] = circularArr3;
        circularArr3[1] = 0;

        // circular model
        let circularModel1 = new SomeModel();
        circularModel1.set("self", circularModel1);

        let circularModel2 = new SomeModel();
        circularModel2.set("self", circularModel2);

        let circularModel3 = new SomeModel({x: 1});
        circularModel3.set("self", circularModel3);


        let pairs = [
            [null, null, true],
            [null, undefined, false],
            [undefined, undefined, true],

            [null, false, false],
            [false, false, true],

            [false, 0, false],
            [0, 0, true],

            [null, "", false],
            ["", "", true],
            ["x", "x", true],

            ["1", 1, false],
            ["0", 0, false],

            [null, Infinity, false],
            [Infinity, Infinity, true],
            [-Infinity, +Infinity, false],

            [null, NaN, false],
            [NaN, NaN, true],

            [null, [], false],
            [0, [], false],
            [0, [0], false],
            [[], [], true],
            [[2], [2], true],
            [[1], [2], false],
            [[1, 2], [2], false],
            [[[]], [[]], true],
            [[[1]], [[1]], true],
            [[[1]], [[2]], false],

            [null, /xx/, false],
            [/xx/, /xx/, true],
            [/xx/g, /xx/i, false],
            [/xx/, /xxx/, false],

            [null, now1, false],
            [now1, now1, true],
            [now1, now2, true],
            [now1, date2000, false],

            [null, {}, false],
            [{}, {}, true],
            [{}, {x: 1}, false],
            [{x: 1}, {x: 1}, true],
            [{x: 1}, {x: 1, y: 2}, false],
            [{x: {a: 1}}, {x: {a: 1}}, true],

            [
                [{x: {a: 1}}, 1], 
                [{x: {a: 1}}, 1], 
                true
            ],
            [
                [{x: {a: 1}}, 1], 
                [{x: {a: 1}}, true], 
                false
            ],
            
            [null, obj1, false],
            [obj1, obj1, true],
            [obj1, obj2, false],

            [null, emptyModel1, false],
            [emptyModel1, emptyModel1, true],
            [emptyModel1, emptyModel2, true],
            [emptyModel1, sameModel1, false],
            [sameModel1, sameModel1, true],
            [sameModel1, sameModel2, true],

            [circularObj1, circularObj1, true],
            [circularObj1, circularObj2, true],
            [circularObj2, circularObj2, true],
            [circularObj1, circularObj3, false],
            [circularObj2, circularObj3, false],
            
            // [circularObj2, circularObj4, false],

            [circularArr1, circularArr1, true],
            [circularArr1, circularArr2, true],
            [circularArr2, circularArr2, true],
            [circularArr1, circularArr3, false],
            [circularArr2, circularArr3, false],

            [circularModel1, circularModel1, true],
            [circularModel1, circularModel2, true],
            [circularModel2, circularModel2, true],
            [circularModel1, circularModel3, false],
            [circularModel2, circularModel3, false],

            [-0, +0, true]
        ];

        pairs.forEach((pair, i) => {
            class TestModel extends Model {
                static structure() {
                    return {
                        any: "*"
                    };
                }
            }

            let model1 = new TestModel({
                any: pair[0]
            });

            let model2 = new TestModel({
                any: pair[1]
            });

            assert.strictEqual(
                model1.equal( model2 ),
                pair[2],
                i + ": " + invalidValuesAsString(pair)
            );

            assert.strictEqual(
                model2.equal( model1 ),
                pair[2],
                i + ": " + invalidValuesAsString(pair)
            );
        });
    });
});
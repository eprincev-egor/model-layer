"use strict";

const {Model} = require("../../lib/index");
const assert = require("assert");

describe("NumberType", () => {
    
    it("prepare number", () => {
        class SomeModel extends Model {
            static structure() {
                return {
                    age: {
                        type: "number",
                        default: "0"
                    }
                };
            }
        }
        let model;

        model = new SomeModel();
        assert.strictEqual( model.data.age, 0 );

        model = new SomeModel({
            age: "1"
        });
        assert.strictEqual( model.data.age, 1 );
        
        model.set("age", "2");
        assert.strictEqual( model.data.age, 2 );

        model.set("age", null);
        assert.strictEqual( model.data.age, null );

        model.set("age", "-2000.123");
        assert.strictEqual( model.data.age, -2000.123 );

        assert.throws(
            () => {
                model.set("age", "wrong");
            },
            err =>
                err.message == "invalid number for age: \"wrong\""
        );

        assert.throws(
            () => {
                model.set("age", {});
            },
            err =>
                err.message == "invalid number for age: {}"
        );

        assert.throws(
            () => {
                model.set("age", {age: 1});
            },
            err =>
                err.message == "invalid number for age: {\"age\":1}"
        );

        assert.throws(
            () => {
                model.set("age", false);
            },
            err =>
                err.message == "invalid number for age: false"
        );

        assert.throws(
            () => {
                model.set("age", true);
            },
            err =>
                err.message == "invalid number for age: true"
        );

        assert.throws(
            () => {
                model.set("age", /x/);
            },
            err =>
                err.message == "invalid number for age: /x/"
        );

        assert.throws(
            () => {
                model.set("age", -1 / 0);
            },
            err =>
                err.message == "invalid number for age: -Infinity"
        );

        assert.throws(
            () => {
                model.set("age", 1 / 0);
            },
            err =>
                err.message == "invalid number for age: Infinity"
        );

        assert.throws(
            () => {
                model.set("age", NaN);
            },
            err =>
                err.message == "invalid number for age: NaN"
        );

        assert.throws(
            () => {
                model.set("age", [0]);
            },
            err =>
                err.message == "invalid number for age: [0]"
        );


        let circularJSON = {};
        circularJSON.test = circularJSON;
        assert.throws(
            () => {
                model.set("age", circularJSON);
            },
            err =>
                err.message == "invalid number for age: [object Object]"
        );


        assert.strictEqual( model.data.age, -2000.123 );
    });

    it("prepare round", () => {
        class SomeModel extends Model {
            static structure() {
                return {
                    money: {
                        type: "number",
                        default: 1.1111,
                        round: 2
                    }
                };
            }
        }

        let model = new SomeModel();
        assert.strictEqual( model.data.money, 1.11 );

        model.set("money", 1.999);
        assert.strictEqual( model.data.money, 2 );
    });

    it("prepare floor", () => {
        class SomeModel extends Model {
            static structure() {
                return {
                    money: {
                        type: "number",
                        default: 1.1111,
                        floor: 2
                    }
                };
            }
        }

        let model = new SomeModel();
        assert.strictEqual( model.data.money, 1.11 );

        model.set("money", 1.999);
        assert.strictEqual( model.data.money, 1.99 );
    });

    it("prepare ceil", () => {
        class SomeModel extends Model {
            static structure() {
                return {
                    money: {
                        type: "number",
                        default: 1.1111,
                        ceil: 2
                    }
                };
            }
        }

        let model = new SomeModel();
        assert.strictEqual( model.data.money, 1.12 );

        model.set("money", 1.599);
        assert.strictEqual( model.data.money, 1.6 );
    });

    it("prepare zeroAsNull", () => {
        class SomeModel extends Model {
            static structure() {
                return {
                    money: {
                        type: "number",
                        default: 0,
                        round: 0,
                        zeroAsNull: true
                    }
                };
            }
        }

        let model = new SomeModel();
        assert.strictEqual( model.data.money, null );

        model.set("money", 1.1111);
        assert.strictEqual( model.data.money, 1 );

        model.set("money", 0.0001);
        assert.strictEqual( model.data.money, null );
    });

    it("prepare nullAsZero", () => {
        class SomeModel extends Model {
            static structure() {
                return {
                    money: {
                        type: "number",
                        nullAsZero: true
                    }
                };
            }
        }

        let model = new SomeModel();
        assert.strictEqual( model.data.money, 0 );

        model.set("money", 1);
        assert.strictEqual( model.data.money, 1 );

        model.set("money", null);
        assert.strictEqual( model.data.money, 0 );
    });

    it("redefine standard prepare number", () => {
        let callArgs = false;
        
        const NumberType = Model.getType("number");
        let originalPrepare = NumberType.prototype.prepare;

        NumberType.prototype.prepare = function(value, key, model) {
            callArgs = [value, key];
            return originalPrepare.call(this, value, key, model);
        };

        class SomeModel extends Model {
            static structure() {
                return {
                    age: "number"
                };
            }
        }

        let model = new SomeModel({
            age: "10"
        });

        assert.strictEqual( model.data.age, 10 );
        assert.deepEqual( callArgs, [
            "10",
            "age"
        ]);

        NumberType.prototype.prepare = originalPrepare;
    });

    it("invalid ceil in field description", () => {
        class SomeModel extends Model {
            static structure() {
                return {
                    money: {
                        type: "number",
                        ceil: "wrong"
                    }
                };
            }
        }

        assert.throws(
            () => {
                new SomeModel();
            },
            err =>
                err.message == "money: invalid ceil: \"wrong\""
        );
    });

    it("invalid floor in field description", () => {
        class SomeModel extends Model {
            static structure() {
                return {
                    money: {
                        type: "number",
                        floor: "wrong"
                    }
                };
            }
        }

        assert.throws(
            () => {
                new SomeModel();
            },
            err =>
                err.message == "money: invalid floor: \"wrong\""
        );
    });

    it("invalid round in field description", () => {
        class SomeModel extends Model {
            static structure() {
                return {
                    money: {
                        type: "number",
                        round: "wrong"
                    }
                };
            }
        }

        assert.throws(
            () => {
                new SomeModel();
            },
            err =>
                err.message == "money: invalid round: \"wrong\""
        );
    });
    
});
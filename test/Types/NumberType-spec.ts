
import {Model} from "../../lib/index";
import assert from "assert";

describe("NumberType", () => {
    
    it("prepare number", () => {
        interface ISomeData {
            age: number | string;
        }

        class SomeModel extends Model<ISomeData> {
            public static data() {
                return {
                    age: {
                        type: "number",
                        default: "0"
                    }
                };
            }
        }
        let model: SomeModel;

        model = new SomeModel();
        assert.strictEqual( model.data.age, 0 );

        model = new SomeModel({
            age: "1"
        });
        assert.strictEqual( model.data.age, 1 );
        
        model.set({age: "2"});
        assert.strictEqual( model.data.age, 2 );

        model.set({age: null});
        assert.strictEqual( model.data.age, null );

        model.set({age: "-2000.123"});
        assert.strictEqual( model.data.age, -2000.123 );

        assert.throws(
            () => {
                model.set({age: "wrong"});
            },
            (err) =>
                err.message === "invalid number for age: \"wrong\""
        );

        assert.throws(
            () => {
                const anyModel = model as any;
                anyModel.set({age: {}});
            },
            (err) =>
                err.message === "invalid number for age: {}"
        );

        assert.throws(
            () => {
                const anyModel = model as any;
                anyModel.set({age: {age: 1}});
            },
            (err) =>
                err.message === "invalid number for age: {\"age\":1}"
        );

        assert.throws(
            () => {
                const anyModel = model as any;
                anyModel.set({age: false});
            },
            (err) =>
                err.message === "invalid number for age: false"
        );

        assert.throws(
            () => {
                const anyModel = model as any;
                anyModel.set({age: true});
            },
            (err) =>
                err.message === "invalid number for age: true"
        );

        assert.throws(
            () => {
                const anyModel = model as any;
                anyModel.set({age: /x/});
            },
            (err) =>
                err.message === "invalid number for age: /x/"
        );

        assert.throws(
            () => {
                model.set({age: -1 / 0});
            },
            (err) =>
                err.message === "invalid number for age: -Infinity"
        );

        assert.throws(
            () => {
                model.set({age: 1 / 0});
            },
            (err) =>
                err.message === "invalid number for age: Infinity"
        );

        assert.throws(
            () => {
                model.set({age: NaN});
            },
            (err) =>
                err.message === "invalid number for age: NaN"
        );

        assert.throws(
            () => {
                const anyModel = model as any;
                anyModel.set({age: [0]});
            },
            (err) =>
                err.message === "invalid number for age: [0]"
        );


        const circularJSON: any = {};
        circularJSON.test = circularJSON;
        assert.throws(
            () => {
                model.set({age: circularJSON});
            },
            (err) =>
                err.message === "invalid number for age: [object Object]"
        );


        assert.strictEqual( model.data.age, -2000.123 );
    });

    it("prepare round", () => {
        interface ISomeData {
            money: number;
        }

        class SomeModel extends Model<ISomeData> {
            public static data() {
                return {
                    money: {
                        type: "number",
                        default: 1.1111,
                        round: 2
                    }
                };
            }
        }

        const model = new SomeModel();
        assert.strictEqual( model.data.money, 1.11 );

        model.set({money: 1.999});
        assert.strictEqual( model.data.money, 2 );
    });

    it("prepare floor", () => {
        interface ISomeData {
            money: number;
        }

        class SomeModel extends Model<ISomeData> {
            public static data() {
                return {
                    money: {
                        type: "number",
                        default: 1.1111,
                        floor: 2
                    }
                };
            }
        }

        const model = new SomeModel();
        assert.strictEqual( model.data.money, 1.11 );

        model.set({money: 1.999});
        assert.strictEqual( model.data.money, 1.99 );
    });

    it("prepare ceil", () => {
        interface ISomeData {
            money: number;
        }

        class SomeModel extends Model<ISomeData> {
            public static data() {
                return {
                    money: {
                        type: "number",
                        default: 1.1111,
                        ceil: 2
                    }
                };
            }
        }

        const model = new SomeModel();
        assert.strictEqual( model.data.money, 1.12 );

        model.set({money: 1.599});
        assert.strictEqual( model.data.money, 1.6 );

        model.set({money: 1.12});
        assert.strictEqual( model.data.money, 1.12 );

        model.set({money: 1.13});
        assert.strictEqual( model.data.money, 1.13 );

        model.set({money: 18014398509481984});
        assert.strictEqual( model.data.money, 18014398509481984 );
    });

    it("prepare zeroAsNull", () => {
        interface ISomeData {
            money: number;
        }

        class SomeModel extends Model<ISomeData> {
            public static data() {
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

        const model = new SomeModel();
        assert.strictEqual( model.data.money, null );

        model.set({money: 1.1111});
        assert.strictEqual( model.data.money, 1 );

        model.set({money: 0.0001});
        assert.strictEqual( model.data.money, null );
    });

    it("prepare nullAsZero", () => {
        interface ISomeData {
            money: number;
        }

        class SomeModel extends Model<ISomeData> {
            public static data() {
                return {
                    money: {
                        type: "number",
                        nullAsZero: true
                    }
                };
            }
        }

        const model = new SomeModel();
        assert.strictEqual( model.data.money, 0 );

        model.set({money: 1});
        assert.strictEqual( model.data.money, 1 );

        model.set({money: null});
        assert.strictEqual( model.data.money, 0 );
    });

    it("redefine standard prepare number", () => {
        let callArgs: any = false;
        
        const NumberType = Model.getType("number");
        const originalPrepare = NumberType.prototype.prepare;

        NumberType.prototype.prepare = function(value, key, anyModel) {
            callArgs = [value, key];
            return originalPrepare.call(this, value, key, anyModel);
        };

        interface ISomeData {
            age: number | string;
        }

        class SomeModel extends Model<ISomeData> {
            public static data() {
                return {
                    age: "number"
                };
            }
        }

        const model = new SomeModel({
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
        interface ISomeData {
            money: number;
        }

        class SomeModel extends Model<ISomeData> {
            public static data() {
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
                const model = new SomeModel();
            },
            (err) =>
                err.message === "money: invalid ceil: \"wrong\""
        );
    });

    it("invalid floor in field description", () => {
        interface ISomeData {
            money: number;
        }

        class SomeModel extends Model<ISomeData> {
            public static data() {
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
                const model = new SomeModel();
            },
            (err) =>
                err.message === "money: invalid floor: \"wrong\""
        );
    });

    it("invalid round in field description", () => {
        interface ISomeData {
            money: number;
        }

        class SomeModel extends Model<ISomeData> {
            public static data() {
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
                const model = new SomeModel();
            },
            (err) =>
                err.message === "money: invalid round: \"wrong\""
        );
    });
    
    it("equal numbers", () => {
        const pairs: any[][] = [
            [null, null, true],
            [null, 0, false],
            [0, null, false],
            [-0, +0, true],
            [-10, -10, true],
            [10.12, 10.12, true]
        ];

        interface ISomeData {
            numb: number;
        }

        pairs.forEach((pair) => {
            class TestModel extends Model<ISomeData> {
                public static data() {
                    return {
                        numb: "number"
                    };
                }
            }

            const model1 = new TestModel({
                numb: pair[0]
            });

            const model2 = new TestModel({
                numb: pair[1]
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
    
    it("conflicting parameters: ceil and round", () => {
        interface ISomeData {
            money: number;
        }

        class SomeModel extends Model<ISomeData> {
            public static data() {
                return {
                    money: {
                        type: "number",
                        ceil: 0,
                        round: 0
                    }
                };
            }
        }

        assert.throws(
            () => {
                const model = new SomeModel();
            },
            (err) =>
                err.message === "money: conflicting parameters: use only round or only ceil"
        );
    });

    it("conflicting parameters: floor and ceil", () => {
        interface ISomeData {
            money: number;
        }

        class SomeModel extends Model<ISomeData> {
            public static data() {
                return {
                    money: {
                        type: "number",
                        ceil: 0,
                        floor: 0
                    }
                };
            }
        }

        assert.throws(
            () => {
                const model = new SomeModel();
            },
            (err) =>
                err.message === "money: conflicting parameters: use only floor or only ceil"
        );
    });

    it("conflicting parameters: floor and round", () => {
        interface ISomeData {
            money: number;
        }

        class SomeModel extends Model<ISomeData> {
            public static data() {
                return {
                    money: {
                        type: "number",
                        round: 0,
                        floor: 0
                    }
                };
            }
        }

        assert.throws(
            () => {
                const model = new SomeModel();
            },
            (err) =>
                err.message === "money: conflicting parameters: use only floor or only round"
        );
    });

    it("conflicting parameters: nullAsZero and zeroAsNull", () => {
        interface ISomeData {
            age: number;
        }

        class SomeModel extends Model<ISomeData> {
            public static data() {
                return {
                    age: {
                        type: "number",
                        nullAsZero: true,
                        zeroAsNull: true
                    }
                };
            }
        }

        assert.throws(
            () => {
                const model = new SomeModel();
            },
            (err) =>
                err.message === "age: conflicting parameters: use only nullAsZero or only zeroAsNull"
        );
    });

});

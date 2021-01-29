
import {Model, Types} from "../../lib/index";
import assert from "assert";

describe("NumberType", () => {
    
    it("prepare number", () => {
        class SomeModel extends Model<SomeModel> {
            structure() {
                return {
                    age: Types.Number({
                        default: "0" as any
                    })
                };
            }
        }
        let model!: SomeModel;

        model = new SomeModel();
        assert.strictEqual( model.row.age, 0 );

        model = new SomeModel({
            age: "1" as any
        });
        assert.strictEqual( model.row.age, 1 );
        
        model.set({age: "2" as any});
        assert.strictEqual( model.row.age, 2 );

        model.set({age: null as any});
        assert.strictEqual( model.row.age, null );

        model.set({age: "-2000.123" as any});
        assert.strictEqual( model.row.age, -2000.123 );

        assert.throws(
            () => {
                model.set({age: "wrong" as any});
            },
            (err: Error) =>
                err.message === "invalid number for age: \"wrong\""
        );

        assert.throws(
            () => {
                const anyModel = model as any;
                anyModel.set({age: {}});
            },
            (err: Error) =>
                err.message === "invalid number for age: {}"
        );

        assert.throws(
            () => {
                const anyModel = model as any;
                anyModel.set({age: {age: 1}});
            },
            (err: Error) =>
                err.message === "invalid number for age: {\"age\":1}"
        );

        assert.throws(
            () => {
                const anyModel = model as any;
                anyModel.set({age: false});
            },
            (err: Error) =>
                err.message === "invalid number for age: false"
        );

        assert.throws(
            () => {
                const anyModel = model as any;
                anyModel.set({age: true});
            },
            (err: Error) =>
                err.message === "invalid number for age: true"
        );

        assert.throws(
            () => {
                const anyModel = model as any;
                anyModel.set({age: /x/});
            },
            (err: Error) =>
                err.message === "invalid number for age: /x/"
        );

        const date = new Date();
        const isoDate = date.toISOString();
        assert.throws(
            () => {
                const anyModel = model as any;
                anyModel.set({age: date});
            },
            (err: Error) =>
                err.message === "invalid number for age: \"" + isoDate + "\""
        );

        assert.throws(
            () => {
                model.set({age: -1 / 0});
            },
            (err: Error) =>
                err.message === "invalid number for age: -Infinity"
        );

        assert.throws(
            () => {
                model.set({age: 1 / 0});
            },
            (err: Error) =>
                err.message === "invalid number for age: Infinity"
        );

        assert.throws(
            () => {
                model.set({age: NaN});
            },
            (err: Error) =>
                err.message === "invalid number for age: NaN"
        );

        assert.throws(
            () => {
                const anyModel = model as any;
                anyModel.set({age: [0]});
            },
            (err: Error) =>
                err.message === "invalid number for age: [0]"
        );


        const circularJSON: any = {};
        circularJSON.test = circularJSON;
        assert.throws(
            () => {
                model.set({age: circularJSON});
            },
            (err: Error) =>
                err.message === "invalid number for age: [object Object]"
        );


        assert.strictEqual( model.row.age, -2000.123 );
    });

    it("prepare round", () => {

        class SomeModel extends Model<SomeModel> {
            structure() {
                return {
                    money: Types.Number({
                        default: 1.1111,
                        round: 2
                    })
                };
            }
        }

        const model = new SomeModel();
        assert.strictEqual( model.row.money, 1.11 );

        model.set({money: 1.999});
        assert.strictEqual( model.row.money, 2 );
    });

    it("prepare floor", () => {

        class SomeModel extends Model<SomeModel> {
            structure() {
                return {
                    money: Types.Number({
                        default: 1.1111,
                        floor: 2
                    })
                };
            }
        }

        const model = new SomeModel();
        assert.strictEqual( model.row.money, 1.11 );

        model.set({money: 1.999});
        assert.strictEqual( model.row.money, 1.99 );
    });

    it("prepare ceil", () => {

        class SomeModel extends Model<SomeModel> {
            structure() {
                return {
                    money: Types.Number({
                        default: 1.1111,
                        ceil: 2
                    })
                };
            }
        }

        const model = new SomeModel();
        assert.strictEqual( model.row.money, 1.12 );

        model.set({money: 1.599});
        assert.strictEqual( model.row.money, 1.6 );

        model.set({money: 1.12});
        assert.strictEqual( model.row.money, 1.12 );

        model.set({money: 1.13});
        assert.strictEqual( model.row.money, 1.13 );

        model.set({money: 18014398509481984});
        assert.strictEqual( model.row.money, 18014398509481984 );
    });

    it("prepare zeroAsNull", () => {

        class SomeModel extends Model<SomeModel> {
            structure() {
                return {
                    money: Types.Number({
                        default: 0,
                        round: 0,
                        zeroAsNull: true
                    })
                };
            }
        }

        const model = new SomeModel();
        assert.strictEqual( model.row.money, null );

        model.set({money: 1.1111});
        assert.strictEqual( model.row.money, 1 );

        model.set({money: 0.0001});
        assert.strictEqual( model.row.money, null );
    });

    it("prepare nullAsZero", () => {

        class SomeModel extends Model<SomeModel> {
            structure() {
                return {
                    money: Types.Number({
                        nullAsZero: true
                    })
                };
            }
        }

        const model = new SomeModel();
        assert.strictEqual( model.row.money, 0 );

        model.set({money: 1});
        assert.strictEqual( model.row.money, 1 );

        model.set({money: null as any});
        assert.strictEqual( model.row.money, 0 );
    });

    it("invalid ceil in field description", () => {

        class SomeModel extends Model<SomeModel> {
            structure() {
                return {
                    money: Types.Number({
                        ceil: "wrong" as any
                    })
                };
            }
        }

        assert.throws(
            () => {
                const model = new SomeModel();
            },
            (err: Error) =>
                err.message === "money: invalid ceil: \"wrong\""
        );
    });

    it("invalid floor in field description", () => {

        class SomeModel extends Model<SomeModel> {
            structure() {
                return {
                    money: Types.Number({
                        floor: "wrong" as any
                    })
                };
            }
        }

        assert.throws(
            () => {
                const model = new SomeModel();
            },
            (err: Error) =>
                err.message === "money: invalid floor: \"wrong\""
        );
    });

    it("invalid round in field description", () => {

        class SomeModel extends Model<SomeModel> {
            structure() {
                return {
                    money: Types.Number({
                        round: "wrong" as any
                    })
                };
            }
        }

        assert.throws(
            () => {
                const model = new SomeModel();
            },
            (err: Error) =>
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

        pairs.forEach((pair) => {
            class TestModel extends Model<TestModel> {
                structure() {
                    return {
                        numb: Types.Number
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

        class SomeModel extends Model<SomeModel> {
            structure() {
                return {
                    money: Types.Number({
                        ceil: 0,
                        round: 0
                    })
                };
            }
        }

        assert.throws(
            () => {
                const model = new SomeModel();
            },
            (err: Error) =>
                err.message === "money: conflicting parameters: use only round or only ceil or only floor"
        );
    });

    it("conflicting parameters: floor and ceil", () => {

        class SomeModel extends Model<SomeModel> {
            structure() {
                return {
                    money: Types.Number({
                        ceil: 0,
                        floor: 0
                    })
                };
            }
        }

        assert.throws(
            () => {
                const model = new SomeModel();
            },
            (err: Error) =>
                err.message === "money: conflicting parameters: use only round or only ceil or only floor"
        );
    });

    it("conflicting parameters: floor and round", () => {

        class SomeModel extends Model<SomeModel> {
            structure() {
                return {
                    money: Types.Number({
                        round: 0,
                        floor: 0
                    })
                };
            }
        }

        assert.throws(
            () => {
                const model = new SomeModel();
            },
            (err: Error) =>
                err.message === "money: conflicting parameters: use only round or only ceil or only floor"
        );
    });

    it("conflicting parameters: nullAsZero and zeroAsNull", () => {

        class SomeModel extends Model<SomeModel> {
            structure() {
                return {
                    age: Types.Number({
                        nullAsZero: true,
                        zeroAsNull: true
                    })
                };
            }
        }

        assert.throws(
            () => {
                const model = new SomeModel();
            },
            (err: Error) =>
                err.message === "age: conflicting parameters: use only nullAsZero or only zeroAsNull"
        );
    });

});

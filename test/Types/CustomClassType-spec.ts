
import {Model} from "../../lib/index";
import assert from "assert";
import {eol} from "../../lib/utils";

describe("CustomClassType", () => {
    
    it("custom class (not Model) property", () => {
        class CustomClass {
            params: any;

            constructor(params?) {
                this.params = params;
            }
        }

        interface ISomeData {
            some: CustomClass;
        }

        class SomeModel extends Model<ISomeData> {
            static data() {
                return {
                    some: CustomClass
                };
            }
        }

        let model = new SomeModel();

        assert.ok(
            model.get("some") === null
        );

        assert.throws(
            () => {
                const AnyModel = SomeModel as any;
                const someModel = new AnyModel({
                    some: false
                });
            },
            (err) =>
                err.message === "invalid CustomClass for some: false"
        );

        const value = new CustomClass();
        model = new SomeModel({
            some: value
        });

        assert.ok( model.get("some") === value );
    });

    it("CustomClass.toJSON(), just copy by reference", () => {
        class CustomClass {}

        interface ISomeData {
            some: CustomClass;
        }

        class SomeModel extends Model<ISomeData> {
            static data() {
                return {
                    some: CustomClass
                };
            }
        }

        const value = new CustomClass();
        const model = new SomeModel({
            some: value
        });

        assert.deepEqual(
            model.toJSON(),
            {
                some: value
            }
        );

        assert.ok( model.toJSON().some === value );
    });


    it("CustomClass.toJSON(), if CustomClass has method toJSON", () => {
        class CustomClass {
            toJSON() {
                return {nice: true};
            }
        }

        interface ISomeData {
            some: CustomClass;
        }

        class SomeModel extends Model<ISomeData> {
            static data() {
                return {
                    some: CustomClass
                };
            }
        }

        const value = new CustomClass();
        const model = new SomeModel({
            some: value
        });

        assert.deepEqual(
            model.toJSON(),
            {
                some: {
                    nice: true
                }
            }
        );
    });

    it("CustomClass.clone(), just clone by reference", () => {
        class CustomClass {}

        interface ISomeData {
            some: CustomClass;
        }

        class SomeModel extends Model<ISomeData> {
            static data() {
                return {
                    some: CustomClass
                };
            }
        }

        const value = new CustomClass();
        const model = new SomeModel({
            some: value
        });

        const clone = model.clone();
        
        assert.ok( clone.data.some === value );
    });
    
    it("CustomClass.clone(), if CustomClass has method clone", () => {
        class CustomClass {
            nice?: boolean;

            clone() {
                const cloneCustomClass = new CustomClass();

                cloneCustomClass.nice = true;

                return cloneCustomClass;
            }
        }

        interface ISomeData {
            some: CustomClass;
        }

        class SomeModel extends Model<ISomeData> {
            static data() {
                return {
                    some: CustomClass
                };
            }
        }

        const value = new CustomClass();
        const model = new SomeModel({
            some: value
        });

        const clone = model.clone();
        
        assert.strictEqual(
            clone.get("some").nice,
            true
        );
    });

    it("array of CustomClass", () => {
        class MyClass {}

        interface ISomeData {
            some: MyClass;
        }

        class SomeModel extends Model<ISomeData> {
            static data() {
                return {
                    arr: [MyClass]
                };
            }
        }

        assert.throws(
            () => {
                const AnyModel = SomeModel as any;
                const somModel = new AnyModel({
                    arr: [false]
                });
            },
            (err) =>
                err.message === `invalid array[MyClass] for arr: [false],${eol} invalid MyClass for 0: false`
        );
    });

    
    it("equal CustomClass", () => {
        class CustomClass {}

        const obj1 = new CustomClass();
        const obj2 = new CustomClass();

        const pairs: any[][] = [
            [null, null, true],
            [null, obj1, false],
            [obj1, obj1, true],
            [obj1, obj2, false]
        ];

        interface ISomeData {
            custom: CustomClass;
        }

        pairs.forEach((pair) => {
            class TestModel extends Model<ISomeData> {
                static data() {
                    return {
                        custom: CustomClass
                    };
                }
            }

            const model1 = new TestModel({
                custom: pair[0]
            });

            const model2 = new TestModel({
                custom: pair[1]
            });

            assert.strictEqual(
                model1.equal( model2 ),
                pair[2],
                JSON.stringify(pair)
            );

            assert.strictEqual(
                model2.equal( model1 ),
                pair[2],
                JSON.stringify(pair)
            );
        });
    });
});

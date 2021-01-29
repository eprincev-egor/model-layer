
import {Model, Types} from "../../lib/index";
import assert from "assert";

describe("CustomClassType", () => {
    
    it("prepare CustomClassType", () => {

        class DBDriver {
            load(): string {
                return "loaded";
            }
        }

        class DBState extends Model<DBState> {
            structure() {
                return {
                    driver: Types.CustomClass({
                        constructor: DBDriver
                    })
                };
            }
        }
        
        const driver = new DBDriver();
        const model = new DBState({
            driver
        });

        assert.ok( model.get("driver") === driver );

        assert.strictEqual(model.get("driver")!.load(), "loaded");


        const anyModel = model as any;
        assert.throws(
            () => {
                anyModel.set({driver: {}});
            },
            (err: Error) =>
                err.message === "invalid value for DBDriver, field driver: {}"
        );
    });

    it("CustomClass toJSON error, if no custom toJSON method", () => {
        class DBDriver {}

        class DBState extends Model<DBState> {
            structure() {
                return {
                    driver: Types.CustomClass({
                        constructor: DBDriver
                    })
                };
            }
        }

        const driver = new DBDriver();
        const model = new DBState({
            driver
        });

        assert.throws(
            () => {
                model.toJSON();
            },
            (err: Error) =>
                err.message === "cannot convert [object: DBDriver] to json, need toJSON method for this field"
        );
    });


    it("CustomClass, custom toJSON", () => {
        class DBDriver {}

        class DBState extends Model<DBState> {
            structure() {
                return {
                    driver: Types.CustomClass({
                        constructor: DBDriver,
                        toJSON: () => ({json: true})
                    })
                };
            }
        }

        const driver = new DBDriver();
        const model = new DBState({
            driver
        });

        assert.deepStrictEqual(model.toJSON(), {
            driver: {json: true}
        });
    });

    it("CustomClass, custom clone", () => {
        class DBDriver {}

        class DBState extends Model<DBState> {
            structure() {
                return {
                    driver: Types.CustomClass({
                        constructor: DBDriver,
                        clone: () => new DBDriver()
                    })
                };
            }
        }

        const driver = new DBDriver();
        const model = new DBState({
            driver
        });
        const clone = model.clone();

        assert.ok(clone.get("driver") instanceof DBDriver);
        assert.ok(clone.get("driver") !== driver);
    });

    it("CustomClass clone error, if no custom clone method", () => {
        class DBDriver {}

        class DBState extends Model<DBState> {
            structure() {
                return {
                    driver: Types.CustomClass({
                        constructor: DBDriver
                    })
                };
            }
        }

        const driver = new DBDriver();
        const model = new DBState({
            driver
        });

        assert.throws(
            () => {
                model.clone();
            },
            (err: Error) =>
                err.message === "cannot clone [object: DBDriver], need clone method for this field"
        );
    });

    it("CustomClass, custom equal", () => {
        class DBDriver {}

        class DBState extends Model<DBState> {
            structure() {
                return {
                    driver: Types.CustomClass({
                        constructor: DBDriver,
                        equal: () => true
                    })
                };
            }
        }

        const model1 = new DBState({
            driver: new DBDriver()
        });
        const model2 = new DBState({
            driver: new DBDriver()
        });

        assert.ok( model1.equal(model2) );
        assert.ok( model2.equal(model1) );
    });

    it("CustomClass equal error, if no custom equal method", () => {
        class DBDriver {}

        class DBState extends Model<DBState> {
            structure() {
                return {
                    driver: Types.CustomClass({
                        constructor: DBDriver
                    })
                };
            }
        }

        const model1 = new DBState({
            driver: new DBDriver()
        });
        const model2 = new DBState({
            driver: new DBDriver()
        });

        assert.throws(
            () => {
                model1.equal(model2);
            },
            (err: Error) =>
                err.message === "cannot equal [object: DBDriver], need equal method for this field"
        );
    });

    it("array of CustomClass, try compare models by custom equal method", () => {
        class Element {
            html: string;

            constructor(html: string) {
                this.html = html;
            }
        }

        class SomeModel extends Model<SomeModel> {
            structure() {
                return {
                    elements: Types.Array({
                        element: Types.CustomClass({
                            constructor: Element,
                            equal: (elemA: Element, elemB: Element) => 
                                elemA.html === elemB.html
                        })
                    })
                };
            }
        }

        const elem1 = new Element("<elem1/>");
        const elem2 = new Element("<elem2/>");

        const model1 = new SomeModel({
            elements: [
                elem1,
                elem2
            ]
        });

        const model2 = new SomeModel({
            elements: [
                elem2,
                elem1
            ]
        });


        assert.strictEqual( model1.equal(model2), false );
    });

});

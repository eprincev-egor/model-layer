
import {Model, Types} from "../../lib/index";
import assert from "assert";


describe("Model events", () => {
    
    it("listen changes", () => {

        class SomeModel extends Model<SomeModel> {
            structure() {
                return {
                    prop: Types.String
                };
            }
        }

        const model = new SomeModel();

        let event;
        let counter = 0;
        model.on("change", (e) => {
            counter++;
            event = e;
        });

        model.set({prop: "some"});

        assert.equal(counter, 1);
        assert.deepEqual(event, {
            prev: {
                prop: null
            },
            changes: {
                prop: "some"
            }
        });
    });

    it("no changes - no event", () => {
        class SomeModel extends Model<SomeModel> {
            structure() {
                return {
                    prop: Types.String
                };
            }
        }

        const model = new SomeModel();

        const throwError = () => {
            throw new Error("unexpected call");
        };
        try {
            throwError();
        } catch (err) {
            assert.ok( err );
        }

        model.on("change", throwError);

        model.set({prop: null as any});
    });

    it("listen change:prop", () => {
        class SomeModel extends Model<SomeModel> {
            structure() {
                return {
                    prop: Types.String
                };
            }
        }

        const model = new SomeModel();

        let event;
        let counter = 0;
        model.on("change", "prop", (e) => {
            counter++;
            event = e;
        });

        model.set({prop: "some"});

        assert.equal(counter, 1);
        assert.deepEqual(event, {
            prev: {
                prop: null
            },
            changes: {
                prop: "some"
            }
        });
    });


    it("listen change:unknownProp", () => {
        class SomeModel extends Model<SomeModel> {
            structure() {
                return {
                    prop: Types.String
                };
            }
        }

        const model = new SomeModel();
        const handler = () => false;
        handler(); // for coverage

        assert.throws(
            () => {
                model.on("change", "unknownProp" as any, handler);
            }, (err: Error) =>
                err.message === "unknown property: unknownProp"
        );

    });

    it("custom options for stop recursion, listen 'change'", () => {
        class SomeModel extends Model<SomeModel> {
            structure() {
                return {
                    prop: Types.String
                };
            }
        }

        const model1 = new SomeModel();
        const model2 = new SomeModel();

        model1.on("change", (event, options) => {
            if ( options.stopSync ) {
                return;
            }

            model2.set(event.changes, {
                stopSync: true
            });
        });

        model2.on("change", (event, options) => {
            if ( options.stopSync ) {
                return;
            }

            model1.set(event.changes, {
                stopSync: true
            });
        });

        model1.set({
            prop: "nice"
        });
        assert.strictEqual(model1.row.prop, "nice");
        assert.strictEqual(model2.row.prop, "nice");

        model2.set({
            prop: "good"
        });
        assert.strictEqual(model1.row.prop, "good");
        assert.strictEqual(model2.row.prop, "good");
    });

    it("custom options for stop recursion, listen ('change', prop)", () => {
        class SomeModel extends Model<SomeModel> {
            structure() {
                return {
                    prop: Types.String
                };
            }
        }

        const model1 = new SomeModel();
        const model2 = new SomeModel();

        model1.on("change", "prop", (event, options) => {
            if ( options.stopSync ) {
                return;
            }

            model2.set(event.changes, {
                stopSync: true
            });
        });

        model2.on("change", "prop", (event, options) => {
            if ( options.stopSync ) {
                return;
            }

            model1.set(event.changes, {
                stopSync: true
            });
        });

        model1.set({
            prop: "nice"
        });
        assert.strictEqual(model1.row.prop, "nice");
        assert.strictEqual(model2.row.prop, "nice");

        model2.set({
            prop: "good"
        });
        assert.strictEqual(model1.row.prop, "good");
        assert.strictEqual(model2.row.prop, "good");
    });

});

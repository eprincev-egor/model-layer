
import {Model} from "../../lib/index";
import assert from "assert";

interface ISomeData {
    prop: string;
}

describe("Model events", () => {
    
    it("listen changes", () => {

        class SomeModel extends Model<ISomeData> {
            public static structure() {
                return {
                    prop: "string"
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
        class SomeModel extends Model<ISomeData> {
            public static structure() {
                return {
                    prop: "string"
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

        model.set({prop: null});
    });

    it("listen change:prop", () => {
        class SomeModel extends Model<ISomeData> {
            public static structure() {
                return {
                    prop: "string"
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


});

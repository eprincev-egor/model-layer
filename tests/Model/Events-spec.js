"use strict";

const Model = require("../../lib/Model");
const assert = require("assert");

describe("Model events", () => {
    
    it("listen changes", () => {
        class SomeModel extends Model {
            static structure() {
                return {
                    prop: "string"
                };
            }
        }

        let model = new SomeModel();

        let event;
        let counter = 0;
        model.on("change", (e) => {
            counter++;
            event = e;
        });

        model.set("prop", "some");

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
        class SomeModel extends Model {
            static structure() {
                return {
                    prop: "string"
                };
            }
        }

        let model = new SomeModel();

        let counter = 0;
        model.on("change", () => {
            counter++;
        });

        model.set("prop", null);

        assert.equal(counter, 0);
    });

    it("listen change:prop", () => {
        class SomeModel extends Model {
            static structure() {
                return {
                    prop: "string"
                };
            }
        }

        let model = new SomeModel();

        let event;
        let counter = 0;
        model.on("change:prop", (e) => {
            counter++;
            event = e;
        });

        model.set("prop", "some");

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
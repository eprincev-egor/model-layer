"use strict";

const Model = require("../../lib/Model");
const assert = require("assert");

describe("Model array property", () => {
    
    it("custom class (not Model) property", () => {
        class CustomClass {
            constructor(params) {
                this.params = params;
            }
        }

        class SomeModel extends Model {
            static structure() {
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
                new SomeModel({
                    some: false
                });
            },
            err =>
                err.message == "invalid CustomClass for some: false"
        );

        let value = new CustomClass();
        model = new SomeModel({
            some: value
        });

        assert.ok( model.get("some") === value );
    });

    it("CustomClass.toJSON()", () => {
        class CustomClass {
            constructor() {
            }

            toJSON() {
                return {nice: true};
            }
        }

        class SomeModel extends Model {
            static structure() {
                return {
                    some: CustomClass
                };
            }
        }

        let value = new CustomClass();
        let model = new SomeModel({
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

    it("CustomClass.clone()", () => {
        class CustomClass {
            constructor() {
            }

            clone() {
                let clone = new CustomClass();

                clone.nice = true;

                return clone;
            }
        }

        class SomeModel extends Model {
            static structure() {
                return {
                    some: CustomClass
                };
            }
        }

        let value = new CustomClass();
        let model = new SomeModel({
            some: value
        });

        let clone = model.clone();
        
        assert.strictEqual(
            clone.get("some").nice,
            true
        );
    });

});
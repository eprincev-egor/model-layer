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

});
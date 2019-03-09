"use strict";

const {Model} = require("../../lib/index");
const assert = require("assert");

describe("CustomClassType", () => {
    
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

    it("CustomClass.toJSON(), just copy by reference", () => {
        class CustomClass {}

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
                some: value
            }
        );

        assert.ok( model.toJSON().some == value );
    });


    it("CustomClass.toJSON(), if CustomClass has method toJSON", () => {
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

    it("CustomClass.clone(), just clone by reference", () => {
        class CustomClass {}

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
        
        assert.ok( clone.data.some == value );
    });
    
    it("CustomClass.clone(), if CustomClass has method clone", () => {
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

    it("array of CustomClass", () => {
        class MyClass {}

        class SomeModel extends Model {
            static structure() {
                return {
                    arr: [MyClass]
                };
            }
        }

        assert.throws(
            () => {
                new SomeModel({
                    arr: [false]
                });
            },
            err =>
                err.message == "invalid array[MyClass] for arr: [false],\n invalid MyClass for 0: false"
        );
    });

});
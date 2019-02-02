"use strict";

const Model = require("../../lib/Model");
const assert = require("assert");

describe("Model array property", () => {
    
    it("array of numbers", () => {
        class CompanyModel extends Model {
            static structure() {
                return {
                    name: "string",
                    managersIds: ["number"]
                };
            }
        }

        try {
            new CompanyModel({
                managersIds: false
            });

            throw new Error("expected error");
        } catch(err) {
            assert.equal(err.message, "invalid array[number] for managersIds: false");
        }

        try {
            new CompanyModel({
                managersIds: true
            });

            throw new Error("expected error");
        } catch(err) {
            assert.equal(err.message, "invalid array[number] for managersIds: true");
        }

        try {
            new CompanyModel({
                managersIds: {}
            });

            throw new Error("expected error");
        } catch(err) {
            assert.equal(err.message, "invalid array[number] for managersIds: {}");
        }

        try {
            new CompanyModel({
                managersIds: "1,2"
            });

            throw new Error("expected error");
        } catch(err) {
            assert.equal(err.message, "invalid array[number] for managersIds: \"1,2\"");
        }

        try {
            new CompanyModel({
                managersIds: NaN
            });

            throw new Error("expected error");
        } catch(err) {
            assert.equal(err.message, "invalid array[number] for managersIds: NaN");
        }

        try {
            new CompanyModel({
                managersIds: /x/
            });

            throw new Error("expected error");
        } catch(err) {
            assert.equal(err.message, "invalid array[number] for managersIds: /x/");
        }

        try {
            new CompanyModel({
                managersIds: Infinity
            });

            throw new Error("expected error");
        } catch(err) {
            assert.equal(err.message, "invalid array[number] for managersIds: Infinity");
        }

        try {
            new CompanyModel({
                managersIds: -Infinity
            });

            throw new Error("expected error");
        } catch(err) {
            assert.equal(err.message, "invalid array[number] for managersIds: -Infinity");
        }

        try {
            new CompanyModel({
                managersIds: 0
            });

            throw new Error("expected error");
        } catch(err) {
            assert.equal(err.message, "invalid array[number] for managersIds: 0");
        }


        try {
            new CompanyModel({
                managersIds: [false]
            });

            throw new Error("expected error");
        } catch(err) {
            assert.equal(err.message, 
                "invalid array[number] for managersIds: [false],\n invalid number for 0: false"
            );
        }

        try {
            new CompanyModel({
                managersIds: ["1", "wrong"]
            });

            throw new Error("expected error");
        } catch(err) {
            assert.equal(err.message, 
                "invalid array[number] for managersIds: [\"1\",\"wrong\"],\n invalid number for 1: \"wrong\""
            );
        }


        let outsideArr = ["1", 2];
        let companyModel = new CompanyModel({
            managersIds: outsideArr
        });

        let managersIds = companyModel.get("managersIds");

        assert.deepEqual( managersIds, [1, 2] );
        assert.strictEqual( managersIds[0], 1 );

        assert.ok( outsideArr != managersIds );


        // array should be frozen
        try {
            managersIds[0] = 10;
        } catch(err) {
            assert.ok(
                /Cannot assign to read only property/.test(err.message)
            );
        }

        assert.strictEqual( managersIds[0], 1 );
    });

    
    it("emptyAsNull", () => {
        class SomeModel extends Model {
            static structure() {
                return {
                    colors: {
                        type: ["string"],
                        default: [],
                        emptyAsNull: true
                    }
                };
            }
        }

        let model = new SomeModel();
        assert.strictEqual( model.data.colors, null );

        model.set("colors", ["red"]);
        assert.deepEqual( model.data.colors, ["red"] );

        model.set("colors", []);
        assert.strictEqual( model.data.colors, null );
    });

    it("nullAsEmpty", () => {
        class SomeModel extends Model {
            static structure() {
                return {
                    colors: {
                        type: ["string"],
                        nullAsEmpty: true
                    }
                };
            }
        }

        let model = new SomeModel();
        assert.deepEqual( model.data.colors, [] );

        model.set("colors", ["red"]);
        assert.deepEqual( model.data.colors, ["red"] );

        model.set("colors", null);
        assert.deepEqual( model.data.colors, [] );
    });

});
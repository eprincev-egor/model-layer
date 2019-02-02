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


    it("array[boolean]", () => {
        class SomeModel extends Model {
            static structure() {
                return {
                    answers: ["boolean"]
                };
            }
        }

        try {
            new SomeModel({
                answers: [1, 0, false, true, "wrong"]
            });

            throw new Error("expected error");
        } catch(err) {
            assert.equal(err.message, 
                "invalid array[boolean] for answers: [1,0,false,true,\"wrong\"],\n invalid boolean for 4: \"wrong\""
            );
        }

        let model = new SomeModel({
            answers: [1, true]
        });

        let answers = model.data.answers;
        assert.deepEqual( answers, [true, true] );

        assert.strictEqual( answers[0], true );
        assert.strictEqual( answers[1], true );
    });

    it("array[date]", () => {
        class SomeModel extends Model {
            static structure() {
                return {
                    pays: ["date"]
                };
            }
        }

        try {
            new SomeModel({
                pays: ["wrong"]
            });

            throw new Error("expected error");
        } catch(err) {
            assert.equal(err.message, 
                "invalid array[date] for pays: [\"wrong\"],\n invalid date for 0: \"wrong\""
            );
        }

        let now = Date.now();
        let model = new SomeModel({
            pays: [now]
        });

        let pays = model.data.pays;

        assert.strictEqual( +pays[0], now );
        assert.ok( pays[0] instanceof Date );
    });

    it("array[ChildModel]", () => {
        class UserModel extends Model {
            static structure() {
                return {
                    name: {
                        type: "string",
                        trim: true
                    }
                };
            }
        }

        class CompanyModel extends Model {
            static structure() {
                return {
                    managers: [UserModel]
                };
            }
        }

        try {
            new CompanyModel({
                managers: [false]
            });

            throw new Error("expected error");
        } catch(err) {
            assert.equal(err.message, 
                "invalid array[UserModel] for managers: [false],\n invalid UserModel for 0: false"
            );
        }

        let companyModel = new CompanyModel({
            managers: [{
                name: " Bob "
            }]
        });

        let managers = companyModel.data.managers;
        assert.ok( managers[0] instanceof UserModel );
        assert.equal( managers[0].get("name"), "Bob" );
    });

    it("array[string]", () => {
        class SomeModel extends Model {
            static structure() {
                return {
                    colors: [{
                        type: "string",
                        upper: true
                    }],
                    names: {
                        type: "array",
                        element: {
                            type: "string",
                            trim: true
                        }
                    }
                };
            }
        }

        try {
            new SomeModel({
                names: [false]
            });

            throw new Error("expected error");
        } catch(err) {
            assert.equal(err.message,
                "invalid array[string] for names: [false],\n invalid string for 0: false"
            );
        }

        let model = new SomeModel({
            colors: ["red"],
            names: [" Bob "]
        });

        assert.deepEqual(model.data, {
            colors: ["RED"],
            names: ["Bob"]
        });
    });

});
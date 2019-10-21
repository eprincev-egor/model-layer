"use strict";

const {Model} = require("../../lib/index");
const assert = require("assert");

describe("Model primary field", () => {
    
    it("primary key cannot be reserved word", () => {
        
        const RESERVED_KEYS = [
            // reserved Model properties
            "data",
            "primaryKey",
            "primaryValue",

            // Model methods
            "set",
            "get",
            "clone",
            "toJSON",
            "equal",
            "findParent",
            "filterParents",
            "findParentInstance",
            "findChild",
            "filterChildren",
            "walk",
            "hasValue",
            "hasProperty",
            "getDescription",
            "isValid",
            // EventEmitter methods
            "on",
            "once",
            "emit"
        ];


        RESERVED_KEYS.forEach(reservedKey => {
            
            class Company extends Model {
                static structure() {
                    return {
                        [reservedKey]: {
                            type: "text",
                            primary: true
                        }
                    };
                }
            }
    
            assert.throws(
                () => {
                    new Company({
                        [reservedKey]: 1
                    });
                },
                err =>
                    err.message == `primary key cannot be reserved word: ${reservedKey}`
            );

        });
    });

    it("check property model.primaryKey", () => {
        class Company extends Model {
            static structure() {
                return {
                    id: {
                        type: "number",
                        primary: true
                    },
                    name: "text"
                };
            }
        }

        let company1 = new Company({
            id: 1
        });

        assert.strictEqual( company1.primaryKey, "id" );
    });

    it("check property model.primaryValue", () => {
        class Company extends Model {
            static structure() {
                return {
                    id: {
                        type: "number",
                        primary: true
                    },
                    name: "text"
                };
            }
        }

        let company1 = new Company({
            id: 1
        });

        assert.strictEqual( company1.primaryValue, 1 );

        company1.set({
            id: 2
        });

        assert.strictEqual( company1.primaryValue, 2 );
    });

    it("model.id, if exists static field 'id' in structure", () => {
        class Company extends Model {
            static structure() {
                return {
                    id: {
                        type: "number",
                        primary: true
                    },
                    name: "text"
                };
            }
        }

        let company1 = new Company({
            id: 1,
            name: "Hello"
        });

        let company2 = new Company({
            id: 2,
            name: "World"
        });

        assert.strictEqual( company1.id, 1 );
        assert.strictEqual( company2.id, 2 );

        company1.set("id", 3);
        assert.strictEqual( company1.id, 3 );
    });
 
    it("primaryKey is required field", () => {
        class Company extends Model {
            static structure() {
                return {
                    id: {
                        type: "number",
                        primary: true
                    }
                };
            }
        }

        assert.throws(
            () => {
                new Company();
            },
            err =>
                err.message == "required id"
        );
    });

});
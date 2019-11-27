
import {Model} from "../../lib/index";
import assert from "assert";

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

        interface IAny {
            [key: string]: any;
        }

        RESERVED_KEYS.forEach((reservedKey) => {
            
            class Company extends Model<IAny> {
                static data() {
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
                    const company = new Company({
                        [reservedKey]: 1
                    });
                },
                (err) =>
                    err.message === `primary key cannot be reserved word: ${reservedKey}`
            );

        });
    });

    it("check property model.primaryKey", () => {
        interface ICompany {
            id: number;
            name: string;
        }

        class Company extends Model<ICompany> {
            static data() {
                return {
                    id: {
                        type: "number",
                        primary: true
                    },
                    name: "text"
                };
            }
        }

        const company1 = new Company({
            id: 1
        });

        assert.strictEqual( company1.primaryKey, "id" );
    });

    it("check property model.primaryValue", () => {
        interface ICompany {
            id: number;
            name: string;
        }

        class Company extends Model<ICompany> {
            static data() {
                return {
                    id: {
                        type: "number",
                        primary: true
                    },
                    name: "text"
                };
            }
        }

        const company1 = new Company({
            id: 1
        });

        assert.strictEqual( company1.primaryValue, 1 );

        company1.set({
            id: 2
        });

        assert.strictEqual( company1.primaryValue, 2 );
    });

    it("model.id, if exists static field 'id' in data", () => {
        interface ICompany {
            id: number;
            name: string;
        }

        class Company extends Model<ICompany> {
            static data() {
                return {
                    id: {
                        type: "number",
                        primary: true
                    },
                    name: "text"
                };
            }
            
            id: number;
        }

        const company1 = new Company({
            id: 1,
            name: "Hello"
        });

        const company2 = new Company({
            id: 2,
            name: "World"
        });

        assert.strictEqual( company1.id, 1 );
        assert.strictEqual( company2.id, 2 );

        company1.set({id: 3});
        assert.strictEqual( company1.id, 3 );
    });
 
    it("primaryKey is required field", () => {
        interface ICompany {
            id: number;
        }

        class Company extends Model<ICompany> {
            static data() {
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
                const company = new Company();
            },
            (err) =>
                err.message === "required id"
        );
    });

});


import {Model, Types} from "../../lib/index";
import assert from "assert";

describe("Model primary field", () => {
    
    it("primary key cannot be reserved word", () => {
        
        const RESERVED_KEYS = [
            // reserved Model properties
            "row",
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


        RESERVED_KEYS.forEach((reservedKey) => {
            
            class Company extends Model<Company> {
                structure() {
                    return {
                        [reservedKey]: Types.String({
                            primary: true
                        })
                    };
                }
            }
    
            assert.throws(
                () => {
                    const company = new (Company as any)({
                        [reservedKey]: 1
                    });
                },
                (err: Error) =>
                    err.message === `field ${reservedKey} cannot be primary key, because it reserved word`
            );

        });
    });

    it("check property model.primaryKey", () => {

        class Company extends Model<Company> {
            structure() {
                return {
                    id: Types.Number({
                        primary: true
                    }),
                    name: Types.String
                };
            }
        }

        const company1 = new Company({
            id: 1
        });

        assert.strictEqual( company1.primaryKey, "id" );
    });

    it("check property model.primaryValue", () => {

        class Company extends Model<Company> {
            structure() {
                return {
                    id: Types.Number({
                        primary: true
                    }),
                    name: Types.String
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

    it("model.id, if exists static field 'id' in row", () => {
        class Company extends Model<Company> {
            
            id: number;
            structure() {
                return {
                    id: Types.Number({
                        primary: true
                    }),
                    name: Types.String
                };
            }
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
        class Company extends Model<Company> {
            structure() {
                return {
                    id: Types.Number({
                        primary: true
                    })
                };
            }
        }

        assert.throws(
            () => {
                const company = new Company();
            },
            (err: Error) =>
                err.message === "required id"
        );
    });

});

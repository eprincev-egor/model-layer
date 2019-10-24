"use strict";

const registeredTypes = {};
import {invalidValuesAsString} from "../utils";
const FORBIDDEN_PRIMARY_KEYS = [
    "data",
    "primaryKey",
    "primaryValue"
];

export default class Type {
    public static Model: any;

    public static registerType(typeName, CustomType) {
        registeredTypes[ typeName ] = CustomType;
    }

    public static getType(typeName) {
        return registeredTypes[ typeName ];
    }

    // create type by params
    public static create(description, key) {
        
        const isPlainDescription = (
            description && 
            description.type
        );

        // structure: {prop: "number"}
        // or
        // structure: {prop: ["number"]}
        // or
        // structure: {prop: SomeModel}
        // or
        // structure: {prop: {}}
        if ( !isPlainDescription ) {
            description = {
                type: description
            };
        }
        

        

        // prepare description: ["string"] 
        // to { type: "array", element: {type: "string"} }
        for (const typeName in registeredTypes) {
            const SomeType = registeredTypes[ typeName ];

            // CustomType can use some variations for declare structure
            SomeType.prepareDescription( description );
        }

        // find CustomType by name
        const CustomType = registeredTypes[ description.type ];
        if ( !CustomType ) {
            throw new Error(`${key}: unknown type: ${ description.type }`);
        }


        if ( description.primary ) {
            const Model = Type.Model;
            const isReserved = (
                key in Model.prototype ||
                FORBIDDEN_PRIMARY_KEYS.includes( key )
            );

            if ( isReserved ) {
                throw new Error(`primary key cannot be reserved word: ${ key }`);
            }
        }

        try {
            description = new CustomType( description );
        } catch (err) {
            err.message = key + ": " + err.message;
            throw err;
        }

        // structure must be static
        Object.freeze( description );

        return description;
    }

    // default behavior
    public static prepareDescription(description) {
        // redefine me
        return description;
    }

    public primary?: boolean;
    public required: boolean;
    public type: string;
    public const: boolean;
    public enum?: any[];

    constructor({
        type,
        required = false,
        prepare,
        toJSON,
        validate,
        key,
        ...params
    }) {
        if ( params.primary ) {
            this.primary = true;
            required = true;
        }

        this.type = type;
        this.required = required;

        if ( Array.isArray( params.enum ) ) {
            this.enum = params.enum;
        }

        // default can be: false, 0, or function
        if ( "default" in params ) {
            if ( typeof params.default === "function" ) {
                this.default = params.default;
            } else {
                this.default = () => params.default;
            }
        }

        // custom prepare not null value, after default prepare
        if ( typeof prepare === "function" ) {
            const prepareByType = this.prepare.bind(this);
            const customPrepare = prepare;

            this.prepare = (value) => {
                value = prepareByType( value );

                if ( value != null ) {
                    value = customPrepare( value );
                }

                return value;
            };
        }

        if ( typeof toJSON === "function" ) {
            this.toJSON = toJSON;
        }


        // custom validate by RegExp or function
        if ( validate ) {
            // validate by required, enum, "unique" (ArrayType)
            const validateByType = this.validate.bind(this);
            // validate by RegExp or function
            const customValidate = validate;

            if ( typeof validate === "function" ) {
                this.validate = (value, modelKey) => {
                    return (
                        validateByType( value, modelKey ) &&
                        (
                            value == null ||
                            customValidate( value )
                        )
                    );
                };
            }
            else if ( validate instanceof RegExp ) {
                this.validate = (value, modelKey) => {
                    return (
                        validateByType( value, modelKey ) &&
                        (
                            value == null ||
                            validate.test( value )
                        )
                    );
                };
            }

            else {
                throw new Error("validate should be function or RegExp: " + 
                    invalidValuesAsString( validate ));
            }
        }


        // validate key for models with "*"
        if ( key ) {
            const customValidateKey = key;

            if ( customValidateKey instanceof RegExp ) {
                this.validateKey = (modelKey) => {
                    return customValidateKey.test( modelKey );
                };
            }
            else if ( typeof customValidateKey === "function" ) {
                this.validateKey = customValidateKey;
            }

            else {
                throw new Error("validate key should be function or RegExp: " + 
                    invalidValuesAsString( customValidateKey ));
            }
        }

        // don't change value
        if ( params.const ) {
            this.const = true;
        }
    }

    public default() {
        return null;
    }

    public validateKey(key: string) {
        return true;
    }

    public validate(value, key): boolean {
        if ( this.enum ) {
            if ( value != null ) {
                return this.enum.includes( value );
            }
        }

        return true;
    }

    public prepare(value) {
        return value;
    }

    public toJSON(value) {
        return value;
    }

    public clone(value) {
        return this.toJSON( value );
    }

    public typeAsString() {
        return this.type;
    }

    public equal(selfValue, otherValue /*, stack */) {
        return selfValue === otherValue;
    }
}

"use strict";

const registeredTypes = {};
const {invalidValuesAsString} = require("../utils");
const FORBIDDEN_PRIMARY_KEYS = [
    "data",
    "primaryKey"
];
class Type {
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
            if ( typeof params.default == "function" ) {
                this.default = params.default;
            } else {
                this.default = () => params.default;
            }
        }

        // custom prepare not null value, after default prepare
        if ( typeof prepare == "function" ) {
            let prepareByType = this.prepare.bind(this);
            let customPrepare = prepare;

            this.prepare = (value) => {
                value = prepareByType( value );

                if ( value != null ) {
                    value = customPrepare( value );
                }

                return value;
            };
        }

        if ( typeof toJSON == "function" ) {
            this.toJSON = toJSON;
        }


        // custom validate by RegExp or function
        if ( validate ) {
            // validate by required, enum, "unique" (ArrayType)
            let validateByType = this.validate.bind(this);
            // validate by RegExp or function
            let customValidate = validate;

            if ( typeof validate == "function" ) {
                this.validate = (value, key) => {
                    return (
                        validateByType( value, key ) &&
                        (
                            value == null ||
                            customValidate( value )
                        )
                    );
                };
            }
            else if ( validate instanceof RegExp ) {
                this.validate = (value, key) => {
                    return (
                        validateByType( value, key ) &&
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
            let customValidateKey = key;

            if ( customValidateKey instanceof RegExp ) {
                this.validateKey = (key) => {
                    return customValidateKey.test( key );
                };
            }
            else if ( typeof customValidateKey == "function" ) {
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

    default() {
        return null;
    }

    validateKey(/* key */) {
        return true;
    }

    validate(value, key) {
        if ( this.required ) {
            if ( value == null ) {
                throw new Error(`required ${ key }`);
            }
        }

        if ( this.enum ) {
            if ( value != null ) {
                return this.enum.includes( value );
            }
        }

        return true;
    }

    prepare(value) {
        return value;
    }

    toJSON(value) {
        return value;
    }

    clone(value) {
        return this.toJSON( value );
    }

    typeAsString() {
        return this.type;
    }

    equal(selfValue, otherValue /*, stack */) {
        return selfValue === otherValue;
    }

    static registerType(typeName, CustomType) {
        registeredTypes[ typeName ] = CustomType;
    }

    static getType(typeName) {
        return registeredTypes[ typeName ];
    }

    // create type by params
    static create(description, key) {
        
        let isPlainDescription = (
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
        for (let key in registeredTypes) {
            let CustomType = registeredTypes[ key ];

            // CustomType can use some variations for declare structure
            CustomType.prepareDescription( description );
        }

        // find CustomType by name
        let CustomType = registeredTypes[ description.type ];
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
        } catch(err) {
            err.message = key + ": " + err.message;
            throw err;
        }

        // structure must be static
        Object.freeze( description );

        return description;
    }

    // default behavior
    static prepareDescription(description) {
        // redefine me
        return description;
    }
}

module.exports = Type;
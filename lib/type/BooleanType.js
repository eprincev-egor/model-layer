"use strict";

const Type = require("./Type");
const {isObject, isNaN, invalidValuesAsString} = require("../utils");

class BooleanType extends Type {
    constructor({
        nullAsFalse, falseAsNull,
        ...params
    }) {
        super(params);

        this.nullAsFalse = nullAsFalse;
        this.falseAsNull = falseAsNull;
    }

    prepare(value, key) {
        if ( value == null ) {
            if ( this.nullAsFalse ) {
                return false;
            }
    
            return null;
        }
    
    
        if ( 
            isNaN( +value ) ||
            value instanceof RegExp ||
            isObject(value) ||
            Array.isArray(value) ||
            // infinity
            value === 1 / 0 ||
            value === -1 / 0
        ) {
            let valueAsString = invalidValuesAsString( value );
    
            throw new Error(`invalid boolean for ${key}: ${valueAsString}`);
        }
    
        // convert to boolean
        value = (
            value ? 
                true : 
                false
        );
    
        if ( this.falseAsNull ) {
            if ( !value ) {
                value = null;
            }
        }
    
        return value;
    }
}

Type.registerType("boolean", BooleanType);

module.exports = BooleanType;
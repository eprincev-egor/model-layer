"use strict";

const Type = require("./Type");
const {isObject, isNaN, invalidValuesAsString} = require("../utils");

class StringType extends Type {

    static prepareDescription(description) {
        
        if ( description.type == "text" ) {
            description.type = "string";
        }
    }

    constructor({
        nullAsEmpty = false, 
        emptyAsNull = false,
        trim = false, 
        lower = false, 
        upper = false,

        ...params
    }) {
        super(params);

        this.nullAsEmpty = nullAsEmpty;
        this.emptyAsNull = emptyAsNull;

        this.trim = trim;
        this.lower = lower;
        this.upper = upper;
    }

    prepare(value, key) {
        if ( value == null ) {
            if ( this.nullAsEmpty ) {
                return "";
            }
            return null;
        }
    
    
        if ( 
            isNaN(value) ||
            typeof value == "boolean" ||
            isObject(value) ||
            Array.isArray(value) ||
            // infinity
            value === 1 / 0 ||
            value === -1 / 0
        ) {
            let valueAsString = invalidValuesAsString( value );
    
            throw new Error(`invalid string for ${key}: ${valueAsString}`);
        }
    
        // convert to string
        value += "";
    
        if ( this.trim ) {
            value = value.trim();
        }
    
        if ( this.emptyAsNull ) {
            if ( value === "" ) {
                value = null;
            }
        }
    
        if ( this.lower ) {
            value = value.toLowerCase();
        }
        else if ( this.upper ) {
            value = value.toUpperCase();
        }
    
        return value;
    }
}

Type.registerType("string", StringType);

module.exports = StringType;
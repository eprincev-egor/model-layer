"use strict";

const Type = require("./Type");
const {invalidValuesAsString} = require("../utils");

class DateType extends Type {
    prepare(originalValue, key) {
        if ( originalValue == null ) {
            return null;
        }
    
    
        let value = originalValue;
    
        // iso date string
        if ( typeof value == "string" ) {
            // Date.parse returns unix timestamp
            value = Date.parse( value );
        }
    
        // unix timestamp
        if ( typeof value == "number" ) {
            value = new Date( value );
        }
        
        let isInvalidDate = (
            !(value instanceof Date) ||
            value.toString() == "Invalid Date"
        );
        if ( isInvalidDate ) {
            let valueAsString = invalidValuesAsString( originalValue );
    
            throw new Error(`invalid date for ${key}: ${valueAsString}`);
        }
    
        return value;
    }

    equal(selfValue, anotherValue) {
        if ( selfValue == null ) {
            return anotherValue === null;
        }

        if ( !(anotherValue instanceof Date) ) {
            return false;
        }

        return +selfValue === +anotherValue;
    }
}

Type.registerType("date", DateType);

module.exports = DateType;
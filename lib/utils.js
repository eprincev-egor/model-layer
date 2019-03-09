"use strict";

function isObject(value) {
    return (
        // not null
        value &&
        typeof value == "object" &&
        // not array
        !Array.isArray( value )
    );
}

function isPlainObject(value) {
    return (
        isObject(value) &&
        value.constructor === Object
    );
}

function isNaN(value) {
    return (
        typeof value == "number" &&
        value !== value
    );
}

function invalidValuesAsString(value) {
    if ( value instanceof RegExp ) {
        return value.toString();
    }

    if ( Array.isArray(value) || isObject(value) ) {
        let valueAsString;
        try {
            valueAsString = JSON.stringify(value);
        } catch(err) {
            valueAsString = false;
        }

        if ( valueAsString ) {
            return valueAsString;
        }
    }

    if ( typeof value == "string" ) {
        return `"${value}"`;
    }

    return value + "";
}

function MODELS(Models) {
    this.Models = Models;
}

module.exports = {
    isObject,
    isNaN,
    invalidValuesAsString,
    isPlainObject,
    MODELS
};
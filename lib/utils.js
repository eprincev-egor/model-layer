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

const MAX_VALUE_LENGTH = 50;
function invalidValuesAsString(value) {

    // "big string..."
    if ( typeof value == "string" ) {
        if ( value.length > MAX_VALUE_LENGTH ) {
            value = value.slice(0, MAX_VALUE_LENGTH) + "...";
        }

        return `"${value}"`;
    }

    

    let valueAsString = value + "";
    
    //  /some/ig
    if ( value instanceof RegExp ) {
        valueAsString = value.toString();
    }

    // [1,2,3] or {"x": 1}
    else if ( Array.isArray(value) || isObject(value) ) {
        try {
            valueAsString = JSON.stringify(value);
        } catch(err) {
            valueAsString = value + "";
        }
    }

    if ( valueAsString.length > MAX_VALUE_LENGTH ) {
        valueAsString = valueAsString.slice(0, MAX_VALUE_LENGTH) + "...";
    }

    return valueAsString;
}

function MODELS(Models) {
    this.Models = Models;
}


// https://github.com/ryanve/eol/blob/gh-pages/eol.js
const isWindows = (
    typeof process != "undefined" && 
    "win32" === process.platform
);
const eol = isWindows ? "\r\n" : "\n";


module.exports = {
    isObject,
    isNaN,
    invalidValuesAsString,
    isPlainObject,
    MODELS,
    eol
};
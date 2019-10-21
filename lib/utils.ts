"use strict";

export function isObject(value) {
    return (
        // not null
        value &&
        typeof value === "object" &&
        // not array
        !Array.isArray( value )
    );
}

export function isPlainObject(value) {
    return (
        isObject(value) &&
        value.constructor === Object
    );
}

export function isNaN(value) {
    return (
        typeof value === "number" &&
        value !== value
    );
}

const MAX_VALUE_LENGTH = 50;
export function invalidValuesAsString(value) {

    // "big string..."
    if ( typeof value === "string" ) {
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
        } catch (err) {
            valueAsString = value + "";
        }
    }

    if ( valueAsString.length > MAX_VALUE_LENGTH ) {
        valueAsString = valueAsString.slice(0, MAX_VALUE_LENGTH) + "...";
    }

    return valueAsString;
}

export function MODELS(Models) {
    this.Models = Models;
}



export const eol = {
    eol: null,
    
    toString() {
        return this.eol;
    },

    define(os?) {
        // https://github.com/ryanve/eol/blob/gh-pages/eol.js
        let isWindows = (
            typeof process !== "undefined" && 
            "win32" === process.platform
        );

        // for tests
        if ( os === "linux" ) {
            isWindows = false;
        }
        if ( os === "windows" ) {
            isWindows = true;
        }
        

        if ( isWindows ) {
            this.eol = "\r\n";
        }
        else {
            this.eol = "\n";
        }
    }
};

eol.define();

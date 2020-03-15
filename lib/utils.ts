

export function isObject(value: any): boolean {
    return (
        // not null
        value &&
        typeof value === "object" &&
        // not array
        !Array.isArray( value )
    );
}

export function isPlainObject(value: any): boolean {
    return (
        isObject(value) &&
        value.constructor === Object
    );
}

export function isNaN(value: any): boolean {
    return (
        typeof value === "number" &&
        value !== value
    );
}

const MAX_VALUE_LENGTH = 50;
export function invalidValuesAsString(value: any): string {

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


export const eol = {
    eol: null as string | null,
    
    toString() {
        return this.eol;
    },

    define(os?: string) {
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

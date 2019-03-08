"use strict";

const Type = require("./Type");
const {isObject} = require("../utils");

class AnyType extends Type {
    toJSON(value) {
        return value2json( value );
    }
}

function value2json(value) {
    if ( value && typeof value.toJSON == "function" ) {
        return value.toJSON();
    }

    if ( Array.isArray(value) ) {
        return value.map(item =>
            value2json( item )
        );
    }

    if ( isObject(value) ) {
        let json = {};

        for (let key in value) {
            let item = value[ key ];

            json[ key ] = value2json( item );
        }

        return json;
    }

    return value;
}

Type.registerType("*", AnyType);

module.exports = AnyType;
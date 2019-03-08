"use strict";

const Type = require("./Type");
const {isNaN, invalidValuesAsString} = require("../utils");

class NumberType extends Type {
    constructor({
        nullAsZero = false, 
        zeroAsNull = false,
        ceil = null, 
        round = null, 
        floor = null,

        ...params
    }) {
        super(params);

        
        this.nullAsZero = nullAsZero;
        this.zeroAsNull = zeroAsNull;

        if ( ceil !== null ) {
            ceil = isNaN(+ceil) ? null : +ceil;
        }
        if ( round !== null ) {
            round = isNaN(+round) ? null : +round;
        }
        if ( floor !== null ) {
            floor = isNaN(+ceil) ? null : +floor;
        }
        this.ceil = ceil;
        this.round = round;
        this.floor = floor;
    }

    prepare(originalValue,  key) {
        if ( originalValue == null ) {
            if ( this.nullAsZero ) {
                return 0;
            }
            return null;
        }
    
    
        let value = +originalValue;
    
        if ( 
            isNaN(value) ||
            typeof originalValue == "boolean" ||
            originalValue instanceof RegExp ||
            Array.isArray(originalValue) ||
            // infinity
            value === 1 / 0 ||
            value === -1 / 0
        ) {
            let valueAsString = invalidValuesAsString( originalValue );
    
            throw new Error(`invalid number for ${key}: ${valueAsString}`);
        }
    
        
        if ( this.round !== null ) {
            let desc = Math.pow( 10, this.round );
    
            value = Math.round(  
                value * 
                desc
            ) / desc;
        }
    
        else if ( this.floor !== null ) {
            let desc = Math.pow( 10, this.floor );
    
            value = Math.floor(
                value * 
                desc
            ) / desc;
        }
    
        else if ( this.ceil !== null ) {
            let desc = Math.pow( 10, this.ceil );
    
            value = Math.ceil(
                value * 
                desc
            ) / desc;
        }
    
    
        if ( this.zeroAsNull ) {
            if ( value === 0 ) {
                value = null;
            }
        }
    
        return value;
    }
}

Type.registerType("number", NumberType);

module.exports = NumberType;
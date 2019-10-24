"use strict";

import {Type, ITypeParams} from "./Type";
import {isObject, isNaN, invalidValuesAsString} from "../utils";

interface IStringTypeParams extends ITypeParams {
    nullAsEmpty: boolean;
    emptyAsNull: boolean;
    trim: boolean;
    lower: boolean;
    upper: boolean;
}

class StringType extends Type {

    public static prepareDescription(description) {
        
        if ( description.type === "text" ) {
            description.type = "string";
        }
    }
    
    public nullAsEmpty: boolean;
    public emptyAsNull: boolean;
    public trim: boolean;
    public lower: boolean;
    public upper: boolean;

    constructor(params: IStringTypeParams) {
        super(params);

        this.nullAsEmpty = params.nullAsEmpty;
        this.emptyAsNull = params.emptyAsNull;

        this.trim = params.trim;
        this.lower = params.lower;
        this.upper = params.upper;
    }

    public prepare(value, key) {
        if ( value == null ) {
            if ( this.nullAsEmpty ) {
                return "";
            }
            return null;
        }
    
    
        if ( 
            isNaN(value) ||
            typeof value === "boolean" ||
            isObject(value) ||
            Array.isArray(value) ||
            // infinity
            value === 1 / 0 ||
            value === -1 / 0
        ) {
            const valueAsString = invalidValuesAsString( value );
    
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



import {Type, IType, ITypeParams} from "./Type";
import {isObject, isNaN, invalidValuesAsString} from "../utils";

export interface IStringTypeParams extends ITypeParams {
    nullAsEmpty?: boolean;
    emptyAsNull?: boolean;
    trim?: boolean;
    lower?: boolean;
    upper?: boolean;
}

export interface IStringType extends IType {
    (params: IStringTypeParams): IStringType;
    TOutput: string;
    TInput: number | string;
    TJson: string;
}

export class StringType extends Type {

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

    constructor({
        nullAsEmpty = false,
        emptyAsNull = false,
        trim = false,
        lower = false,
        upper = false,
        ...otherParams
    }: IStringTypeParams) {
        super(otherParams);

        this.nullAsEmpty = nullAsEmpty;
        this.emptyAsNull = emptyAsNull;

        this.trim = trim;
        this.lower = lower;
        this.upper = upper;

        if ( nullAsEmpty && emptyAsNull ) {
            throw new Error("conflicting parameters: use only nullAsEmpty or only emptyAsNull");
        }
        if ( lower && upper ) {
            throw new Error("conflicting parameters: use only lower or only upper");
        }
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

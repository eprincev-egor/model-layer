

import {Type, IType, ITypeParams} from "./Type";
import {isObject, isNaN, invalidValuesAsString} from "../utils";

export interface IBooleanTypeParams extends ITypeParams {
    nullAsFalse?: boolean;
    falseAsNull?: boolean;
}

export interface IBooleanType extends IType {
    (params: IBooleanTypeParams): IBooleanType;
    TOutput: boolean;
    TInput: boolean | 1 | 0;
    TJson: boolean;
}

export class BooleanType extends Type {
    public nullAsFalse: boolean;
    public falseAsNull: boolean;

    constructor(params: IBooleanTypeParams) {
        super(params);

        this.nullAsFalse = params.nullAsFalse;
        this.falseAsNull = params.falseAsNull;

        if ( params.nullAsFalse && params.falseAsNull ) {
            throw new Error("conflicting parameters: use only nullAsFalse or only falseAsNull");
        }
    }

    public prepare(value, key) {
        if ( value == null ) {
            if ( this.nullAsFalse ) {
                return false;
            }
    
            return null;
        }
    
    
        if ( 
            isNaN( +value ) ||
            value instanceof RegExp ||
            isObject(value) ||
            Array.isArray(value) ||
            // infinity
            value === 1 / 0 ||
            value === -1 / 0
        ) {
            const valueAsString = invalidValuesAsString( value );
    
            throw new Error(`invalid boolean for ${key}: ${valueAsString}`);
        }
    
        // convert to boolean
        value = (
            value ? 
                true : 
                false
        );
    
        if ( this.falseAsNull ) {
            if ( !value ) {
                value = null;
            }
        }
    
        return value;
    }
}

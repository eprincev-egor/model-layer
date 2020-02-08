
import {Type, IType, ITypeParams} from "./Type";
import {invalidValuesAsString} from "../utils";
import {
    ConflictNullAndFalseParameterError,
    InvalidBooleanError
} from "../errors";

export interface IBooleanTypeParams extends ITypeParams {
    nullAsFalse?: boolean;
    falseAsNull?: boolean;
    prepare?: (value: any, key: string, model) => boolean;
    validate?: 
        ((value: boolean, key: string) => boolean) |
        RegExp
    ;
    enum?: boolean[];
    default?: boolean | (() => boolean);
}

export interface IBooleanType extends IType {
    (params: IBooleanTypeParams): IBooleanType;
    TOutput: boolean;
    TInput: boolean;
    TJson: boolean;
}

export class BooleanType extends Type {
    nullAsFalse: boolean;
    falseAsNull: boolean;

    constructor(params: IBooleanTypeParams) {
        super(params);

        this.nullAsFalse = params.nullAsFalse;
        this.falseAsNull = params.falseAsNull;

        if ( params.nullAsFalse && params.falseAsNull ) {
            throw new ConflictNullAndFalseParameterError({});
        }
    }

    prepare(value, key) {
        if ( value == null ) {
            if ( this.nullAsFalse ) {
                return false;
            }
    
            return null;
        }
    
    
        if ( typeof value !== "boolean" ) {
            const valueAsString = invalidValuesAsString( value );
    
            throw new InvalidBooleanError({
                key,
                invalidValue: valueAsString
            });
        }

        if ( this.falseAsNull ) {
            if ( !value ) {
                value = null;
            }
        }
    
        return value;
    }
}

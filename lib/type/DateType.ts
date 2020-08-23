
import {Type, IType, ITypeParams} from "./Type";
import {invalidValuesAsString} from "../utils";
import {InvalidDateError} from "../errors";

// tslint:disable-next-line: no-empty-interface
export interface IDateTypeParams extends ITypeParams {
    prepare?: (value: any, key: string, model: any) => Date;
    validate?: 
        ((value: Date, key: string) => boolean) |
        RegExp
    ;
    enum?: Date[];
    default?: Date | (() => Date);
}

export interface IDateType extends IType {
    (params: IDateTypeParams): IDateType;
    TOutput: Date;
    TInput: number | string | Date;
    TJson: string;
}

export class DateType extends Type {
    prepare(originalValue: any, key: string) {
        if ( originalValue == null ) {
            return null;
        }
    
    
        let value = originalValue;
    
        // iso date string
        if ( typeof value === "string" ) {
            // Date.parse returns unix timestamp
            value = Date.parse( value );
        }
    
        // unix timestamp
        if ( typeof value === "number" ) {
            value = new Date( value );
        }
        
        const isInvalidDate = (
            !(value instanceof Date) ||
            value.toString() === "Invalid Date"
        );
        if ( isInvalidDate ) {
            const valueAsString = invalidValuesAsString( originalValue );
    
            throw new InvalidDateError({
                key,
                invalidValue: valueAsString
            });
        }
    
        return value;
    }

    equal(selfValue: any, anotherValue: any) {
        if ( selfValue == null ) {
            return anotherValue === null;
        }

        if ( !(anotherValue instanceof Date) ) {
            return false;
        }

        return +selfValue === +anotherValue;
    }

    toJSON(date: Date) {
        return date.toISOString();
    }
}

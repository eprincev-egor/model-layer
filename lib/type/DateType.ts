
import {Type, IType, ITypeParams} from "./Type";
import {invalidValuesAsString} from "../utils";

// tslint:disable-next-line: no-empty-interface
export interface IDateTypeParams extends ITypeParams {
}

export interface IDateType extends IType {
    (params: IDateTypeParams): IDateType;
    TOutput: Date;
    TInput: number | string | Date;
    TJson: string;
}

export class DateType extends Type {
    public prepare(originalValue, key) {
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
    
            throw new Error(`invalid date for ${key}: ${valueAsString}`);
        }
    
        return value;
    }

    public equal(selfValue, anotherValue) {
        if ( selfValue == null ) {
            return anotherValue === null;
        }

        if ( !(anotherValue instanceof Date) ) {
            return false;
        }

        return +selfValue === +anotherValue;
    }
}

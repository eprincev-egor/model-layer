

import {Type, IType, ITypeParams} from "./Type";
import {isNaN, invalidValuesAsString} from "../utils";
import {
    ConflictFloorCeilRoundError,
    ConflictNullAndZeroParameterError,
    InvalidNumberError,
    InvalidRoundError
} from "../errors";

export interface INumberTypeParams extends ITypeParams {
    nullAsZero?: boolean;
    zeroAsNull?: boolean;
    ceil?: number;
    round?: number;
    floor?: number;
    prepare?: (value: any, key: string, model) => number;
    validate?: 
        ((value: number, key: string) => boolean) |
        RegExp
    ;
    enum?: number[];
    default?: number | (() => number);
}

export interface INumberType extends IType {
    (params: INumberTypeParams): INumberType;
    TOutput: number;
    TInput: number;
    TJson: number;
}

export class NumberType extends Type {
    nullAsZero: boolean;
    zeroAsNull: boolean;
    ceil: number;
    round: number;
    floor: number;

    constructor({
        nullAsZero = false,
        zeroAsNull = false,
        ceil = null,
        round = null,
        floor = null,
        ...otherParams
    }: INumberTypeParams) {
        super(otherParams);

        
        this.nullAsZero = nullAsZero;
        this.zeroAsNull = zeroAsNull;

        if ( nullAsZero && zeroAsNull ) {
            throw new ConflictNullAndZeroParameterError({});
        }

        if ( ceil != null ) {
            if ( isNaN(+ceil) ) {
                throw new InvalidRoundError({
                    roundType: "ceil",
                    invalidValue: invalidValuesAsString(ceil)
                });
            }
            ceil = +ceil;
        }
        this.ceil = ceil;

        if ( round != null ) {
            if ( isNaN(+round) ) {
                throw new InvalidRoundError({
                    roundType: "round",
                    invalidValue: invalidValuesAsString(round)
                });
            }

            if ( ceil != null ) {
                throw new ConflictFloorCeilRoundError({});
            }

            round = +round;
        }
        this.round = round;

        if ( floor != null ) {
            if ( isNaN(+floor) ) {
                throw new InvalidRoundError({
                    roundType: "floor",
                    invalidValue: invalidValuesAsString(floor)
                });
            }

            if ( ceil != null ) {
                throw new ConflictFloorCeilRoundError({});
            }
            if ( round != null ) {
                throw new ConflictFloorCeilRoundError({});
            }
            
            floor = +floor;
        }
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
            typeof originalValue === "boolean" ||
            originalValue instanceof RegExp ||
            originalValue instanceof Date ||
            Array.isArray(originalValue) ||
            // infinity
            value === 1 / 0 ||
            value === -1 / 0
        ) {
            const valueAsString = invalidValuesAsString( originalValue );
    
            throw new InvalidNumberError({
                key,
                invalidValue: valueAsString
            });
        }
    
        
        if ( this.round != null ) {
            const desc = Math.pow( 10, this.round );
    
            value = Math.round(  
                value * 
                desc
            ) / desc;
        }
    
        else if ( this.floor != null ) {
            const desc = Math.pow( 10, this.floor );
    
            value = Math.floor(
                value * 
                desc
            ) / desc;
        }
    
        else if ( this.ceil != null ) {
            // 1.12 * 100 == 112.00000000000001

            let valueStr = value.toString();
            let commaPosition = valueStr.indexOf(".");
            
            if ( commaPosition !== -1 ) {
                commaPosition += this.ceil;
                valueStr = valueStr.replace(".", "");
                valueStr = (
                    valueStr.slice(0, commaPosition) + 
                    "." +
                    valueStr.slice(commaPosition)
                );

                value = +valueStr;
                
                const desc = Math.pow( 10, this.ceil );
                value = Math.ceil(value) / desc;
            }
        }
    
    
        if ( this.zeroAsNull ) {
            if ( value === 0 ) {
                value = null;
            }
        }
    
        return value;
    }
}

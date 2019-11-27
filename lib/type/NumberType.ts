

import {Type, IType, ITypeParams} from "./Type";
import {isNaN, invalidValuesAsString} from "../utils";

export interface INumberTypeParams extends ITypeParams {
    nullAsZero?: boolean;
    zeroAsNull?: boolean;
    ceil?: number;
    round?: number;
    floor?: number;
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
            throw new Error("conflicting parameters: use only nullAsZero or only zeroAsNull");
        }

        if ( ceil != null ) {
            if ( isNaN(+ceil) ) {
                throw new Error("invalid ceil: " + invalidValuesAsString(ceil));
            }
            ceil = +ceil;
        }
        this.ceil = ceil;

        if ( round != null ) {
            if ( isNaN(+round) ) {
                throw new Error("invalid round: " + invalidValuesAsString(round));
            }

            if ( ceil != null ) {
                throw new Error("conflicting parameters: use only round or only ceil");
            }

            round = +round;
        }
        this.round = round;

        if ( floor != null ) {
            if ( isNaN(+floor) ) {
                throw new Error("invalid floor: " + invalidValuesAsString(floor));
            }

            if ( ceil != null ) {
                throw new Error("conflicting parameters: use only floor or only ceil");
            }
            if ( round != null ) {
                throw new Error("conflicting parameters: use only floor or only round");
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
            Array.isArray(originalValue) ||
            // infinity
            value === 1 / 0 ||
            value === -1 / 0
        ) {
            const valueAsString = invalidValuesAsString( originalValue );
    
            throw new Error(`invalid number for ${key}: ${valueAsString}`);
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

module.exports = NumberType;

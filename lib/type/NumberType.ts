

import {Type, ITypeParams} from "./Type";
import {isNaN, invalidValuesAsString} from "../utils";

interface INumberTypeParams extends ITypeParams {
    nullAsZero?: boolean;
    zeroAsNull?: boolean;
    ceil?: number;
    round?: number;
    floor?: number;
}

export default class NumberType extends Type {
    public nullAsZero: boolean;
    public zeroAsNull: boolean;
    public ceil: number;
    public round: number;
    public floor: number;

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

            round = +round;
        }
        this.round = round;

        if ( floor != null ) {
            if ( isNaN(+floor) ) {
                throw new Error("invalid floor: " + invalidValuesAsString(floor));
            }
            
            floor = +floor;
        }
        this.floor = floor;
    }

    public prepare(originalValue,  key) {
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
            const desc = Math.pow( 10, this.ceil );
    
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

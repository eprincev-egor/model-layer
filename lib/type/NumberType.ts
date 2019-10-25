

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

    constructor(params: INumberTypeParams) {
        super(params);

        
        this.nullAsZero = params.nullAsZero;
        this.zeroAsNull = params.zeroAsNull;

        if ( params.ceil !== null ) {
            if ( isNaN(+params.ceil) ) {
                throw new Error("invalid ceil: " + invalidValuesAsString(params.ceil));
            }

            this.ceil = +params.ceil;
        }

        if ( params.round !== null ) {
            if ( isNaN(+params.round) ) {
                throw new Error("invalid round: " + invalidValuesAsString(params.round));
            }

            this.round = +params.round;
        }

        if ( params.floor !== null ) {
            if ( isNaN(+params.floor) ) {
                throw new Error("invalid floor: " + invalidValuesAsString(params.floor));
            }
            
            this.floor = +params.floor;
        }
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
    
        
        if ( this.round !== null ) {
            const desc = Math.pow( 10, this.round );
    
            value = Math.round(  
                value * 
                desc
            ) / desc;
        }
    
        else if ( this.floor !== null ) {
            const desc = Math.pow( 10, this.floor );
    
            value = Math.floor(
                value * 
                desc
            ) / desc;
        }
    
        else if ( this.ceil !== null ) {
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

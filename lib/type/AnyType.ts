

import {Type, IType, ITypeParams} from "./Type";
import {Model} from "../Model";
import {isObject, isPlainObject, isNaN} from "../utils";

// tslint:disable-next-line: no-empty-interface
export interface IAnyTypeParams extends ITypeParams {
}

export interface IAnyType extends IType {
    (params: IAnyTypeParams): ITypeAny;

    output: any;
    input: any;
    json: any;
}

export class AnyType extends Type {
    public toJSON(value) {
        return value2json( value );
    }

    public equal(selfValue, otherValue, stack) {
        return equal(selfValue, otherValue, stack);
    }
}

function equal(selfValue, otherValue, stack) {
    if ( selfValue instanceof Date && otherValue instanceof Date ) {
        return +selfValue === +otherValue;
    }

    if ( selfValue instanceof RegExp && otherValue instanceof RegExp ) {
        return selfValue.toString() === otherValue.toString();
    }

    if ( Array.isArray(selfValue) && Array.isArray(otherValue) ) {
        if ( selfValue.length !== otherValue.length ) {
            return false;
        }

        // stop circular recursion
        const stacked = stack.get(selfValue);
        if ( stacked ) {
            return stacked === otherValue;
        }
        stack.add(selfValue, otherValue);
        

        
        for (let i = 0, n = selfValue.length; i < n; i++) {
            const selfItem = selfValue[ i ];
            const otherItem = otherValue[ i ];

            const isEqualItem = equal( selfItem, otherItem, stack );
            if ( !isEqualItem ) {
                return false;
            }
        }
        
        return true;
    }

    if ( isPlainObject(selfValue) && isPlainObject(otherValue) ) {
        // stop circular recursion
        const stacked = stack.get(selfValue);
        if ( stacked ) {
            return true;
        }
        stack.add(selfValue, otherValue);

        const selfObj = selfValue;
        const otherObj = otherValue;

        for (const key in selfObj) {
            const myValue = selfObj[ key ];
            const himValue = otherObj[ key ];
            const isEqual = equal( myValue, himValue, stack );
            
            if ( !isEqual ) {
                return false;
            }
        }

        // check additional keys from otherObj
        for (const key in otherObj) {
            if ( key in selfObj) {
                continue;
            }

            // exists unknown property for selfObj
            return false;
        }

        return true;
    }

    if ( selfValue instanceof Model && otherValue instanceof Model ) {
        const stacked = stack.get(selfValue);
        if ( stacked ) {
            return true;
        }
        stack.add( selfValue, otherValue );

        return selfValue.equal( otherValue, stack );
    }

    if ( isNaN(selfValue) && isNaN(otherValue) ) {
        return true;
    }

    return selfValue === otherValue;
}

function value2json(value) {
    if ( value instanceof Date ) {
        return value.toISOString();
    }

    if ( value && typeof value.toJSON === "function" ) {
        return value.toJSON();
    }

    if ( Array.isArray(value) ) {
        return value.map((item) =>
            value2json( item )
        );
    }

    if ( isObject(value) ) {
        const json = {};

        for (const key in value) {
            const item = value[ key ];

            json[ key ] = value2json( item );
        }

        return json;
    }

    return value;
}

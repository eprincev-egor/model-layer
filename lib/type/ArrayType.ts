

import {Type, IType, ITypeParams, TInstanceOrT} from "./Type";
import {invalidValuesAsString, eol} from "../utils";

export interface IArrayTypeParams extends ITypeParams {
    sort?: boolean | ((a, b) => number);
    unique?: boolean;
    emptyAsNull?: boolean;
    nullAsEmpty?: boolean;
    element?: any;
}

export interface IArrayType<T extends IType> {
    <TElement extends IType | (new (...args: any) => IType)>(
        params: IArrayTypeParams & 
        {element: TElement}
    ): IArrayType< TInstanceOrT< TElement > >;

    TOutput: Array< T["TOutput"] >;
    TInput: Array< T["TInput"] >;
    TJson: Array< T["TJson"] >;
}
export class ArrayType extends Type {

    static prepareDescription(description, key) {
        if ( description.type === "array" ) {
            // prepare element description
            description.element = Type.create( description.element || "any", key );
        }
    }

    sort: boolean | ((a, b) => number);
    unique: boolean;
    emptyAsNull: boolean;
    nullAsEmpty: boolean;
    element: any;

    constructor({
        sort = false,
        unique = false,
        emptyAsNull = false,
        nullAsEmpty = false,
        element,
        ...otherParams
    }: IArrayTypeParams) {
        super(otherParams);

        if ( emptyAsNull && nullAsEmpty ) {
            throw new Error("conflicting parameters: use only nullAsEmpty or only emptyAsNull");
        }

        this.emptyAsNull = emptyAsNull;
        this.nullAsEmpty = nullAsEmpty;
        this.sort = sort;
        this.unique = unique;
        this.element = element;
    }

    prepare(originalValue, key) {
        if ( originalValue == null ) {
            if ( this.nullAsEmpty ) {
                const emptyArr = [];
                Object.freeze(emptyArr);
    
                return emptyArr;
            }
            return null;
        }
    
        const elementDescription = this.element;
        const elementTypeAsString = elementDescription.typeAsString();
    
        if ( !Array.isArray(originalValue) ) {
            const valueAsString = invalidValuesAsString( originalValue );
    
            throw new Error(`invalid array[${ elementTypeAsString }] for ${key}: ${valueAsString}`);
        }
    
        const value = originalValue.map((element, i) => {
            try {
                element = elementDescription.prepare( element, i );
            } catch (err) {
                const valueAsString = invalidValuesAsString( originalValue );
    
                throw new Error(`invalid array[${ elementTypeAsString }] for ${key}: ${valueAsString},${eol} ${err.message}`);
            }
    
            return element;
        });
    
        if ( this.emptyAsNull ) {
            if ( value.length === 0 ) {
                return null;
            }
        }
    
        if ( this.sort ) {
            if ( typeof this.sort === "function" ) {
                value.sort(this.sort);
            } else {
                value.sort();
            }
        }
    
        Object.freeze( value );
    
        return value;
    }

    validate(value, key) {
        const isValid = super.validate(value, key);
        if ( !isValid ) {
            return false;
        }


        if ( value && this.unique ) {
            value.forEach((element, index) => {
                if ( element == null ) {
                    return;
                }

                let isDuplicate = false;
                for (let i = 0, n = index; i < n; i++) {
                    const anotherElement = value[ i ];

                    if ( anotherElement === element ) {
                        isDuplicate = true;
                        break;
                    }
                }

                if ( isDuplicate ) {
                    const valueAsString = invalidValuesAsString( value );

                    throw new Error(`${key} is not unique: ${ valueAsString }`);
                }
            });
        }

        return true;
    }

    toJSON(value, stack = []) {
        return value.map((item) => 
            this.element.toJSON( item, [...stack] )
        );
    }

    clone(value) {
        return value.map((item) => 
            this.element.clone( item )
        );
    }

    equal(selfArr, otherArr, stack) {
        if ( selfArr == null ) {
            return otherArr === null;
        }

        if ( !Array.isArray(otherArr) ) {
            return false;
        }

        if ( selfArr.length !== otherArr.length ) {
            return false;
        }

        for (let i = 0, n = selfArr.length; i < n; i++) {
            const selfItem = selfArr[ i ];
            const otherItem = otherArr[ i ];
            const isEqual = this.element.equal( selfItem, otherItem, stack );

            if ( !isEqual ) {
                return false;
            }
        }

        return true;
    }
}



import {Type, ITypeParams} from "./Type";
import {invalidValuesAsString, eol} from "../utils";

interface IArrayTypeParams extends ITypeParams {
    sort?: boolean;
    unique?: boolean;
    emptyAsNull?: boolean;
    nullAsEmpty?: boolean;
    element?: any;
}

export default class ArrayType extends Type {

    public static prepareDescription(description, key) {
        // structure: {prop: []}
        // structure: {prop: ["number"]}
        if ( Array.isArray(description.type) ) {
            const elementType = description.type[0];

            description.type = "array";
            description.element = elementType;
        }


        if ( description.type === "array" ) {
            // prepare element description
            description.element = Type.create( description.element || "*", key );
        }
    }

    public sort: boolean;
    public unique: boolean;
    public emptyAsNull: boolean;
    public nullAsEmpty: boolean;
    public element: any;

    constructor(params: IArrayTypeParams) {
        super(params);

        this.emptyAsNull = params.emptyAsNull;
        this.nullAsEmpty = params.nullAsEmpty;
        this.sort = params.sort;
        this.unique = params.unique;
        this.element = params.element;
    }

    public prepare(originalValue, key) {
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

    public validate(value, key) {
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

    public toJSON(value) {
        return value.map((item) => 
            this.element.toJSON( item )
        );
    }

    public clone(value) {
        return value.map((item) => 
            this.element.clone( item )
        );
    }

    public equal(selfArr, otherArr, stack) {
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

Type.registerType("array", ArrayType);

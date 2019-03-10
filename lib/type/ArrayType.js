"use strict";

const Type = require("./Type");
const {invalidValuesAsString, eol} = require("../utils");

class ArrayType extends Type {

    static prepareDescription(description) {
        // structure: {prop: []}
        // structure: {prop: ["number"]}
        if ( Array.isArray(description.type) ) {
            let elementType = description.type[0];

            description.type = "array";
            description.element = elementType;
        }


        if ( description.type == "array" ) {
            // prepare element description
            description.element = Type.create( description.element || "*" );
        }
    }

    constructor({
        sort = false, 
        unique = false,
        emptyAsNull = false, 
        nullAsEmpty = false,
        element,
        ...params
    }) {
        super(params);

        this.emptyAsNull = emptyAsNull;
        this.nullAsEmpty = nullAsEmpty;
        this.sort = sort;
        this.unique = unique;
        this.element = element;
    }

    prepare(originalValue, key) {
        if ( originalValue == null ) {
            if ( this.nullAsEmpty ) {
                let value = [];
                Object.freeze(value);
    
                return value;
            }
            return null;
        }
    
        let elementDescription = this.element;
        let elementTypeAsString = elementDescription.typeAsString();
    
        if ( !Array.isArray(originalValue) ) {
            let valueAsString = invalidValuesAsString( originalValue );
    
            throw new Error(`invalid array[${ elementTypeAsString }] for ${key}: ${valueAsString}`);
        }
    
        let value = originalValue.map((element, i) => {
            try {
                element = elementDescription.prepare( element, i );
            } catch(err) {
                let valueAsString = invalidValuesAsString( originalValue );
    
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
            if ( typeof this.sort == "function" ) {
                value.sort(this.sort);
            } else {
                value.sort();
            }
        }
    
        Object.freeze( value );
    
        return value;
    }

    validate(value, key) {
        let isValid = super.validate(value, key);
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
                    let anotherElement = value[ i ];

                    if ( anotherElement == element ) {
                        isDuplicate = true;
                        break;
                    }
                }

                if ( isDuplicate ) {
                    let valueAsString = invalidValuesAsString( value );

                    throw new Error(`${key} is not unique: ${ valueAsString }`);
                }
            });
        }

        return true;
    }

    toJSON(value) {
        return value.map(item => 
            this.element.toJSON( item )
        );
    }

    equal(selfArr, otherArr, stack) {
        if ( selfArr == null ) {
            return otherArr === null;
        }

        if ( !Array.isArray(otherArr) ) {
            return false;
        }

        if ( selfArr.length != otherArr.length ) {
            return false;
        }

        // stop circular recursion
        let stacked = stack.get(selfArr);
        if ( stacked ) {
            return stacked == otherArr;
        }
        stack.add( selfArr, otherArr );


        for (let i = 0, n = selfArr.length; i < n; i++) {
            let selfItem = selfArr[ i ];
            let otherItem = otherArr[ i ];
            let isEqual = this.element.equal( selfItem, otherItem, stack );

            if ( !isEqual ) {
                return false;
            }
        }

        return true;
    }
}

Type.registerType("array", ArrayType);

module.exports = ArrayType;
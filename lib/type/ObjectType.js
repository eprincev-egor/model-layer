"use strict";

const Type = require("./Type");
const {invalidValuesAsString} = require("../utils");

class ObjectType extends Type {

    static prepareDescription(description) {
        let isObject = (
            description.type &&
            typeof description.type == "object" &&
            description.type.constructor === Object
        );

        if ( isObject ) {
            let elementType = description.type.element;
            
            description.type = "object";
            description.element = elementType;
        }


        if ( description.type == "object" ) {
            // prepare element description
            description.element = Type.create( description.element || "*" );
        }
    }


    constructor({
        nullAsEmpty = false, 
        emptyAsNull = false,
        element,
        ... params
    }) {
        super(params);

        this.element = element;
        this.nullAsEmpty = nullAsEmpty;
        this.emptyAsNull = emptyAsNull;
    }

    prepare(originalObject, modelKey) {
        if ( originalObject == null ) {
            if ( this.nullAsEmpty ) {
                let value = {};
                Object.freeze(value);
    
                return value;
            }
            return null;
        }
    
        let isObject = (
            typeof originalObject == "object" &&
            !Array.isArray( originalObject ) &&
            !(originalObject instanceof RegExp)
        );
    
        if ( !isObject ) {
            let valueAsString = invalidValuesAsString( originalObject );
    
            throw new Error(`invalid object for ${modelKey}: ${valueAsString}`);
        }
        
        let object = {};
        let isEmpty = true;
        let elementDescription = this.element;
        let elementTypeAsString = elementDescription.typeAsString();
    
        for (let key in originalObject) {
            let element = originalObject[ key ];
    
            try {
                element = elementDescription.prepare( element, key );
            } catch(err) {
                let valueAsString = invalidValuesAsString( originalObject );
    
                throw new Error(`invalid object[${ elementTypeAsString }] for ${modelKey}: ${valueAsString},\n ${err.message}`);
            }
    
            object[ key ] = element;
    
            isEmpty = false;
        }
    
        if ( this.emptyAsNull ) {
            if ( isEmpty ) {
                return null;
            }
        }
    
        Object.freeze( object );
    
        return object;
    }

    toJSON(value) {
        let obj = value;
        let json = {};

        for (let key in obj) {
            let value = obj[ key ];
            json[ key ] = this.element.toJSON( value );
        }

        return json;
    }
}

Type.registerType("object", ObjectType);

module.exports = ObjectType;
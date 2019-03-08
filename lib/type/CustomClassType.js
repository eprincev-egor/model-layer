"use strict";

const Type = require("./Type");
const Model = require("../Model");
const {invalidValuesAsString} = require("../utils");


class CustomClassType extends Type {
    static prepareDescription(description) {
        
        let isCustomClass = (
            typeof description.type == "function" &&
            !(description.type.prototype instanceof Model) &&
            description.type !== Model
        );
        
        if ( !isCustomClass ) {
            return;
        }

        let CustomClass = description.type;
        description.type = "CustomClass";
        description.CustomClass = CustomClass;
    }


    constructor({
        CustomClass,
        nullAsEmpty = false, 
        emptyAsNull = false,
        ...params
    }) {
        super(params);

        this.nullAsEmpty = nullAsEmpty;
        this.emptyAsNull = emptyAsNull;
        this.CustomClass = CustomClass;
    }

    prepare(value, key) {
        if ( value == null ) {
            return null;
        }
    
        let CustomClass = this.CustomClass;
        let className = CustomClass.name;
    
        if ( value instanceof CustomClass ) {
            return value;
        }
    
        let valueAsString = invalidValuesAsString( value );
    
        throw new Error(`invalid ${ className } for ${ key }: ${ valueAsString }`);
    }

    typeAsString() {
        return this.CustomClass.name;
    }

    toJSON(value) {
        if ( typeof value.toJSON == "function" ) {
            return value.toJSON();
        }

        return value;
    }

    clone(value) {
        if ( typeof value.clone == "function" ) {
            return value.clone();
        }

        return value;
    }
}

Type.registerType("CustomClass", CustomClassType);

module.exports = CustomClassType;
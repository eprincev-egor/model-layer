"use strict";

const Type = require("./Type");
const Model = require("../Model");
const {invalidValuesAsString, isNaN} = require("../utils");

class ModelType extends Type {

    static prepareDescription(description) {
        
        let isCustomModel = (
            typeof description.type == "function" &&
            description.type.prototype instanceof Model
        );
        
        if ( !isCustomModel ) {
            return;
        }

        let CustomModel = description.type;
        description.type = "model";
        description.Model = CustomModel;
    }

    constructor({
        Model,
        ...params
    }) {
        super(params);

        this.Model = Model;
    }

    prepare(value, key, model) {
        if ( value == null ) {
            return null;
        }
    
        let CustomModel = this.Model;
        let className = CustomModel.name;
    
        if ( value instanceof CustomModel ) {
            value.parent = model;
            return value;
        }
    
        if ( 
            isNaN(value) ||
            typeof value == "boolean" ||
            typeof value == "number" ||
            typeof value == "string" ||
            value instanceof Date ||
            value instanceof RegExp ||
            Array.isArray(value)
        ) {
            let valueAsString = invalidValuesAsString( value );
    
            throw new Error(`invalid ${ className } for ${key}: ${valueAsString}`);
        }
    
        try {
            value = new CustomModel( value );
        } catch(err) {
            let valueAsString = invalidValuesAsString( value );
    
            // show child error
            throw new Error(`invalid ${ className } for ${key}: ${valueAsString},\n ${err.message}`);
        }
        
    
        value.parent = model;
        return value;
    }

    typeAsString() {
        return this.Model.name;
    }

    toJSON(value) {
        return value.toJSON();
    }
}

Type.registerType("model", ModelType);

module.exports = ModelType;
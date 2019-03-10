"use strict";

const Type = require("./Type");
const Model = require("../Model");
const {invalidValuesAsString, isNaN, MODELS, eol} = require("../utils");

class ModelType extends Type {

    static prepareDescription(description) {
        
        let isCustomModel = (
            typeof description.type == "function" &&
            description.type.prototype instanceof Model
        );
        
        if ( isCustomModel ) {
            let CustomModel = description.type;
            description.type = "model";
            description.Models = [CustomModel];
        }


        let isManyModels = (
            description.type instanceof MODELS
        );
        if ( isManyModels ) {
            let Models = description.type.Models;
            description.type = "model";
            description.Models = Models;
        }
    }

    constructor({
        Models,
        ...params
    }) {
        super(params);

        this.Models = Models;

        if ( 
            params.hasOwnProperty("constructor") &&
            typeof params.constructor == "function" 
        ) {
            this.getConstructorByData = params.constructor;
        }
        else {
            const BaseModel = Models[0];
            this.getConstructorByData = () => BaseModel;
        }
    }

    prepare(value, key, model) {
        if ( value == null ) {
            return null;
        }
    
        for (let i = 0, n = this.Models.length; i < n; i++) {
            let CustomModel = this.Models[ i ];

            if ( value instanceof CustomModel ) {
                value.parent = model;
                return value;
            }
        }
        
    
        let BaseModel = this.Models[0];
        let className = BaseModel.name;
    
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

        
        let CustomModel = this.getConstructorByData( value ) || BaseModel;
        
        try {
            value = new CustomModel( value );
        } catch(err) {
            let valueAsString = invalidValuesAsString( value );
    
            // show child error
            throw new Error(`invalid ${ className } for ${key}: ${valueAsString},${eol} ${err.message}`);
        }
        
    
        value.parent = model;
        return value;
    }

    typeAsString() {
        return this.Models[0].name;
    }

    toJSON(value) {
        return value.toJSON();
    }

    equal(selfModel, otherModel, stack) {
        if ( selfModel == null ) {
            return otherModel === null;
        }

        if ( !(otherModel instanceof Model) ) {
            return false;
        }

        // stop circular recursion
        let stacked = stack.get(selfModel);
        if ( stacked ) {
            return stacked == otherModel;
        }
        stack.add(selfModel, otherModel);
        
        return selfModel.equal( otherModel, stack );
    }
}

Type.registerType("model", ModelType);

module.exports = ModelType;
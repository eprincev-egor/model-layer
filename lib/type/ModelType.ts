

import {Type, ITypeParams} from "./Type";
import {Model, ISimpleObject} from "../Model";
import {invalidValuesAsString, isNaN, MODELS, eol} from "../utils";

interface IModelTypeParams extends ITypeParams {
    Models: any[];
}

export default class ModelType extends Type {

    public static prepareDescription(description) {
        
        const isCustomModel = (
            typeof description.type === "function" &&
            description.type.prototype instanceof Model
        );
        
        if ( isCustomModel ) {
            const CustomModel = description.type;
            description.type = "model";
            description.Models = [CustomModel];
        }


        const isManyModels = (
            description.type instanceof MODELS
        );
        if ( isManyModels ) {
            const Models = description.type.Models;
            description.type = "model";
            description.Models = Models;
        }
    }

    public Models: any[];
    public getConstructorByData: (model: Model<any>) => (new() => Model<any>);

    constructor(params: IModelTypeParams) {
        super(params);

        this.Models = params.Models;

        if ( 
            params.hasOwnProperty("constructor") &&
            typeof params.constructor === "function" 
        ) {
            this.getConstructorByData = (
                params.constructor as (model: Model<any>) => (new() => Model<any>)
            );
        }
        else {
            const BaseModel = params.Models[0];
            this.getConstructorByData = () => BaseModel;
        }
    }

    public prepare(value, key, model) {
        if ( value == null ) {
            return null;
        }
    
        for (let i = 0, n = this.Models.length; i < n; i++) {
            const SomeModel = this.Models[ i ];

            if ( value instanceof SomeModel ) {
                value.parent = model;
                return value;
            }
        }
        
    
        const BaseModel = this.Models[0];
        const className = BaseModel.name;
    
        if ( 
            isNaN(value) ||
            typeof value === "boolean" ||
            typeof value === "number" ||
            typeof value === "string" ||
            value instanceof Date ||
            value instanceof RegExp ||
            Array.isArray(value)
        ) {
            const valueAsString = invalidValuesAsString( value );
    
            throw new Error(`invalid ${ className } for ${key}: ${valueAsString}`);
        }

        
        const CustomModel = this.getConstructorByData( value ) || BaseModel;
        
        try {
            value = new CustomModel( value );
        } catch (err) {
            const valueAsString = invalidValuesAsString( value );
    
            // show child error
            throw new Error(`invalid ${ className } for ${key}: ${valueAsString},${eol} ${err.message}`);
        }
        
    
        value.parent = model;
        return value;
    }

    public typeAsString() {
        return this.Models[0].name;
    }

    public toJSON(model) {
        return model.toJSON();
    }

    public clone(model) {
        return model.clone();
    }

    public equal(selfModel, otherModel, stack) {
        if ( selfModel == null ) {
            return otherModel === null;
        }

        if ( !otherModel ) {
            return false;
        }

        // stop circular recursion
        const stacked = stack.get(selfModel);
        if ( stacked ) {
            return stacked === otherModel;
        }
        stack.add(selfModel, otherModel);
        
        return selfModel.equal( otherModel, stack );
    }
}

Type.registerType("model", ModelType);


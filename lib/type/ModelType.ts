

import {Type, ITypeParams, IType} from "./Type";
import {Model} from "../Model";
import {invalidValuesAsString, isNaN, MODELS, eol} from "../utils";

export function MakeModelType<TModelConstructor>(
    params: ITypeParams & 
    {Model: TModelConstructor}
): TModelConstructor {
    return {
        ...params,
        type: "model"
    } as any;
}

export class ModelType extends Type {

    static prepareDescription(description) {
        
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

    Model: new (...args: any) => Model;
    getConstructorByData: (model: Model) => (new() => Model);

    constructor(params: ITypeParams & {Model: new (...args: any) => Model}) {
        super(params);

        this.Model = params.Model;

        if ( 
            params.hasOwnProperty("constructor") &&
            typeof params.constructor === "function" 
        ) {
            this.getConstructorByData = (
                params.constructor as (model: Model<any>) => (new() => Model<any>)
            );
        }
        else {
            const BaseModel = params.Model[0];
            this.getConstructorByData = () => BaseModel;
        }
    }

    prepare(value, key, model) {
        if ( value == null ) {
            return null;
        }
    
        const BaseModel = this.Model;
        const className = BaseModel.name;


        if ( value instanceof BaseModel ) {
            value.parent = model;
            return value;
        }
        
    
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

    typeAsString() {
        return this.Model.name;
    }

    toJSON(model) {
        return model.toJSON();
    }

    clone(model) {
        return model.clone();
    }

    equal(selfModel, otherModel, stack) {
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

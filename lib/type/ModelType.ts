

import {Type, ITypeParams} from "./Type";
import {Model} from "../Model";
import {invalidValuesAsString, isNaN, eol} from "../utils";
import {
    CircularStructureToJSONError,
    InvalidModelError
} from "../errors";

export function MakeModelType<TModelConstructor extends (new (...args) => Model<any>)>(
    params: ITypeParams & 
    {
        Model: TModelConstructor;
        default?: () => InstanceType<TModelConstructor>;
    }
): TModelConstructor {
    return {
        ...params,
        type: "model"
    } as any;
}
MakeModelType.isTypeHelper = true;

export class ModelType extends Type {

    static prepareDescription(description) {
        
        const isCustomModel = (
            typeof description.type === "function" &&
            description.type.prototype instanceof Model
        );
        
        if ( isCustomModel ) {
            const CustomModel = description.type;
            description.type = "model";
            description.Model = CustomModel;
        }
    }

    Model: new (...args: any) => Model<any>;

    constructor(params: ITypeParams & {Model: new (...args: any) => Model<any>}) {
        super(params);

        this.Model = params.Model;
    }

    prepare(value, key, model) {
        if ( value == null ) {
            return null;
        }
    
        const CustomModel = this.Model;
        const className = CustomModel.name;


        if ( value instanceof CustomModel ) {
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
    
            throw new InvalidModelError({
                key,
                className,
                invalidValue: valueAsString
            });
        }

        
        try {
            value = new CustomModel( value );
        } catch (err) {
            const valueAsString = invalidValuesAsString( value );
    
            // show child error
            throw new InvalidModelError({
                key,
                className,
                invalidValue: valueAsString,
                modelError: err.message
            });
        }
        
    
        value.parent = model;
        return value;
    }

    typeAsString() {
        return this.Model.name;
    }

    toJSON(model, stack) {

        if ( stack.includes(model) ) {
            throw new CircularStructureToJSONError({});
        }
        stack.push(model);
    
        return model.toJSON(stack);
    }

    clone(model, stack) {
        return model.clone(stack);
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

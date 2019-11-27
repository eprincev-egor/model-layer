

import {Type, ITypeParams} from "./Type";
import {Model} from "../Model";
import Collection from "../Collection";
import {invalidValuesAsString} from "../utils";

interface ICustomClassTypeParams extends ITypeParams {
    CustomClass: any;
}

export default class CustomClassType extends Type {
    static prepareDescription(description) {
        
        const isCustomClass = (
            typeof description.type === "function" &&
            !(description.type.prototype instanceof Model) &&
            !(description.type.prototype instanceof Collection) &&
            description.type !== Model
        );
        
        if ( !isCustomClass ) {
            return;
        }

        const CustomClass = description.type;
        description.type = "CustomClass";
        description.CustomClass = CustomClass;
    }

    CustomClass: any;
    nullAsEmpty: boolean;
    emptyAsNull: boolean;

    constructor(params: ICustomClassTypeParams) {
        super(params);

        this.CustomClass = params.CustomClass;
    }

    prepare(value, key) {
        if ( value == null ) {
            return null;
        }
    
        const CustomClass = this.CustomClass;
        const className = CustomClass.name;
    
        if ( value instanceof CustomClass ) {
            return value;
        }
    
        const valueAsString = invalidValuesAsString( value );
    
        throw new Error(`invalid ${ className } for ${ key }: ${ valueAsString }`);
    }

    typeAsString() {
        return this.CustomClass.name;
    }

    toJSON(value) {
        if ( typeof value.toJSON === "function" ) {
            return value.toJSON();
        }

        return value;
    }

    clone(value) {
        if ( typeof value.clone === "function" ) {
            return value.clone();
        }

        return value;
    }
}



import {Type, ITypeParams} from "./Type";
import {Model} from "../Model";
import Collection from "../Collection";
import {invalidValuesAsString} from "../utils";

interface ICustomClassTypeParams extends ITypeParams {
    CustomClass: any;
}

export default class CustomClassType extends Type {
    public static prepareDescription(description) {
        
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

    public CustomClass: any;
    public nullAsEmpty: boolean;
    public emptyAsNull: boolean;

    constructor(params: ICustomClassTypeParams) {
        super(params);

        this.CustomClass = params.CustomClass;
    }

    public prepare(value, key) {
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

    public typeAsString() {
        return this.CustomClass.name;
    }

    public toJSON(value) {
        if ( typeof value.toJSON === "function" ) {
            return value.toJSON();
        }

        return value;
    }

    public clone(value) {
        if ( typeof value.clone === "function" ) {
            return value.clone();
        }

        return value;
    }
}

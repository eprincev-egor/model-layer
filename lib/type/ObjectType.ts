

import {Type, IType, ITypeParams, TInstanceOrT} from "./Type";
import {invalidValuesAsString, isObject, eol} from "../utils";
import {
    InvalidObjectError,
    ConflictNullAndEmptyObjectParameterError,
    InvalidObjectElementError
} from "../errors";

export interface IObjectTypeParams extends ITypeParams {
    nullAsEmpty?: boolean;
    emptyAsNull?: boolean;
    element?: any;
    prepare?: (value: any, key: string, model: any) => IObject<this["element"]>;
    validate?: 
        ((value: IObject<this["element"]>, key: string) => boolean) |
        RegExp
    ;
    default?: IObject<this["element"]> | (() => IObject<this["element"]>);
}

interface IObject<T> {
    [key: string]: T;
}

export interface IObjectType<T extends IType> extends IType {
    <TElement extends IType | (new (...args: any) => IType)>(
        params: IObjectTypeParams & 
        {element: TElement}
    ): IObjectType< TInstanceOrT<TElement> >;

    TOutput: IObject< T["TOutput"] >;
    TInput: IObject< T["TInput"] >;
    TJson: IObject< T["TJson"] >;
}

export class ObjectType extends Type {

    static prepareDescription(description: any, key: string) {
        if ( description.type === "object" ) {
            // prepare element description
            description.element = Type.create( description.element || "any", key );
        }
    }

    nullAsEmpty: boolean;
    emptyAsNull: boolean;
    element: any;

    constructor({
        nullAsEmpty = false,
        emptyAsNull = false,
        element,
        ...otherParams
    }: IObjectTypeParams) {
        super(otherParams);

        this.element = element;
        this.nullAsEmpty = nullAsEmpty;
        this.emptyAsNull = emptyAsNull;

        if ( nullAsEmpty && emptyAsNull ) {
            throw new ConflictNullAndEmptyObjectParameterError({});
        }
    }

    prepare(originalObject: any, modelKey: string, parentModel: any) {
        if ( originalObject == null ) {
            if ( this.nullAsEmpty ) {
                const value = {};
                Object.freeze(value);
    
                return value;
            }
            return null;
        }
    
        const elementDescription = this.element;
        const elementTypeAsString = elementDescription.typeAsString();

        const isObjectValue = (
            typeof originalObject === "object" &&
            !Array.isArray( originalObject ) &&
            !(originalObject instanceof RegExp)
        );
    
        if ( !isObjectValue ) {
            const valueAsString = invalidValuesAsString( originalObject );
    
            throw new InvalidObjectError({
                elementType: elementTypeAsString,
                key: modelKey,
                invalidValue: valueAsString
            });
        }
        
        const object: any = {};
        let isEmpty = true;
    
        for (const key in originalObject) {
            let element = originalObject[ key ];
    
            try {
                element = elementDescription.prepare( element, key, parentModel );
            } catch (err) {
                const valueAsString = invalidValuesAsString( originalObject );
    
                throw new InvalidObjectElementError({
                    modelKey,
                    objectKey: key,
                    elementType: elementTypeAsString,
                    invalidValue: valueAsString,
                    childError: err.message
                });
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

    toJSON(value: any, stack: any) {
        const obj = value;
        const json: any = {};

        for (const key in obj) {
            const objValue = obj[ key ];
            json[ key ] = this.element.toJSON( objValue, [...stack] );
        }

        return json;
    }

    clone(value: any, stack: any, parentModel: any) {
        const obj = value;
        const json: any = {};

        for (const key in obj) {
            const objValue = obj[ key ];
            json[ key ] = this.element.clone( objValue, stack, parentModel );
        }

        return json;
    }

    equal(selfObj: any, otherObj: any, stack: any) {
        if ( selfObj == null ) {
            return otherObj === null;
        }

        if ( !isObject(otherObj) ) {
            return false;
        }

        for (const key in selfObj) {
            const selfValue = selfObj[ key ];
            const otherValue = otherObj[ key ];
            const isEqual = this.element.equal( selfValue, otherValue, stack );

            if ( !isEqual ) {
                return false;
            }
        }

        // check additional keys from otherObj
        for (const key in otherObj) {
            if ( key in selfObj) {
                continue;
            }

            // exists unknown property for selfObj
            return false;
        }

        return true;
    }
}

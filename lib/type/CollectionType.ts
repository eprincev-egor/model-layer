

import {Type, ITypeParams} from "./Type";
import Collection from "../Collection";
import {invalidValuesAsString} from "../utils";
import {
    CircularStructureToJSONError,
    InvalidCollectionError
} from "../errors";

export interface ICollectionTypeParams extends ITypeParams {
    Collection: new (...args: any) => Collection<any>;
    nullAsEmpty?: boolean;
    default?: () => InstanceType<this["Collection"]>;
}

export function MakeCollectionType<TCollectionConstructor>(
    params: ICollectionTypeParams & 
    {Collection: TCollectionConstructor}
): TCollectionConstructor {
    return {
        ...params,
        type: "collection"
    } as any;
}
MakeCollectionType.isTypeHelper = true;

export class CollectionType extends Type {
    static prepareDescription(description: any) {
        
        const isCollection = (
            typeof description.type === "function" &&
            description.type.prototype instanceof Collection
        );
        
        if ( !isCollection ) {
            return;
        }

        const CustomCollection = description.type;
        description.type = "collection";
        description.Collection = CustomCollection;
    }

    Collection: any;
    nullAsEmpty: boolean;

    constructor(params: ICollectionTypeParams) {
        super(params);

        this.nullAsEmpty = !!params.nullAsEmpty;
        this.Collection = params.Collection;
    }

    prepare(value: any, key: any) {
        if ( value == null ) {
            if ( this.nullAsEmpty ) {
                value = [];
            } 
            else {
                return null;
            }
        }
    
        const CustomCollection = this.Collection;
        const className = CustomCollection.name;
    
        if ( value instanceof CustomCollection ) {
            return value;
        }
        if ( Array.isArray(value) ) {
            value = new CustomCollection( value );
            return value;
        }
    
        const valueAsString = invalidValuesAsString( value );
    
        throw new InvalidCollectionError({
            className,
            key,
            invalidValue: valueAsString
        });
    }

    typeAsString() {
        return "collection " + this.Collection.name;
    }

    toJSON(collection: any, stack: any) {
        if ( stack.includes(collection) ) {
            throw new CircularStructureToJSONError({});
        }
        stack.push(collection);

        return collection.toJSON(stack);
    }

    clone(collection: any, stack: any) {
        return collection.clone(stack);
    }

    equal(selfCollection: any, otherCollection: any, stack: any) {
        if ( selfCollection == null ) {
            return otherCollection === null;
        }

        return selfCollection.equal( otherCollection, stack );
    }
}



import {Type, ITypeParams} from "./Type";
import Collection from "../Collection";
import {invalidValuesAsString} from "../utils";

export interface ICollectionTypeParams extends ITypeParams {
    Collection: any;
    nullAsEmpty?: boolean;
}

export class CollectionType extends Type {
    static prepareDescription(description) {
        
        const isCollection = (
            typeof description.type === "function" &&
            description.type.prototype instanceof Collection
        );
        
        if ( !isCollection ) {
            return;
        }

        const CustomCollection = description.type;
        description.type = "Collection";
        description.Collection = CustomCollection;
    }

    Collection: any;
    nullAsEmpty: boolean;

    constructor(params: ICollectionTypeParams) {
        super(params);

        this.nullAsEmpty = params.nullAsEmpty;
        this.Collection = params.Collection;
    }

    prepare(value, key) {
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
    
        throw new Error(`invalid collection ${ className } for ${ key }: ${ valueAsString }`);
    }

    typeAsString() {
        return "collection " + this.Collection.name;
    }

    toJSON(collection) {
        return collection.toJSON();
    }

    clone(collection) {
        return collection.clone();
    }

    equal(selfCollection, otherCollection, stack) {
        if ( selfCollection == null ) {
            return otherCollection === null;
        }

        return selfCollection.equal( otherCollection, stack );
    }
}

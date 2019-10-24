"use strict";

import {Type, ITypeParams} from "./Type";
import Collection from "../Collection";
import {invalidValuesAsString} from "../utils";

interface ICollectionTypeParams extends ITypeParams {
    Collection: any;
    nullAsEmpty?: boolean;
}

class CollectionType extends Type {
    public static prepareDescription(description) {
        
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

    public Collection: any;
    public nullAsEmpty: boolean;

    constructor(params: ICollectionTypeParams) {
        super(params);

        this.nullAsEmpty = params.nullAsEmpty;
        this.Collection = params.Collection;
    }

    public prepare(value, key) {
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

    public typeAsString() {
        return "collection " + this.Collection.name;
    }

    public toJSON(collection) {
        return collection.toJSON();
    }

    public clone(collection) {
        return collection.clone();
    }

    public equal(selfCollection, otherCollection, stack) {
        if ( selfCollection == null ) {
            return otherCollection === null;
        }

        return selfCollection.equal( otherCollection, stack );
    }
}

Type.registerType("Collection", CollectionType);

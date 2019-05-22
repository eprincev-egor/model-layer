"use strict";

const Type = require("./Type");
const Collection = require("../Collection");
const {invalidValuesAsString} = require("../utils");


class CollectionType extends Type {
    static prepareDescription(description) {
        
        let isCollection = (
            typeof description.type == "function" &&
            description.type.prototype instanceof Collection
        );
        
        if ( !isCollection ) {
            return;
        }

        let CustomCollection = description.type;
        description.type = "Collection";
        description.Collection = CustomCollection;
    }


    constructor({
        Collection,
        nullAsEmpty = false, 
        ...params
    }) {
        super(params);

        this.nullAsEmpty = nullAsEmpty;
        this.Collection = Collection;
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
    
        let CustomCollection = this.Collection;
        let className = CustomCollection.name;
    
        if ( value instanceof CustomCollection ) {
            return value;
        }
        if ( Array.isArray(value) ) {
            value = new CustomCollection( value );
            return value;
        }
    
        let valueAsString = invalidValuesAsString( value );
    
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

Type.registerType("Collection", CollectionType);

module.exports = CollectionType;
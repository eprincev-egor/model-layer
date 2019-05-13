"use strict";

const EventEmitter = require("events");
const Model = require("./Model");
const {invalidValuesAsString, isPlainObject} = require("./utils");

class Collection extends EventEmitter {
    constructor(rows) {
        super();

        if ( !this.constructor.prototype.hasOwnProperty( "Model" ) ) {
            const structure = this.constructor.structure;
            let CustomModel;

            let result = structure();
            if ( result && result.prototype instanceof Model ) {
                CustomModel = result;
            }
            else {
                CustomModel = class extends Model {
                    static structure() {
                        return result;
                    }
                };
            }

            this.constructor.prototype.Model = CustomModel;
        }

        this.models = [];

        if ( rows instanceof Array ) {
            rows.forEach(row => {
                let model = this.prepareRow( row );
                this.models.push( model );
            });

            this.length = rows.length;
        } else {
            this.length = 0;
        }
    }

    at(index, model) {
        // set
        if ( model ) {
            model = this.prepareRow( model );
            this.models[ index ] = model;
            this.length = this.models.length;
        } 
        // get
        else {
            return this.models[ index ];
        }
    }

    prepareRow(row) {
        const CustomModel = this.Model;
        let model;
        
        if ( row instanceof CustomModel ) {
            model = row;
            return model;
        }

        if ( row instanceof Model ) {
            row = row.data;
        }
        
        if ( isPlainObject(row) ) {
            model = new CustomModel( row );
        }
        else {
            throw new Error( `invalid model: ${ invalidValuesAsString( row ) }` );
        }

        return model;
    }

    push(...models) {
        if ( !models.length ) {
            return;
        }

        for (let i = 0, n = models.length; i < n; i++) {
            let model = models[i];

            model = this.prepareRow( model );
            this.models.push( model );
        }
        
        this.length = this.models.length;
    }

    forEach(iteration, context) {
        this.models.forEach(iteration, context || this);
    }

    each(iteration, context) {
        this.models.forEach(iteration, context || this);
    }

    find(iteration, context) {
        return this.models.find(iteration, context || this);
    }

    findIndex(iteration, context) {
        return this.models.findIndex(iteration, context || this);
    }

    filter(iteration, context) {
        return this.models.filter(iteration, context || this);
    }

    map(iteration, context) {
        return this.models.map(iteration, context || this);
    }

    reduce(iteration, initialValue) {
        return this.models.reduce(iteration, initialValue);
    }

    reduceRight(iteration, initialValue) {
        return this.models.reduceRight(iteration, initialValue);
    }

    every(iteration, context) {
        return this.models.every(iteration, context || this);
    }

    some(iteration, context) {
        return this.models.some(iteration, context || this);
    }

    slice(begin, end) {
        return this.models.slice(begin, end);
    }

    indexOf(searchElement, fromIndex) {
        return this.models.indexOf(searchElement, fromIndex);
    }

    lastIndexOf(searchElement, fromIndex) {
        if ( arguments.length == 2 ) {
            return this.models.lastIndexOf(searchElement, fromIndex);
        }
        else {
            return this.models.lastIndexOf(searchElement);
        }
    }

    includes(searchElement, fromIndex) {
        return this.models.includes(searchElement, fromIndex);
    }

    pop() {
        let model = this.models.pop();
        this.length = this.models.length;

        return model;
    }

    shift() {
        let model = this.models.shift();
        this.length = this.models.length;

        return model;
    }

    unshift(...models) {
        if ( !models.length ) {
            return;
        }

        let preparedModels = [];
        for (let i = 0, n = models.length; i < n; i++) {
            let model = models[i];

            model = this.prepareRow( model );
            preparedModels.push( model );
        }

        this.models.unshift.apply(this.models, preparedModels);
        
        this.length = this.models.length;
    }

    sort(compareFunctionOrKey, ...otherKeys) {

        if ( typeof compareFunctionOrKey === "string" ) {
            const key = compareFunctionOrKey;
            
            // order by key asc
            if ( !otherKeys.length ) {
                this.models.sort((modelA, modelB) => {
                    let valueA = modelA.get(key);
                    let valueB = modelB.get(key);
    
                    return valueA > valueB ? 1 : -1;
                });
            }

            // order by key1 asc, key2 asc, ...
            else {
                const keys = [key].concat( otherKeys );

                this.models.sort((modelA, modelB) => {

                    for (let i = 0, n = keys.length; i < n; i++) {
                        let key = keys[i];

                        let valueA = modelA.get(key);
                        let valueB = modelB.get(key);
    
                        if ( valueA > valueB ) {
                            return 1;
                        }

                        if ( valueA < valueB ) {
                            return -1;
                        }
                    }
                });
            }
            
        }
        
        // sort by compareFunction( (modelA, modelB) => ... )
        else if ( typeof compareFunctionOrKey == "function" ) {
            const compareFunction = compareFunctionOrKey;
            this.models.sort(compareFunction);
        }

        else {
            let invalidValue = invalidValuesAsString( compareFunctionOrKey );
            throw new Error(`invalid compareFunction or key: ${ invalidValue }`);
        }
    }
    
    reverse() {
        this.models.reverse();
        return this;
    }

    concat(...values) {
        
        let CustomCollection = this.constructor;
        let models = this.models;

        for (let i = 0, n = values.length; i < n; i++) {
            let rowsOrCollection = values[ i ];

            if ( rowsOrCollection instanceof Collection ) {
                let collection = rowsOrCollection;
                models = models.concat( collection.models );
            } 
            else {
                let rows = rowsOrCollection;
                models = models.concat( rows );
            }
        }

        return new CustomCollection(models);
    }

    reset() {
        this.models = [];
        this.length = 0;
    }

    first() {
        return this.models[0];
    }

    last() {
        return this.models[ this.models.length - 1 ];
    }
}

module.exports = Collection;
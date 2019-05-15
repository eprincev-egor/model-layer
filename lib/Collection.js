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
            let removedModel = this.models[ index ];

            model = this.prepareRow( model );
            this.models[ index ] = model;
            this.length = this.models.length;

            if ( removedModel ) {
                this.emit("remove", {
                    type: "remove",
                    collection: this,
                    model: removedModel
                });
            }

            this.emit("add", {
                type: "add",
                model,
                collection: this
            });
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

        let addedModels = [];
        for (let i = 0, n = models.length; i < n; i++) {
            let model = models[i];

            model = this.prepareRow( model );
            addedModels.push( model );
            this.models.push( model );
        }
        
        this.length = this.models.length;

        for (let i = 0, n = addedModels.length; i < n; i++) {
            let model = addedModels[i];
            
            this.emit("add", {
                type: "add",
                model,
                collection: this
            });
        }
    }

    add(...models) {
        if ( !models.length ) {
            return;
        }

        let inputModels = [];
        for (let i = 0, n = models.length; i < n; i++) {
            let modelOrArr = models[i];

            if ( Array.isArray(modelOrArr) ) {
                let arr = modelOrArr;
                inputModels = inputModels.concat( arr );
            }
            else {
                let model = modelOrArr;
                inputModels.push( model );
            }
        }

        let addedModels = [];
        for (let i = 0, n = inputModels.length; i < n; i++) {
            let model = inputModels[i];

            model = this.prepareRow( model );
            addedModels.push( model );
            this.models.push( model );
        }
        
        this.length = this.models.length;

        for (let i = 0, n = addedModels.length; i < n; i++) {
            let model = addedModels[i];
            
            this.emit("add", {
                type: "add",
                model,
                collection: this
            });
        }
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

    flatMap(iteration, context) {
        let result = this.models.map(iteration, context || this);
            
        let output = [];
        for (let i = 0, n = result.length; i < n; i++) {
            let elem = result[ i ];

            if ( Array.isArray(elem) ) {
                output = output.concat( elem );
            }
            else {
                output.push( elem );
            }
        }

        return output;
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

    flat() {
        return this.models.slice();
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
        
        this.emit("remove", {
            type: "remove",
            collection: this,
            model
        });

        return model;
    }

    shift() {
        let model = this.models.shift();
        this.length = this.models.length;

        this.emit("remove", {
            type: "remove",
            collection: this,
            model
        });

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

        for (let i = 0, n = preparedModels.length; i < n; i++) {
            let model = preparedModels[i];
            
            this.emit("add", {
                type: "add",
                model,
                collection: this
            });
        }
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

    join(separator) {
        return this.models.join(separator);
    }

    // https://developer.mozilla.org/en/docs/Web/JavaScript/Reference/Global_Objects/Array/fill
    fill(row, start, end) {
        // Step 3-5.
        let len = this.length >>> 0;

        // Step 6-7.
        start = arguments[1];
        let relativeStart = start >> 0;

        // Step 8.
        let k = relativeStart < 0 ?
            Math.max(len + relativeStart, 0) :
            Math.min(relativeStart, len);

        // Step 9-10.
        end = arguments[2];
        let relativeEnd = end === undefined ?
            len : end >> 0;

        // Step 11.
        let final = relativeEnd < 0 ?
            Math.max(len + relativeEnd, 0) :
            Math.min(relativeEnd, len);

        // Step 12.
        let addedModels = [];
        while (k < final) {
            let model = this.prepareRow(row);

            addedModels.push(model);
            this.models[k] = model;
            k++;
        }

        for (let i = 0, n = addedModels.length; i < n; i++) {
            let model = addedModels[i];
            
            this.emit("add", {
                type: "add",
                model,
                collection: this
            });
        }

        // Step 13.
        return this;
    }

    splice(start, deleteCount, ...items) {
        if ( items.length ) {
            items = items.map(row => 
                this.prepareRow(row)
            );
        }

        let removedModels = this.models.slice(start, start + deleteCount);

        this.models.splice(start, deleteCount, ...items);
        this.length = this.models.length;

        for (let i = 0, n = removedModels.length; i < n; i++) {
            let model = removedModels[ i ];

            this.emit("remove", {
                type: "remove",
                collection: this,
                model
            });
        }

        for (let i = 0, n = items.length; i < n; i++) {
            let model = items[i];
            
            this.emit("add", {
                type: "add",
                model,
                collection: this
            });
        }
    }

    reset() {
        let removedModels = this.models.slice();

        this.models = [];
        this.length = 0;

        for (let i = 0, n = removedModels.length; i < n; i++) {
            let model = removedModels[ i ];

            this.emit("remove", {
                type: "remove",
                collection: this,
                model
            });
        }
    }

    first() {
        return this.models[0];
    }

    last() {
        return this.models[ this.models.length - 1 ];
    }

    create(row) {
        let model = this.prepareRow(row);
        
        this.models.push( model );
        this.length = this.models.length;
        
        this.emit("add", {
            type: "add",
            model,
            collection: this
        });

        return model;
    }

    toJSON() {
        return this.models.map(model =>
            model.toJSON()
        );
    }

    remove(idOrModel) {
        let index = -1;
        let removedModel;
        
        if ( idOrModel instanceof Model ) {
            let model = idOrModel;
            index = this.models.indexOf( model );

            removedModel = model;
        }
        else {
            let id = idOrModel;
            index = this.models.findIndex( model => 
                model.primaryValue == id
            );

            removedModel = this.models[ index ];
        }

        if ( index != -1 ) {
            this.models.splice(index, 1);
            this.length = this.models.length;
        }

        if ( removedModel ) {
            this.emit("remove", {
                type: "remove",
                collection: this,
                model: removedModel
            });
        }
    }

    get(id) {
        return this.find(model => 
            model.primaryValue == id
        );
    }
}

module.exports = Collection;
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

        const CustomModel = this.Model;
        this.models = [];

        if ( rows instanceof Array ) {
            rows.forEach(row => {
                let model = new CustomModel(row);
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
}

module.exports = Collection;
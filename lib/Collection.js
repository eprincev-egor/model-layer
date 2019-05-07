"use strict";

const EventEmitter = require("events");
const Model = require("./Model");

class Collection extends EventEmitter {
    constructor(rows) {
        super();

        if ( !this.constructor.prototype.hasOwnProperty( "Model" ) ) {
            const structure = this.constructor.structure;

            class CustomModel extends Model {
                static structure() {
                    return structure();
                }
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
        if ( model ) {
            if ( !(model instanceof Model) ) {
                let row = model;

                const CustomModel = this.Model;
                model = new CustomModel( row );
            }

            this.models[ index ] = model;
            this.length = this.models.length;
        } else {
            return this.models[ index ];
        }
    }

    push(model) {
        if ( !(model instanceof Model) ) {
            let row = model;

            const CustomModel = this.Model;
            model = new CustomModel( row );
        }

        this.models.push( model );
        this.length = this.models.length;
    }
}

module.exports = Collection;
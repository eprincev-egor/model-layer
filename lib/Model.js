"use strict";

const _ = require("lodash");
const EventEmitter = require("events");

class Model extends EventEmitter {
    static structure() {
        throw new Error(`static ${ this.name }.structure() is not declared`);
    }

    constructor(data) {
        super();

        let structure = this.constructor.structure();
        
        this.data = {};
        if ( !_.isObject(data) ) {
            data = {};
        }
        
        for (let key in structure) {
            let description = structure[ key ];
            if ( _.isString(description) ) {
                description = {
                    type: description
                };
            }

            let value = null;
            if ( "default" in description ) {
                if ( _.isFunction(description.default) ) {
                    value = description.default();
                }
                else {
                    value = description.default;
                }

                // default can be invalid
                value = prepareValue(description, key, value);
            }

            this.data[ key ] = value;

            // throw required error in method .set
            if ( description.required ) {
                if ( !(key in data) ) {
                    data[key] = null;
                }
            }
        }
        
        this.__isInit = true; // do not check const
        this.set(data);
        delete this.__isInit;
        
        // juns love use model.data for set
        // stick on his hands
        Object.freeze( this.data );
    }

    get(key) {
        return this.data[ key ];
    }

    set(keyOrData, value, options) {
        if ( _.isString(keyOrData) ) {
            let key = keyOrData;
            
            this.set({
                [key]: value
            }, options);
            
            return;
        } else {
            options = value;
        }

        options = _.merge({
            onlyValidate: false
        }, options);
        
        let structure = this.constructor.structure();

        let data = keyOrData;
        let newData = {};
        let oldData = this.data;

        // clone old values in oldData
        for (let key in oldData) {
            newData[ key ] = oldData[ key ];
        }

        for (let key in data) {
            let description = structure[ key ];
            if ( _.isString(description) ) {
                description = {
                    type: description
                };
            }

            if ( !description ) {
                throw new Error(`unknown property ${ key }`);
            }

            let value = data[ key ];

            // cast input value to expected format
            value = prepareValue(description, key, value);

            if ( description.required ) {
                if ( value == null ) {
                    throw new Error(`required ${ key }`);
                }
            }

            
            if ( description.validate || description.enum ) {
                if ( value !== null ) {
                    let isValid;

                    if ( description.enum ) {
                        isValid = description.enum.includes( value );
                    }
                    else if ( description.validate instanceof RegExp ) {
                        isValid = description.validate.test( value );
                    } else {
                        isValid = description.validate( value );
                    }

                    if ( !isValid ) {
                        if ( description.type != "number" ) {
                            value = `"${value}"`;
                        }
                        throw new Error(`invalid ${ key }: ${ value }`);
                    }
                }
            }

            let oldValue = oldData[ key ];
            if ( oldValue != value ) {
                if ( description.const ) {
                    if ( !this.__isInit ) {
                        throw new Error(`cannot assign to read only property: ${ key }`);
                    }
                }
            }
            newData[ key ] = value;
        }

        if ( this.prepare ) {
            // modify by reference
            // because it conveniently
            this.prepare( newData );
        }

        let changes = {};
        for (let key in newData) {
            let description = structure[ key ];
            if ( _.isString(description) ) {
                description = {
                    type: description
                };
            }

            let newValue = newData[ key ];
            let oldValue = oldData[ key ];

            // if field has type string,
            // then he must be string or null in anyway!
            if ( this.prepare ) {
                newValue = prepareValue(description, key, newValue);
            }

            if ( newValue !== oldValue ) {
                changes[ key ] = newValue;
                newData[ key ] = newValue;
            }
        }

        let hasChanges = Object.keys( changes ).length > 0;
        if ( !hasChanges ) {
            return;
        }

        // juns love use model.data for set
        // stick on his hands
        Object.freeze(newData);

        if ( this.validate ) {
            this.validate(newData);
        }

        // do not call emit and set newData
        if ( options.onlyValidate ) {
            return;
        }

        this.data = newData;

        for (let key in changes) {
            this.emit("change:" + key, {
                prev: oldData,
                changes
            });
        }

        this.emit("change", {
            prev: oldData,
            changes
        });
    }

    isValid(data) {
        if ( !_.isObject(data) ) {
            throw new Error("data must be are object");
        }

        try {
            this.set(data, {
                onlyValidate: true
            });

            return true;
        } catch(err) {
            return false;
        }
    }

    hasProperty(key) {
        return key in this.data;
    }

    hasValue(key) {
        let value = this.data[ key ];

        if ( value == null ) {
            return false;
        } else {
            return true;
        }
    }

    toJSON() {
        let json = {};

        for (let key in this.data) {
            json[ key ] = this.data[ key ];
        }

        return json;
    }
}

function prepareValue(description, key, value) {
    if ( value == null ) {
        return null;
    }

    if ( description.type == "number" ) {
        value = Model.prepareNumber(description, key, value);
    }
    else if ( description.type == "string" ) {
        value = Model.prepareString(description, key, value);
    }
    else if ( description.type == "boolean" ) {
        value = Model.prepareBoolean(description, key, value);
    }
    else if ( description.type == "date" ) {
        value = Model.prepareDate(description, key, value);
    }


    if ( description.prepare ) {
        if ( value != null ) {
            value = description.prepare( value );
        }
    }

    return value;
}

Model.prepareNumber = function prepareNumber(description, key, value) {
    let preparedValue = +value;

    if ( 
        _.isNaN(preparedValue) ||
        value === false ||
        value === true ||
        _.isArray(value) ||
        // infinity
        preparedValue === 1 / 0 ||
        preparedValue === -1 / 0
    ) {
        if ( _.isArray(value) || _.isObject(value) ) {
            let valueAsString;
            try {
                valueAsString = JSON.stringify(value);
            } catch(err) {
                valueAsString = false;
            }

            if ( valueAsString ) {
                throw new Error(`invalid number for ${key}: ${valueAsString}`);
            }
        }

        throw new Error(`invalid number for ${key}: ${value}`);
    }

    
    if ( "round" in description ) {
        let desc = Math.pow( 10, description.round );

        preparedValue = Math.round(  
            preparedValue * 
            desc
        ) / desc;
    }

    else if ( "floor" in description ) {
        let desc = Math.pow( 10, description.floor );

        preparedValue = Math.floor(
            preparedValue * 
            desc
        ) / desc;
    }

    else if ( "ceil" in description ) {
        let desc = Math.pow( 10, description.ceil );

        preparedValue = Math.ceil(
            preparedValue * 
            desc
        ) / desc;
    }


    if ( description.zeroAsNull ) {
        if ( preparedValue === 0 ) {
            preparedValue = null;
        }
    }

    return preparedValue;
};

Model.prepareString = function prepareString(description, key, value) {
    if ( 
        _.isNaN(value) ||
        value === false ||
        value === true ||
        _.isObject(value) ||
        _.isArray(value) ||
        // infinity
        value === 1 / 0 ||
        value === -1 / 0
    ) {
        if ( _.isArray(value) || _.isObject(value) ) {
            let valueAsString;
            try {
                valueAsString = JSON.stringify(value);
            } catch(err) {
                valueAsString = false;
            }

            if ( valueAsString ) {
                throw new Error(`invalid string for ${key}: ${valueAsString}`);
            }
        }

        throw new Error(`invalid string for ${key}: ${value}`);
    }

    // convert to string
    value += "";

    if ( description.trim ) {
        value = value.trim();
    }

    if ( description.emptyAsNull ) {
        if ( value === "" ) {
            value = null;
        }
    }

    if ( description.lower ) {
        value = value.toLowerCase();
    }
    else if ( description.upper ) {
        value = value.toUpperCase();
    }

    return value;
};

Model.prepareBoolean = function prepareBoolean(description, key, value) {
    if ( 
        _.isNaN(value) ||
        _.isObject(value) ||
        _.isArray(value) ||
        // infinity
        value === 1 / 0 ||
        value === -1 / 0
    ) {
        if ( _.isArray(value) || _.isObject(value) ) {
            let valueAsString;
            try {
                valueAsString = JSON.stringify(value);
            } catch(err) {
                valueAsString = false;
            }

            if ( valueAsString ) {
                throw new Error(`invalid boolean for ${key}: ${valueAsString}`);
            }
        }

        throw new Error(`invalid boolean for ${key}: ${value}`);
    }

    // convert to boolean
    value = (
        value ? 
            true : 
            false
    );

    if ( description.falseAsNull ) {
        if ( !value ) {
            value = null;
        }
    }

    return value;
};

Model.prepareDate = function prepareDate(description, key, originalValue) {
    let value = originalValue;

    // iso date string
    if ( _.isString(value) ) {
        // Date.parse returns unix timestamp
        value = Date.parse( value );
    }

    // unix timestamp
    if ( _.isNumber(value) ) {
        value = new Date( value );
    }
    
    let isInvalidDate = (
        !(value instanceof Date) ||
        value.toString() == "Invalid Date"
    );
    if ( isInvalidDate ) {
        if ( _.isArray(originalValue) || _.isObject(originalValue) ) {
            let valueAsString;
            try {
                valueAsString = JSON.stringify(value);
            } catch(err) {
                valueAsString = false;
            }

            if ( valueAsString ) {
                throw new Error(`invalid date for ${key}: ${valueAsString}`);
            }
        }

        throw new Error(`invalid date for ${key}: ${originalValue}`);
    }

    return value;
}

module.exports = Model;
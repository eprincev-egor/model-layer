"use strict";

const _ = require("lodash");
const EventEmitter = require("events");
const Walker = require("./Walker");

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
            description = normalizeDescription( description );

            let value = null;
            if ( "default" in description ) {
                if ( _.isFunction(description.default) ) {
                    value = description.default();
                }
                else {
                    value = description.default;
                }
            }
            // default can be invalid
            value = prepareValue(description, key, value);

            if ( value ) {
                if (
                    _.isFunction(description.type) && 
                    description.type.prototype instanceof Model 
                ) {
                    value.parent = this;
                }
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
            description = normalizeDescription( description );

            if ( !description ) {
                throw new Error(`unknown property ${ key }`);
            }

            let value = data[ key ];

            // cast input value to expected format
            value = prepareValue(description, key, value);

            if ( value ) {
                if (
                    _.isFunction(description.type) && 
                    description.type.prototype instanceof Model 
                ) {
                    value.parent = this;
                }
            }

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
            description = normalizeDescription( description );

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

    walk(iteration) {

        for (let key in this.data) {
            let value = this.data[ key ];

            if ( value instanceof Model ) {
                let model = value;

                // api for stop and skip elements
                let walker = new Walker();

                // callback
                iteration(model, walker);

                // inside iteration we call walker.exit();
                if ( walker.isExited() ) {
                    return;
                }
                
                // inside iteration we call walker.continue();
                if ( walker.isContinued() ) {
                    continue;
                }

                // recursion
                model.walk(iteration);
            }
        }
    }

    findChild(iteration) {
        let child;

        this.walk((model, walker) => {
            let result = iteration( model );

            if ( result ) {
                child = model;
                walker.exit();
            }
        });

        return child;
    }

    filterChildren(iteration) {
        let children = [];

        this.walk((model) => {
            let result = iteration( model );

            if ( result ) {
                children.push( model );
            }
        });

        return children;
    }

    findParent(iteration) {
        let parent = this.parent;

        while ( parent ) {
            let result = iteration( parent );

            if ( result ) {
                return parent;
            }

            parent = parent.parent;
        }
    }

    filterParents(iteration) {
        let parents = [];
        let parent = this.parent;

        while ( parent ) {
            let result = iteration( parent );

            if ( result ) {
                parents.push( parent );
            }

            parent = parent.parent;
        }

        return parents;
    }

    findParentInstance(SomeModel) {
        return this.findParent(model =>
            model instanceof SomeModel
        );
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

    if ( description.type == "array" ) {
        value = Model.prepareArray(description, key, value);
    }
    else if ( description.type == "number" ) {
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
    // child model
    else if (
        _.isFunction(description.type) && 
        description.type.prototype instanceof Model 
    ) {
        value = Model.prepareModel(description, key, value);
    }

    

    if ( description.prepare ) {
        if ( value != null ) {
            value = description.prepare( value );
        }
    }

    return value;
}

Model.prepareNumber = function prepareNumber(description, key, originalValue) {
    if ( originalValue == null ) {
        if ( description.nullAsZero ) {
            return 0;
        }
        return null;
    }


    let value = +originalValue;

    if ( 
        _.isNaN(value) ||
        _.isBoolean(originalValue) ||
        _.isRegExp(originalValue) ||
        _.isArray(originalValue) ||
        // infinity
        value === 1 / 0 ||
        value === -1 / 0
    ) {
        let valueAsString = invalidValuesAsString( originalValue );

        throw new Error(`invalid number for ${key}: ${valueAsString}`);
    }

    
    if ( "round" in description ) {
        let desc = Math.pow( 10, description.round );

        value = Math.round(  
            value * 
            desc
        ) / desc;
    }

    else if ( "floor" in description ) {
        let desc = Math.pow( 10, description.floor );

        value = Math.floor(
            value * 
            desc
        ) / desc;
    }

    else if ( "ceil" in description ) {
        let desc = Math.pow( 10, description.ceil );

        value = Math.ceil(
            value * 
            desc
        ) / desc;
    }


    if ( description.zeroAsNull ) {
        if ( value === 0 ) {
            value = null;
        }
    }

    return value;
};

Model.prepareString = function prepareString(description, key, value) {
    if ( value == null ) {
        if ( description.nullAsEmpty ) {
            return "";
        }
        return null;
    }


    if ( 
        _.isNaN(value) ||
        _.isBoolean(value) ||
        _.isObject(value) ||
        _.isArray(value) ||
        // infinity
        value === 1 / 0 ||
        value === -1 / 0
    ) {
        let valueAsString = invalidValuesAsString( value );

        throw new Error(`invalid string for ${key}: ${valueAsString}`);
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
    if ( value == null ) {
        if ( description.nullAsFalse ) {
            return false;
        }

        return null;
    }


    if ( 
        _.isNaN( +value ) ||
        _.isRegExp(value) ||
        _.isObject(value) ||
        _.isArray(value) ||
        // infinity
        value === 1 / 0 ||
        value === -1 / 0
    ) {
        let valueAsString = invalidValuesAsString( value );

        throw new Error(`invalid boolean for ${key}: ${valueAsString}`);
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
    if ( originalValue == null ) {
        return null;
    }


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
        let valueAsString = invalidValuesAsString( originalValue );

        throw new Error(`invalid date for ${key}: ${valueAsString}`);
    }

    return value;
};

Model.prepareModel = function prepareModel(description, key, value) {
    if ( value == null ) {
        return null;
    }


    if ( value instanceof description.type ) {
        return value;
    }

    let ChildModel = description.type;
    let className = ChildModel.name;

    if ( 
        _.isNaN(value) ||
        _.isBoolean(value) ||
        _.isNumber(value) ||
        _.isString(value) ||
        _.isDate(value) ||
        _.isRegExp(value) ||
        _.isArray(value)
    ) {
        let valueAsString = invalidValuesAsString( value );

        throw new Error(`invalid ${ className } for ${key}: ${valueAsString}`);
    }

    try {
        value = new ChildModel( value );
    } catch(err) {
        let valueAsString = invalidValuesAsString( value );

        // show child error
        throw new Error(`invalid ${ className } for ${key}: ${valueAsString},\n ${err.message}`);
    }
    

    return value;
};

Model.prepareArray = function prepareArray(description, key, originalValue) {
    if ( originalValue == null ) {
        if ( description.nullAsEmpty ) {
            let value = [];
            Object.freeze(value);

            return value;
        }
        return null;
    }

    let elementDescription = description.element;
    let elementType = elementDescription.type;
    let elementTypeAsString = (
        _.isFunction( elementType ) ?
            elementType.name :
            elementType
    );

    if ( !_.isArray(originalValue) ) {
        let valueAsString = invalidValuesAsString( originalValue );

        throw new Error(`invalid array[${ elementTypeAsString }] for ${key}: ${valueAsString}`);
    }

    let value = originalValue.map((element, i) => {
        try {
            element = prepareValue( elementDescription, i, element );
        } catch(err) {
            let valueAsString = invalidValuesAsString( originalValue );

            throw new Error(`invalid array[${ elementTypeAsString }] for ${key}: ${valueAsString},\n ${err.message}`);
        }

        return element;
    });

    if ( description.emptyAsNull ) {
        if ( value.length === 0 ) {
            return null;
        }
    }

    Object.freeze( value );

    return value;
};

function normalizeDescription(description) {
    // unknown property
    if ( !description ) {
        return;
    }

    if ( 
        // name: "string"
        _.isString(description) || 
        // user: UserModel
        _.isFunction(description) 
    ) {
        description = {
            type: description
        };
    }

    // managersIds: ["number"]
    else if ( _.isArray(description) ) {
        let elementDescription = description[0];
        elementDescription = normalizeDescription( elementDescription );

        description = {
            type: "array",
            element: elementDescription
        };
    }

    // colors: {type: ["string"]}
    if ( _.isArray( description.type ) ) {
        let elementDescription = description.type[0];
        elementDescription = normalizeDescription( elementDescription );

        description.type = "array";
        description.element = elementDescription;
    }

    return description;
}

function invalidValuesAsString(value) {
    if ( _.isRegExp(value) ) {
        return value.toString();
    }

    if ( _.isArray(value) || _.isObject(value) ) {
        let valueAsString;
        try {
            valueAsString = JSON.stringify(value);
        } catch(err) {
            valueAsString = false;
        }

        if ( valueAsString ) {
            return valueAsString;
        }
    }

    if ( _.isString(value) ) {
        return `"${value}"`;
    }

    return value + "";
}

module.exports = Model;
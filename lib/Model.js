"use strict";

const EventEmitter = require("events");
const Walker = require("./Walker");

class Model extends EventEmitter {
    static structure() {
        throw new Error(`static ${ this.name }.structure() is not declared`);
    }

    constructor(data) {
        super();

        this.structure = this.constructor.structure();
        for (let key in this.structure) {
            let description = this.structure[ key ];

            this.structure[ key ] = normalizeDescription( description );
        }

        
        this.data = {};
        if ( !isObject(data) ) {
            data = {};
        }
        
        for (let key in this.structure) {
            if ( key == "*" ) {
                continue;
            }

            let description = this.structure[ key ];

            let value = null;
            if ( "default" in description ) {
                if ( typeof description.default == "function" ) {
                    value = description.default();
                }
                else {
                    value = description.default;
                }
            }
            // default can be invalid
            value = prepareValue(description, key, value);

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
        if ( typeof keyOrData == "string" ) {
            let key = keyOrData;
            
            this.set({
                [key]: value
            }, options);
            
            return;
        } else {
            options = value;
        }

        options = options || {
            onlyValidate: false
        };
        
        let data = keyOrData;
        let newData = {};
        let oldData = this.data;

        // clone old values in oldData
        for (let key in oldData) {
            newData[ key ] = oldData[ key ];
        }

        let anyKeyDescription = this.structure["*"];

        for (let key in data) {
            let description = this.structure[ key ];

            if ( !description ) {
                if ( anyKeyDescription ) {
                    description = anyKeyDescription;

                    let isValidKey = true;

                    if ( description.key instanceof RegExp ) {
                        isValidKey = description.key.test( key );
                    }
                    else if ( typeof description.key == "function" ) {
                        isValidKey = description.key( key );
                    }

                    if ( !isValidKey ) {
                        throw new Error(`invalid key: ${ key }`);
                    }
                } else {
                    throw new Error(`unknown property: ${ key }`);
                }
            }

            let value = data[ key ];

            // cast input value to expected format
            value = prepareValue(description, key, value);

            if ( value ) {
                if (
                    typeof description.type == "function" && 
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

            if ( description.type == "array" ) {
                if ( description.unique && value ) {
                    value.forEach((element, index) => {
                        if ( element == null ) {
                            return;
                        }

                        let isDuplicate = false;
                        for (let i = 0, n = index; i < n; i++) {
                            let anotherElement = value[ i ];

                            if ( anotherElement == element ) {
                                isDuplicate = true;
                                break;
                            }
                        }

                        if ( isDuplicate ) {
                            let valueAsString = invalidValuesAsString( value );

                            throw new Error(`${key} is not unique: ${ valueAsString }`);
                        }
                    });
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
            let description = this.structure[ key ];

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
        if ( !isObject(data) ) {
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

            let elements = [value];

            if ( Array.isArray(value) && value[0] instanceof Model ) {
                elements = value;
            }

            for (let i = 0, n = elements.length; i < n; i++) {
                let element = elements[ i ];

                if ( element instanceof Model ) {
                    let model = element;
    
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
        return value2json( this.data );
    }

    clone() {
        let ChildModel = this.constructor;

        let data = {};
        for (let key in this.data) {
            let value = this.data[ key ];
            
            data[ key ] = cloneValue( value );
        }

        let clone = new ChildModel( data );
        return clone;
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
    else if ( description.type == "object" ) {
        value = Model.prepareObject(description, key, value);
    }
    else if ( typeof description.type == "function" ) {
        // child model
        if ( description.type.prototype instanceof Model ) {
            value = Model.prepareModel(description, key, value);
        }
        // some class
        else {
            value = Model.prepareCustomClass(description, key, value);
        }
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
        isNaN(value) ||
        typeof originalValue == "boolean" ||
        originalValue instanceof RegExp ||
        Array.isArray(originalValue) ||
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
        isNaN(value) ||
        typeof value == "boolean" ||
        isObject(value) ||
        Array.isArray(value) ||
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
        isNaN( +value ) ||
        value instanceof RegExp ||
        isObject(value) ||
        Array.isArray(value) ||
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
    if ( typeof value == "string" ) {
        // Date.parse returns unix timestamp
        value = Date.parse( value );
    }

    // unix timestamp
    if ( typeof value == "number" ) {
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
        isNaN(value) ||
        typeof value == "boolean" ||
        typeof value == "number" ||
        typeof value == "string" ||
        value instanceof Date ||
        value instanceof RegExp ||
        Array.isArray(value)
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

Model.prepareCustomClass = function(description, key, value) {
    if ( value == null ) {
        return null;
    }

    let CustomClass = description.type;
    let className = CustomClass.name;

    if ( value instanceof CustomClass ) {
        return value;
    }

    let valueAsString = invalidValuesAsString( value );

    throw new Error(`invalid ${ className } for ${key}: ${valueAsString}`);
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
        typeof elementType == "function" ?
            elementType.name :
            elementType
    );

    if ( !Array.isArray(originalValue) ) {
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

    if ( description.sort ) {
        if ( typeof description.sort == "function" ) {
            value.sort(description.sort);
        } else {
            value.sort();
        }
    }

    Object.freeze( value );

    return value;
};

Model.prepareObject = function(description, modelKey, originalObject) {
    if ( originalObject == null ) {
        if ( description.nullAsEmpty ) {
            let value = {};
            Object.freeze(value);

            return value;
        }
        return null;
    }

    let isObject = (
        typeof originalObject == "object" &&
        !Array.isArray( originalObject ) &&
        !(originalObject instanceof RegExp)
    );

    if ( !isObject ) {
        let valueAsString = invalidValuesAsString( originalObject );

        throw new Error(`invalid object for ${modelKey}: ${valueAsString}`);
    }
    
    let object = {};
    let isEmpty = true;
    for (let key in originalObject) {
        let value = originalObject[ key ];

        object[ key ] = value;

        isEmpty = false;
    }

    if ( description.emptyAsNull ) {
        if ( isEmpty ) {
            return null;
        }
    }

    Object.freeze( object );

    return object;
};

function normalizeDescription(description) {
    // unknown property
    if ( !description ) {
        return;
    }

    if ( 
        // name: "string"
        typeof description == "string" || 
        // user: UserModel
        typeof description == "function" 
    ) {
        description = {
            type: description
        };
    }

    // managersIds: ["number"]
    else if ( Array.isArray(description) ) {
        let elementDescription = description[0];
        elementDescription = normalizeDescription( elementDescription );

        description = {
            type: "array",
            element: elementDescription
        };
    }

    // colors: {type: ["string"]}
    if ( Array.isArray( description.type ) ) {
        let elementDescription = description.type[0];
        elementDescription = normalizeDescription( elementDescription );

        description.type = "array";
        description.element = elementDescription;
    }

    let isValidType = (
        description.type == "*"        ||
        description.type == "string"   ||
        description.type == "number"   ||
        description.type == "date"     ||
        description.type == "array"    ||
        description.type == "object"   ||
        description.type == "boolean"  ||
        // CustomClass or Model
        typeof description.type == "function"
    );

    if ( !isValidType ) {
        throw new Error(`unknown type: ${ description.type }`);
    }

    return description;
}

function invalidValuesAsString(value) {
    if ( value instanceof RegExp ) {
        return value.toString();
    }

    if ( Array.isArray(value) || isObject(value) ) {
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

    if ( typeof value == "string" ) {
        return `"${value}"`;
    }

    return value + "";
}

function isObject(value) {
    return (
        // not null
        value &&
        typeof value == "object" &&
        // not array
        !Array.isArray( value )
    );
}

function isNaN(value) {
    return (
        typeof value == "number" &&
        value !== value
    );
}

function value2json(value) {
    if ( value && typeof value.toJSON == "function" ) {
        return value.toJSON();
    }

    if ( Array.isArray(value) ) {
        return value.map(item =>
            value2json( item )
        );
    }

    if ( isObject(value) ) {
        let json = {};

        for (let key in value) {
            let item = value[ key ];

            json[ key ] = value2json( item );
        }

        return json;
    }

    return value;
}

function cloneValue(value) {            
    if ( value && typeof value.clone == "function" ) {
        return value.clone();
    }

    if ( Array.isArray(value) ) {
        let clone = [];

        for (let i = 0, n = value.length; i < n; i++) {
            clone[ i ] = cloneValue( value[ i ] );
        }

        return clone;
    }

    if ( 
        value && 
        typeof value == "object" &&
        !(value instanceof RegExp)
    ) {
        let clone = {};

        for (let key in value) {
            clone[ key ] = cloneValue( value[ key ] );
        }

        return clone;
    }

    return value;
}


module.exports = Model;
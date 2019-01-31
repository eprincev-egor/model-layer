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

    set(keyOrData, value) {
        if ( _.isString(keyOrData) ) {
            let key = keyOrData;

            return this.set({
                [key]: value
            });
        }

        let structure = this.constructor.structure();

        let data = keyOrData;
        let newData = {};
        let oldData = this.data;
        let changes = {};

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

            if ( value === undefined ) {
                value = null;
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
                changes[ key ] = value;

                if ( description.const ) {
                    if ( !this.__isInit ) {
                        throw new Error(`cannot assign to read only property: ${ key }`);
                    }
                }
            }
            newData[ key ] = value;
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

        let structure = this.constructor.structure();
        for (let key in structure) {
            let description = structure[ key ];
            if ( _.isString(description) ) {
                description = {
                    type: description
                };
            }

            let value = data[ key ];

            if ( description.required ) {
                if ( value == null ) {
                    return false;
                }
            }

            if ( value != null ) {
                if ( description.validate || description.enum ) {
                    let isValid;
    
                    if ( description.enum ) {
                        isValid = description.enum.includes( value );
                    }
    
                    else if ( description.validate instanceof RegExp ) {
                        isValid = description.validate.test( value );
                    }
    
                    else if ( description.validate ) {
                        isValid = description.validate( value );
                    }
    
                    if ( !isValid ) {
                        return false;
                    }
                }
            }
        }

        // unknown property
        for (let key in data) {
            if ( !structure[ key ] ) {
                return false;
            }
        }

        // custom validate data
        if ( !this.validate ) {
            return true;
        }

        try {
            this.validate( data );
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

module.exports = Model;
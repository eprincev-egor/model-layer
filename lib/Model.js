"use strict";

const EventEmitter = require("events");
const Walker = require("./Walker");
const Type = require("./type/Type");
const EqualStack = require("./EqualStack");
const {isObject, invalidValuesAsString, MODELS} = require("./utils");

class Model extends EventEmitter {
    static structure() {
        throw new Error(`static ${ this.name }.structure() is not declared`);
    }

    static registerType(typeName, CustomType) {
        Type.registerType(typeName, CustomType);
    }

    static getType(typeName) {
        return Type.getType( typeName );
    }

    constructor(data) {
        super();

        if ( !this.constructor.prototype.hasOwnProperty( "structure" ) ) {
            let structure = this.constructor.structure();

            // for speedup constructor, saving structure to prototype
            this.constructor.prototype.structure = structure;

            for (let key in this.structure) {
                let description = this.structure[ key ];
    
                this.structure[ key ] = Type.create( description, key );

                if ( description.primary ) {
                    this.constructor.prototype.primaryKey = key;
                }
            }
            
            // structure must be static... really static
            Object.freeze( structure );
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

            // default value is null, or something from description
            let value = description.default();
            // default can be invalid
            value = description.prepare(value, key, this);

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

                    let isValidKey = description.validateKey( key );
                    
                    if ( !isValidKey ) {
                        throw new Error(`invalid key: ${ key }`);
                    }
                } else {
                    throw new Error(`unknown property: ${ key }`);
                }
            }

            let value = data[ key ];

            // cast input value to expected format
            value = description.prepare(value, key, this);

            // validate by params
            let isValid = description.validate( value, key );
            if ( !isValid ) {
                let valueAsString = invalidValuesAsString( value );

                throw new Error(`invalid ${ key }: ${ valueAsString }`);
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
            if ( !description ) {
                description = anyKeyDescription;
            }

            let newValue = newData[ key ];
            let oldValue = oldData[ key ];

            // if field has type string,
            // then he must be string or null in anyway!
            if ( this.prepare ) {
                newValue = description.prepare(newValue, key, this);
            }

            if ( oldValue != newValue ) {
                if ( description.const ) {
                    if ( !this.__isInit ) {
                        throw new Error(`cannot assign to read only property: ${ key }`);
                    }
                }
            }
            if ( description.required ) {
                if ( newValue == null ) {
                    throw new Error(`required ${ key }`);
                }
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
        
        if ( this.primaryKey ) {
            let primaryValue = this.data[ this.primaryKey ];
            this[ this.primaryKey ] = primaryValue;
            this.primaryValue = primaryValue;
        }

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
        return this.data.hasOwnProperty( key );
    }

    getDescription(key) {
        return this.structure[ key ] || this.structure["*"];
    }

    hasValue(key) {
        let value = this.data[ key ];

        if ( value == null ) {
            return false;
        } else {
            return true;
        }
    }

    walk(iteration, _stack) {
        let stack = _stack || [];

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

                    // stop circular recursion
                    if ( stack.includes(model) ) {
                        continue;
                    }
                    stack.push( model );
                    
    
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
                    model.walk(iteration, stack);
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

    findParent(iteration, _stack) {
        let stack = _stack || [];

        let parent = this.parent;

        while ( parent ) {
            // stop circular recursion
            if ( stack.includes(parent) ) {
                return;
            }
            stack.push( parent );
            

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
            let description = this.getDescription( key );
            let value = this.data[ key ];

            if ( value != null ) {
                value = description.toJSON( value ); 
            }

            json[ key ] = value;
        }

        this.prepareJSON( json );

        return json;
    }

    prepareJSON() {
        // redefine me
    }

    clone() {
        let clone = {};

        for (let key in this.data) {
            let description = this.getDescription( key );
            let value = this.data[ key ];

            if ( value != null ) {
                value = description.clone( value ); 
            }

            clone[ key ] = value;
        }

        let ChildModel = this.constructor;
        clone = new ChildModel( clone );
        
        return clone;
    }

    equal(otherModel, _stack) {
        let stack = _stack || new EqualStack();

        for (let key in this.data) {
            let description = this.getDescription( key );
            let selfValue = this.data[ key ];
            let otherValue = (
                otherModel instanceof Model ?
                    otherModel.data[ key ] :
                    otherModel[ key ]
            );

            let isEqual = description.equal( selfValue, otherValue, stack );

            if ( !isEqual ) {
                return false;
            }
        }

        // check additional keys from other model
        let otherData = (
            otherModel instanceof Model ?
                otherModel.data :
                otherModel
        );
        for (let key in otherData) {
            if ( key in this.data ) {
                continue;
            }
            
            // exists unknown property for self model
            return false;
        }

        return true;
    }

    static or(...Models) {
        if ( !Models.length ) {
            throw new Error("expected children Models");
        }

        const BaseModel = this;

        Models.forEach(CustomModel => {
            let isValidModel = (
                typeof CustomModel == "function" &&
                CustomModel.prototype instanceof BaseModel
            );

            if ( !isValidModel ) {
                throw new Error(`${ CustomModel.name } should be inherited from ${ BaseModel.name }`);
            }
        });
        
        Models.unshift( BaseModel );
        return new MODELS(
            Models
        );
    }
}

Model.Type = Type;
Type.Model = Model;

module.exports = Model;
import EventEmitter from "events";
import EqualStack from "./EqualStack";
import {Type, InputType, OutputType, JsonType, IType} from "./type/Type";
import { invalidValuesAsString, isObject } from "./utils";
import Walker from "./Walker";
import {
    UnknownPropertyError,
    ModelWithoutStructureError,
    InvalidKeyError,
    InvalidValueError,
    RequiredError,
    ConstValueError,
    DataShouldBeObjectError
} from "./errors";

export interface ISimpleObject extends Object {
    [propName: string]: any;
}

type ReadOnlyPartial<TData> = {
    readonly [key in keyof TData]?: TData[key];
};


interface IChangeEvent<TModel extends Model<any>> {
    prev: TModel["row"];
    changes: ReadOnlyPartial<TModel["row"]>;
}

interface IChildModel {
    structure(): {[key: string]: IType | (new (...args: any) => IType)};    
}

export abstract class Model<ChildModel extends Model<any>> extends EventEmitter {

    static Type = Type;

    TInputData!: InputType< ReturnType< ChildModel["structure"] > >;
    TInput!: InputType< ReturnType< ChildModel["structure"] > > | this;
    TOutput!: this;
    TJson!: JsonType< ReturnType< ChildModel["structure"] > >;
    row: OutputType< ReturnType< ChildModel["structure"] > >;
    
    // "id"
    primaryKey?: string;
    // value of id
    primaryValue?: number | string;
    
    parent?: Model<any>;

    // row properties
    private properties: any;
    
    constructor(inputData?: InputType< ReturnType< ChildModel["structure"] > >) {
        super();
        
        this.prepareStructure();

        const defaultRow: any = {};
        for (const propKey in this.properties) {
            const key = propKey as keyof this["row"];

            if ( key === "*" ) {
                continue;
            }

            const description = this.properties[ key ];

            // default value is null, or something from description
            let defaultValue = description.default();
            // default can be invalid
            defaultValue = description.prepare(defaultValue, key, this);

            defaultRow[ key ] = defaultValue;
        }

        this.row = Object.freeze(defaultRow);

        (this as any).isInit = true; // do not check const
        this.set(inputData || {} as any);
        delete (this as any).isInit;
    }

    abstract structure(): {[key: string]: IType | (new (...args: any) => IType)};    

    get<TKey extends keyof this["row"]>(key: TKey): this["row"][TKey] {
        return this.row[ key ];
    }

    set(row: this["TInputData"], options?: ISimpleObject) {
        options = options || {
            onlyValidate: false
        };
        
        const newData: any = {};
        const oldData = this.row;

        // clone old values in oldData
        for (const key in oldData) {
            newData[ key ] = oldData[ key ];
        }

        const anyKeyDescription = this.properties["*"];

        for (const key in row) {
            let description = this.properties[ key ];

            if ( !description ) {
                if ( anyKeyDescription ) {
                    description = anyKeyDescription;

                    const isValidKey = description.validateKey( key );
                    
                    if ( !isValidKey ) {
                        throw new InvalidKeyError({ 
                            key 
                        });
                    }
                } else {
                    throw new UnknownPropertyError({
                        propertyName: key
                    });
                }
            }

            let value = row[ key ];

            // cast input value to expected format
            value = description.prepare(value, key, this);

            // validate by params
            const isValid = description.validate( value, key );
            if ( !isValid ) {
                const valueAsString = invalidValuesAsString( value );

                throw new InvalidValueError({
                    key,
                    value: valueAsString
                });
            }

            newData[ key ] = value;
        }

        // modify by reference
        // because it conveniently
        this.prepare( newData );

        const changes: any = {};
        for (const key in newData) {
            const anyKey: any = key;
            let description = this.properties[ anyKey ];
            if ( !description ) {
                description = anyKeyDescription;
            }

            let newValue = newData[ key ];
            const oldValue = oldData[ key ];

            // if field has type string,
            // then he must be string or null in anyway!
            if ( this.prepare !== Model.prototype.prepare ) {
                newValue = description.prepare(newValue, key, this);
            }

            if ( oldValue !== newValue ) {
                if ( description.const ) {
                    if ( !(this as any).isInit ) {
                        throw new ConstValueError({
                            key
                        });
                    }
                }
            }
            if ( description.required ) {
                if ( newValue == null ) {
                    throw new RequiredError({
                        key
                    });
                }
            }

            if ( newValue !== oldValue ) {
                changes[ key ] = newValue;
                newData[ key ] = newValue;
            }
        }

        const hasChanges = Object.keys( changes ).length > 0;
        if ( !hasChanges ) {
            return;
        }

        // juniors love use model.row for set
        // stick on his hands
        Object.freeze(newData);

        this.validate(newData);

        // do not call emit and set newData
        if ( options.onlyValidate ) {
            return;
        }

        this.row = newData;
        
        if ( this.primaryKey ) {
            const primaryValue = this.row[ this.primaryKey ];
            (this as any)[ this.primaryKey ] = primaryValue;
            this.primaryValue = primaryValue;
        }

        for (const key in changes) {
            this.emit("change:" + key, {
                prev: oldData,
                changes
            }, options);
        }

        this.emit("change", {
            prev: oldData,
            changes
        }, options);
    }

    isValid(row: this["TInputData"]): boolean {
        if ( !isObject(row) ) {
            throw new DataShouldBeObjectError({});
        }

        try {
            this.set(row, {
                onlyValidate: true
            });

            return true;
        } catch (err) {
            return false;
        }
    }

    hasProperty<Key extends keyof this["row"]>(key: Key): boolean {
        return this.row.hasOwnProperty( key );
    }

    getDescription<Key extends keyof this["row"]>(key: Key) {
        const iKey = key as any;
        return this.properties[ iKey ] || this.properties["*"];
    }

    hasValue<Key extends keyof this["row"]>(key: Key): boolean {
        const value = this.row[ key ];

        if ( value == null ) {
            return false;
        } else {
            return true;
        }
    }

    walk(
        iteration: (model: Model<any>, walker: Walker) => void, 
        stack?: any
    ) {
        stack = stack || [];

        for (const key in this.row) {
            const value = this.row[ key ];

            let elements = [value];

            const isModelsArray = (
                Array.isArray(value) && 
                value[0] instanceof Model
            );
            const isCollection = (
                value && 
                Array.isArray(value.models) && 
                value.models[0] instanceof Model
            );

            if ( isModelsArray ) {
                elements = value;
            }
            else if ( isCollection ) {
                elements = value.models;
            }

            for (let i = 0, n = elements.length; i < n; i++) {
                const element = elements[ i ] as any;

                if ( element instanceof Model ) {
                    const model = element;

                    // stop circular recursion
                    if ( stack.includes(model) ) {
                        continue;
                    }
                    stack.push( model );
                    
    
                    // api for stop and skip elements
                    const walker = new Walker();
    
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

    findChild(
        iteration: (model: Model<any>) => boolean
    ): Model<any> | undefined {
        let child: Model<any> | undefined;

        this.walk((model, walker) => {
            const result = iteration( model );

            if ( result ) {
                child = model;
                walker.exit();
            }
        });

        return child;
    }

    filterChildren(
        iteration: (model: Model<any>) => boolean
    ): Array<Model<any>> {

        const children: Array<Model<any>> = [];

        this.walk((model) => {
            const result = iteration( model );

            if ( result ) {
                children.push( model );
            }
        });

        return children;
    }

    filterChildrenByInstance<TModel extends Model<any>>(
        SomeModel: new (...args: any) => TModel
    ): TModel[] {
        return this.filterChildren((model) =>
            model instanceof SomeModel
        ) as TModel[];
    }

    findParent(
        iteration: (model: Model<any>) => boolean, 
        stack?: any
    ): Model<any> | undefined {
        stack = stack || [];

        let parent = this.parent;

        while ( parent ) {
            // stop circular recursion
            if ( stack.includes(parent) ) {
                return;
            }
            stack.push( parent );
            

            const result = iteration( parent );

            if ( result ) {
                return parent;
            }

            parent = parent.parent;
        }
    }

    filterParents(
        iteration: (model: Model<any>) => boolean
    ): Array<Model<any>> {

        const parents: Array<Model<any>> = [];
        let parent = this.parent;

        while ( parent ) {
            const result = iteration( parent );

            if ( result ) {
                parents.push( parent );
            }

            parent = parent.parent;
        }

        return parents;
    }

    findParentInstance<TModel extends Model<any>>(
        SomeModel: new (...args: any) => TModel
    ): TModel {
        return this.findParent((model) =>
            model instanceof SomeModel
        ) as TModel;
    }

    toJSON(stack = []): this["TJson"] {
        const json: any = {};
        
        for (const key in this.row) {
            const description = this.getDescription( key );
            let value = this.row[ key ];

            if ( value != null ) {
                value = description.toJSON( value, [...stack] ); 
            }

            json[ key ] = value;
        }

        this.prepareJSON( json );

        return json;
    }

    clone(stack?: EqualStack): this {
        stack = stack || new EqualStack();

        // circular reference
        const existsClone = stack.get(this);
        if ( existsClone ) {
            return existsClone;
        }

        const clone: this = Object.create( this.constructor.prototype );
        stack.add(this, clone);

        const cloneData: Partial<this["row"]> = {};

        for (const key in this.row) {
            const description = this.getDescription( key );
            let value = this.row[ key ];

            if ( value != null ) {
                value = description.clone( value, stack, clone ); 
            }

            cloneData[ key ] = value;
        }

        (clone as any).row = Object.freeze(cloneData);

        return clone;
    }

    equal(otherModel: this | this["row"], stack?: any): boolean {
        stack = stack || new EqualStack();

        for (const key in this.row) {
            const anyKey = key as any;
            const description = this.getDescription( key );
            const selfValue = this.row[ anyKey ];
            const otherValue = (
                otherModel instanceof Model ?
                    otherModel.row[ anyKey ] :
                    otherModel[ anyKey ]
            );

            const isEqual = description.equal( selfValue, otherValue, stack );

            if ( !isEqual ) {
                return false;
            }
        }

        // check additional keys from other model
        const otherData = (
            otherModel instanceof Model ?
                otherModel.row :
                otherModel
        );
        for (const key in otherData) {
            if ( key in this.row ) {
                continue;
            }
            
            // exists unknown property for self model
            return false;
        }

        return true;
    }

    validate(row: this["TInputData"]): void {
        // for invalid row throw error here
    }

    prepare(row: this["TInputData"]): void {
        // any calculations with row by reference
    }

    prepareJSON(json: this["TJson"]): void {
        // any calculations with json by reference
    }

    on(
        eventName: "change",
        keyOrListener: (
            string & keyof this["row"] | 
            ((event: IChangeEvent<this>, options: ISimpleObject) => void)
        ),
        listener?: (event: IChangeEvent<this>, options: ISimpleObject) => void
    ): this {
        if ( typeof keyOrListener === "string" ) {
            const key = keyOrListener;
            
            const description = this.getDescription(key);
            if ( !description ) {
                throw new UnknownPropertyError({
                    propertyName: key
                });
            }

            super.on(eventName + ":" + key, listener as any);
        }
        else {
            listener = keyOrListener as any;
            super.on(eventName, listener as any);
        }

        return this;
    }

    private prepareStructure(): void {
        if ( this.constructor.prototype.hasOwnProperty( "properties" ) ) {
            return;
        }
        const constructor = this.constructor as any;
        const properties = constructor.prototype.structure();
    
        // for speedup constructor, saving structure to prototype
        this.constructor.prototype.properties = properties;
    
        for (const key in this.properties) {
            const description = this.properties[ key ];
    
            this.properties[ key ] = Type.create( description, key );
    
            if ( description.primary ) {
                this.constructor.prototype.primaryKey = key;
            }
        }
        
        // structure must be static... really static
        Object.freeze( properties );
    }
    
}

// for js
(Model as any).prototype.structure = function() {
    throw new ModelWithoutStructureError({
        className: this.constructor.name
    });
};

Type.Model = Model;

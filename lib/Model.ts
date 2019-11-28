import EventEmitter from "events";
import EqualStack from "./EqualStack";
import {Type, InputType, OutputType, JsonType, IType} from "./type/Type";
import { invalidValuesAsString, isObject } from "./utils";
import Walker from "./Walker";

export interface ISimpleObject extends Object {
    [propName: string]: any;
}

type ReadOnlyPartial<TData> = {
    readonly [key in keyof TData]?: TData[key];
};


interface IChangeEvent<TModel extends Model> {
    prev: TModel["data"];
    changes: ReadOnlyPartial<TModel["data"]>;
}

export abstract class Model<
    ChildModel extends Model = any,
    TStructure = ReturnType< ChildModel["structure"] >,
    TInputData extends ISimpleObject = InputType< TStructure >,
    TJson extends ISimpleObject = JsonType< TStructure >,
    TOutputData extends ISimpleObject = OutputType< TStructure >
> extends EventEmitter {

    static Type = Type;

    TStructure: TStructure;
    TInputData: TInputData;
    TInput: TInputData | ChildModel;
    TOutput: ChildModel;
    TJson: TJson;
    data: TOutputData;
    
    // "id"
    primaryKey: string;
    // value of id
    primaryValue: number | string;

    // data properties
    private properties: any;
    
    private isInit: boolean;
    
    private parent: Model;

    constructor(inputData?: TInputData) {
        super();

        this.prepareStructure();
        
        const data = {} as any;
        this.data = data as any;

        let newData: any = inputData;

        if ( !isObject(newData) ) {
            newData = {} as any;
        }
        
        for (const propKey in this.properties) {
            const key = propKey as keyof this["data"];

            if ( key === "*" ) {
                continue;
            }

            const description = this.properties[ key ];

            // default value is null, or something from description
            let value = description.default();
            // default can be invalid
            value = description.prepare(value, key, this);

            data[ key ] = value;

            // throw required error in method .set
            if ( description.required ) {
                if ( !(key in newData) ) {
                    newData[key] = null;
                }
            }
        }
        
        this.isInit = true; // do not check const
        this.set(newData);
        delete this.isInit;

        Object.freeze(this.data);
    }

    structure(): {[key: string]: IType} {
        // throw new Error(`${ this.constructor.name }.structure() is not declared`);
        return {};
    }

    get<TKey extends keyof TOutputData>(key: TKey): TOutputData[TKey] {
        return this.data[ key ];
    }

    set(data: TInputData, options?: ISimpleObject) {
        options = options || {
            onlyValidate: false
        };
        
        const newData: any = {};
        const oldData = this.data;

        // clone old values in oldData
        for (const key in oldData) {
            newData[ key ] = oldData[ key ];
        }

        const anyKeyDescription = this.properties["*"];

        for (const key in data) {
            let description = this.properties[ key ];

            if ( !description ) {
                if ( anyKeyDescription ) {
                    description = anyKeyDescription;

                    const isValidKey = description.validateKey( key );
                    
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
            const isValid = description.validate( value, key );
            if ( !isValid ) {
                const valueAsString = invalidValuesAsString( value );

                throw new Error(`invalid ${ key }: ${ valueAsString }`);
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
                    if ( !this.isInit ) {
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

        const hasChanges = Object.keys( changes ).length > 0;
        if ( !hasChanges ) {
            return;
        }

        // juniors love use model.data for set
        // stick on his hands
        Object.freeze(newData);

        this.validate(newData);

        // do not call emit and set newData
        if ( options.onlyValidate ) {
            return;
        }

        this.data = newData;
        
        if ( this.primaryKey ) {
            const primaryValue = this.data[ this.primaryKey ];
            this[ this.primaryKey ] = primaryValue;
            this.primaryValue = primaryValue;
        }

        for (const key in changes) {
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

    isValid(data: TInputData): boolean {
        if ( !isObject(data) ) {
            throw new Error("data must be are object");
        }

        try {
            this.set(data, {
                onlyValidate: true
            });

            return true;
        } catch (err) {
            return false;
        }
    }

    hasProperty<Key extends keyof TOutputData>(key: Key): boolean {
        return this.data.hasOwnProperty( key );
    }

    getDescription<Key extends keyof TOutputData>(key: Key) {
        const iKey = key as any;
        return this.properties[ iKey ] || this.properties["*"];
    }

    hasValue<Key extends keyof TOutputData>(key: Key): boolean {
        const value = this.data[ key ];

        if ( value == null ) {
            return false;
        } else {
            return true;
        }
    }

    walk(
        iteration: (model: Model, walker: Walker) => void, 
        stack?
    ) {
        stack = stack || [];

        for (const key in this.data) {
            const value = this.data[ key ];

            let elements = [value];

            if ( Array.isArray(value) && value[0] instanceof Model ) {
                elements = value;
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
        iteration: (model: Model) => boolean
    ): Model {
        let child;

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
        iteration: (model: Model) => boolean
    ): Model[] {

        const children: Model[] = [];

        this.walk((model) => {
            const result = iteration( model );

            if ( result ) {
                children.push( model );
            }
        });

        return children;
    }

    findParent(
        iteration: (model: Model) => boolean, 
        stack?
    ): Model {
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
        iteration: (model: Model) => boolean
    ): Model[] {

        const parents: Model[] = [];
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

    findParentInstance<TModel extends Model>(
        SomeModel: new (...args: any) => TModel
    ): TModel {
        return this.findParent((model) =>
            model instanceof SomeModel
        ) as TModel;
    }

    toJSON(): this["TJson"] {
        const json: any = {};
        
        for (const key in this.data) {
            const description = this.getDescription( key );
            let value = this.data[ key ];

            if ( value != null ) {
                value = description.toJSON( value ); 
            }

            json[ key ] = value;
        }

        this.prepareJSON( json );

        return json;
    }

    clone(): this {
        const cloneData: Partial<this["data"]> = {};

        for (const key in this.data) {
            const description = this.getDescription( key );
            let value = this.data[ key ];

            if ( value != null ) {
                value = description.clone( value ); 
            }

            cloneData[ key ] = value;
        }

        const ThisConstructor = this.constructor as any;
        const clone: this = new ThisConstructor( cloneData );
        
        return clone;
    }

    equal(otherModel: Model | object, stack?): boolean {
        stack = stack || new EqualStack();

        for (const key in this.data) {
            const anyKey = key as any;
            const description = this.getDescription( key );
            const selfValue = this.data[ anyKey ];
            const otherValue = (
                otherModel instanceof Model ?
                    otherModel.data[ anyKey ] :
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
                otherModel.data :
                otherModel
        );
        for (const key in otherData) {
            if ( key in this.data ) {
                continue;
            }
            
            // exists unknown property for self model
            return false;
        }

        return true;
    }

    validate(data: TInputData): void {
        // for invalid data throw error here
    }

    prepare(data: TInputData): void {
        // any calculations with data by reference
    }

    prepareJSON(json: this["TJson"]): void {
        // any calculations with json by reference
    }

    on(
        eventName: "change",
        keyOrListener: (
            string | 
            ((event: IChangeEvent<this>) => void)
        ),
        listener?: (event: IChangeEvent<this>) => void
    ): this {
        if ( typeof keyOrListener === "string" ) {
            const key = keyOrListener;
            
            const description = this.getDescription(key as any);
            if ( !description ) {
                throw new Error(`unknown property: ${ key }`);
            }

            super.on(eventName + ":" + key, listener);
        }
        else {
            listener = keyOrListener;
            super.on(eventName, listener);
        }

        return this;
    }

    private prepareStructure(): void {
        if ( this.constructor.prototype.hasOwnProperty( "structure" ) ) {
            return;
        }
        const constructor = this.constructor as any;
        const structure = constructor.data();
    
        // for speedup constructor, saving structure to prototype
        this.constructor.prototype.structure = structure;
    
        for (const key in this.properties) {
            const description = this.properties[ key ];
    
            this.properties[ key ] = Type.create( description, key );
    
            if ( description.primary ) {
                this.constructor.prototype.primaryKey = key;
            }
        }
        
        // structure must be static... really static
        Object.freeze( structure );
    }
    
}

Type.Model = Model;

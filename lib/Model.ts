import EventEmitter from "events";
import EqualStack from "./EqualStack";
import {Type} from "./type/Type";
import { invalidValuesAsString, isObject, MODELS } from "./utils";
import Walker from "./Walker";

export interface ISimpleObject extends Object {
    [propName: string]: any;
}

type ReadOnlyPartial<TData> = {
    readonly [key in keyof TData]?: TData[key];
};


interface IObjectWithAnyKey {
    "*": any;
}

// output
type outputValue<T extends any> = (
    TInstanceOrT<T>["output"]
);
type outputData<T> = {
    readonly [key in keyof T]?: outputValue< T[key] >;
};

interface IOutputAnyData<T> {
    readonly [key: string]: outputValue< T >;
}

type OutputType<T> = (
    T extends IObjectWithAnyKey ?
        IOutputAnyData< T["*"] > & outputData< Omit< T, "*" > > :
        outputData< T >
);

// input
type inputValue<T extends any> = (
    TInstanceOrT<T>["input"]
);

type inputData<T> = {
    [key in keyof T]?: inputValue< T[key] >;
};

interface IInputAnyData<T> {
    [key: string]: inputValue< T >;
}

type InputType<T> = (
    T extends IObjectWithAnyKey ?
        IInputAnyData< T["*"] > & inputData< Omit< T, "*" > > :
        inputData< T >
);

// json
type jsonValue<T extends any> = (
    TInstanceOrT<T>["json"]
);

interface IJsonAnyData<T> {
    [key: string]: jsonValue< T >;
}

type jsonData<T> = {
    [key in keyof T]?: jsonValue< T[key] >;
};

type JsonType<T> = (
    T extends IObjectWithAnyKey ?
        IJsonAnyData< T["*"] > & jsonData< Omit< T, "*" > > :
        jsonData< T >
);

interface IChangeEvent<TModel extends Model<any>> {
    prev: TModel["data"];
    changes: ReadOnlyPartial<TModel["data"]>;
}

// tslint:disable-next-line:interface-name
export declare interface Model<
    T extends (() => ISimpleObject),
    TStructure = ReturnType<T>, 
    TData = OutputType<TStructure>, 
    InputData = InputType<TStructure>, 
    JSONData = JsonType<TStructure>
> extends EventEmitter {
    // throw error if data is invalid
    validate(data: ReadOnlyPartial<TData>): void;

    // prepare data before validation
    prepare(data: InputData): void;

    // prepare json before toJSON
    prepareJSON(json: JSONData): void;
}

export abstract class Model<
    T extends (() => ISimpleObject),
    TStructure = ReturnType<T>, 
    TData = OutputType<TStructure>, 
    InputData = InputType<TStructure>, 
    JSONData = JsonType<TStructure>
> extends EventEmitter {

    public static Type = Type;

    public static data(): object {
        throw new Error(`static ${ this.name }.data() is not declared`);
    }

    public static registerType(typeName, CustomType) {
        Type.registerType(typeName, CustomType);
    }

    public static getType(typeName) {
        return Type.getType( typeName );
    }

    public static or(...Models) {
        if ( !Models.length ) {
            throw new Error("expected children Models");
        }

        const BaseModel = this;

        Models.forEach((CustomModel) => {
            const isValidModel = (
                typeof CustomModel === "function" &&
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

    public output: this;
    public input: InputData | this;
    public json: JSONData;

    public data: TData;
    
    // "id"
    public primaryKey: string;
    // value of id
    public primaryValue: number | string;

    // data properties
    private structure: any;
    
    private isInit: boolean;
    
    private parent: Model<any>;

    constructor(newData?: InputData) {
        super();

        this.prepareStructure();
        
        const data = {};
        this.data = data as TData;

        if ( !isObject(newData) ) {
            newData = {} as InputData;
        }
        
        for (const key in this.structure) {
            if ( key === "*" ) {
                continue;
            }

            const description = this.structure[ key ];

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

    public get<TKey extends keyof TData>(key: TKey): TData[TKey] {
        return this.data[ key ];
    }

    public set(data: InputData, options?: ISimpleObject) {
        options = options || {
            onlyValidate: false
        };
        
        const newData: any = {};
        const oldData = this.data;

        // clone old values in oldData
        for (const key in oldData) {
            newData[ key ] = oldData[ key ];
        }

        const anyKeyDescription = this.structure["*"];

        for (const key in data) {
            let description = this.structure[ key ];

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

        const changes: Partial<TData> = {};
        for (const key in newData) {
            const anyKey: any = key;
            let description = this.structure[ anyKey ];
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

    public isValid(data: InputData): boolean {
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

    public hasProperty<Key extends keyof TData>(key: Key): boolean {
        return this.data.hasOwnProperty( key );
    }

    public getDescription<Key extends keyof TData>(key: Key) {
        const iKey = key as any;
        return this.structure[ iKey ] || this.structure["*"];
    }

    public hasValue<Key extends keyof TData>(key: Key): boolean {
        const value = this.data[ key ];

        if ( value == null ) {
            return false;
        } else {
            return true;
        }
    }

    public walk(
        iteration: (model: Model<any>, walker: Walker) => void, 
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

    public findChild(
        iteration: (model: Model<any>) => boolean
    ): Model<any> {
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

    public filterChildren(
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

    public findParent(
        iteration: (model: Model<any>) => boolean, 
        stack?
    ): Model<any> {
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

    public filterParents(
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

    public findParentInstance<TModel extends Model<any>>(
        SomeModel: new (...args: any) => TModel
    ): TModel {
        return this.findParent((model) =>
            model instanceof SomeModel
        ) as TModel;
    }

    public toJSON(): JSONData {
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

    public clone(): this {
        const cloneData: Partial<TData> = {};

        for (const key in this.data) {
            const description = this.getDescription( key );
            let value = this.data[ key ];

            if ( value != null ) {
                value = description.clone( value ); 
            }

            cloneData[ key ] = value;
        }

        const ChildModel = this.constructor as any;
        const clone: this = new ChildModel( cloneData );
        
        return clone;
    }

    public equal(otherModel: Model<any> | object, stack?): boolean {
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

    public validate(data: InputData): void {
        // for invalid data throw error here
    }

    public prepare(data: InputData): void {
        // any calculations with data by reference
    }

    public prepareJSON(json: JSONData): void {
        // any calculations with json by reference
    }

    public on(
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
    
        for (const key in this.structure) {
            const description = this.structure[ key ];
    
            this.structure[ key ] = Type.create( description, key );
    
            if ( description.primary ) {
                this.constructor.prototype.primaryKey = key;
            }
        }
        
        // structure must be static... really static
        Object.freeze( structure );
    }
    
}

Type.Model = Model;

import * as EventEmitter from "events";
import EqualStack from "./EqualStack";
import Type from "./type/Type";
import { invalidValuesAsString, isObject, MODELS } from "./utils";
import Walker from "./Walker";

type ReadOnlyPartial<TData> = {
    readonly [key in keyof TData]?: TData[key];
};

type JSONValue<TValueType> = 
    TValueType extends Model<object> ?
        JSONData<TValueType["data"]> :
        TValueType
;

type JSONData<TData> = {
    [key in keyof TData]?: JSONValue< TData[key] >;
};

interface IChangeEvent<TData> {
    prev: ReadOnlyPartial<TData>;
    changes: ReadOnlyPartial<TData>;
}

// tslint:disable-next-line:interface-name
declare interface Model<TData extends object> {
    // events
    on(
        event: "change", 
        listener: (event: IChangeEvent<TData>) => void
    ): this;
}

abstract class Model<TData extends object> extends EventEmitter {

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

    public data: ReadOnlyPartial<TData>;
    
    // "id"
    public primaryKey: string;
    // value of id
    public primaryValue: any;

    // data properties
    private structure: object;
    
    private isInit: boolean;
    
    private parent: Model<object>;

    constructor(data?: ReadOnlyPartial<TData>) {
        super();

        this.prepareStructure();
        
        this.data = {};
        if ( !isObject(data) ) {
            data = {};
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

            this.data[ key ] = value;

            // throw required error in method .set
            if ( description.required ) {
                if ( !(key in data) ) {
                    data[key] = null;
                }
            }
        }
        
        this.isInit = true; // do not check const
        this.set(data);
        delete this.isInit;
        
        // juniors love use model.data for set
        // stick on his hands
        Object.freeze( this.data );
    }

    public get<Key extends keyof TData>(key: Key) {
        return this.data[ key ];
    }

    public set(data: ReadOnlyPartial<TData>, options?) {
        options = options || {
            onlyValidate: false
        };
        
        const newData: Partial<TData> = {};
        const oldData = this.data;

        // clone old values in oldData
        for (const key in oldData) {
            newData[ key ] = oldData[ key ];
        }

        const anyKeyDescription = this.structure["*"];

        for (const key in data) {
            const anyKey: any = key;
            let description = this.structure[ anyKey ];

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
            if ( this.prepare ) {
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

        if ( this.validate ) {
            this.validate(newData);
        }

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

    public isValid(data: Partial<TData>): boolean {
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

    public getDescription(key) {
        return this.structure[ key ] || this.structure["*"];
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
        iteration: (model: Model<object>, walker: Walker) => void, 
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
                const element = elements[ i ];

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

    public findChild(iteration) {
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

    public filterChildren(iteration) {
        const children = [];

        this.walk((model) => {
            const result = iteration( model );

            if ( result ) {
                children.push( model );
            }
        });

        return children;
    }

    public findParent(
        iteration: (model: Model<object>) => boolean, 
        stack?
    ): Model<object> {
        stack = _stack || [];

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

    public filterParents(iteration) {
        const parents = [];
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

    public findParentInstance(SomeModel) {
        return this.findParent((model) =>
            model instanceof SomeModel
        );
    }

    public toJSON(): JSONData<TData> {
        const json: JSONData<TData> = {};

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

    public equal(otherModel: Model<object>, stack): boolean {
        stack = stack || new EqualStack();

        for (const key in this.data) {
            const description = this.getDescription( key );
            const selfValue = this.data[ key ];
            const otherValue = (
                otherModel instanceof Model ?
                    otherModel.data[ key ] :
                    otherModel[ key ]
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

    private validate(data: ReadOnlyPartial<TData>): void {
        // for invalid data throw error here
    }

    private prepare(data: Partial<TData>): void {
        // any calculations with data by reference
    }

    private prepareJSON(json: JSONData<TData>): void {
        // any calculations with json by reference
    }

    private prepareStructure() {
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

export default Model;

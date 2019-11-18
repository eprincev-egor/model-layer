
import {invalidValuesAsString} from "../utils";
const FORBIDDEN_PRIMARY_KEYS = [
    "data",
    "primaryKey",
    "primaryValue"
];

export type TInstanceOrT<T> = (
    T extends new (...args: any) => any ?
        InstanceType<T> :
        T
);

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

export type OutputType<T> = (
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

export type InputType<T> = (
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

export type JsonType<T> = (
    T extends IObjectWithAnyKey ?
        IJsonAnyData< T["*"] > & jsonData< Omit< T, "*" > > :
        jsonData< T >
);

export interface IType {
    output: any;
    input: any;
    json: any;
}

const Types = {};

export interface ITypeParams {
    key: ((key: string) => boolean) | RegExp;
    type: string;
    required?: boolean;
    primary?: boolean;
    prepare?: (value: any, key: string, model) => any;
    toJSON?: (value: any) => any;
    validate?: 
        ((value: any, key: string) => boolean) |
        RegExp
    ;
    enum?: any[];
    default?: () => any;
    const?: boolean;
}

export class Type {
    public static Model: any;

    // create type by params
    public static create(description, key: string) {
        
        const isTypeHelper = (
            typeof description === "function" &&
            description.isTypeHelper === true
        );

        if ( isTypeHelper ) {
            description = description();
        }

        const isPlainDescription = (
            description && 
            description.type
        );

        // structure: {prop: "number"}
        // or
        // structure: {prop: ["number"]}
        // or
        // structure: {prop: SomeModel}
        // or
        // structure: {prop: {}}
        if ( !isPlainDescription ) {
            description = {
                type: description
            };
        }
        

        

        // prepare description: ["string"] 
        // to { type: "array", element: {type: "string"} }
        for (const typeName in Types) {
            const SomeType = Types[ typeName ];

            // CustomType can use some variations for declare structure
            SomeType.prepareDescription( description, key );
        }

        // find CustomType by name
        const CustomType = Types[ description.type ];
        if ( !CustomType ) {
            throw new Error(`${key}: unknown type: ${ description.type }`);
        }


        if ( description.primary ) {
            const Model = Type.Model;
            const isReserved = (
                key in Model.prototype ||
                FORBIDDEN_PRIMARY_KEYS.includes( key )
            );

            if ( isReserved ) {
                throw new Error(`primary key cannot be reserved word: ${ key }`);
            }
        }

        try {
            description = new CustomType( description );
        } catch (err) {
            err.message = key + ": " + err.message;
            throw err;
        }

        // structure must be static
        Object.freeze( description );

        return description;
    }

    // default behavior
    public static prepareDescription(description, key: string) {
        // redefine me
        return description;
    }

    public primary?: boolean;
    public required: boolean;
    public type: string;
    public const: boolean;
    public enum?: any[];

    constructor(params: ITypeParams) {
        if ( params.primary ) {
            this.primary = true;
        }

        this.type = params.type;
        this.required = params.required || params.primary || false;

        if ( Array.isArray( params.enum ) ) {
            this.enum = params.enum;
        }

        // default can be: false, 0, or function
        if ( "default" in params ) {
            if ( typeof params.default === "function" ) {
                this.default = params.default;
            } else {
                this.default = () => params.default;
            }
        }

        // custom prepare not null value, after default prepare
        if ( typeof params.prepare === "function" ) {
            const prepareByType = this.prepare.bind(this);
            const customPrepare = params.prepare;

            this.prepare = (value, key, model) => {
                value = prepareByType( value, key, model );

                if ( value != null ) {
                    value = customPrepare( value, key, model );
                }

                return value;
            };
        }

        if ( typeof params.toJSON === "function" ) {
            this.toJSON = params.toJSON;
        }


        // custom validate by RegExp or function
        if ( params.validate ) {
            // validate by required, enum, "unique" (ArrayType)
            const validateByType = this.validate.bind(this);

            if ( typeof params.validate === "function" ) {
                const customValidate = params.validate;

                this.validate = (value, modelKey) => {
                    return (
                        validateByType( value, modelKey ) &&
                        (
                            value == null ||
                            customValidate( value, modelKey )
                        )
                    );
                };
            }
            else if ( params.validate instanceof RegExp ) {
                const regExp = params.validate;

                this.validate = (value, modelKey) => {
                    return (
                        validateByType( value, modelKey ) &&
                        (
                            value == null ||
                            regExp.test( value )
                        )
                    );
                };
            }

            else {
                throw new Error("validate should be function or RegExp: " + 
                    invalidValuesAsString( params.validate ));
            }
        }


        // validate key for models with "*"
        if ( params.key ) {
            const customValidateKey = params.key;

            if ( customValidateKey instanceof RegExp ) {
                this.validateKey = (modelKey) => {
                    return customValidateKey.test( modelKey );
                };
            }
            else if ( typeof customValidateKey === "function" ) {
                this.validateKey = customValidateKey;
            }

            else {
                throw new Error("validate key should be function or RegExp: " + 
                    invalidValuesAsString( customValidateKey ));
            }
        }

        // don't change value
        if ( params.const ) {
            this.const = true;
        }
    }

    public default() {
        return null;
    }

    public validateKey(key: string) {
        return true;
    }

    public validate(value, key): boolean {
        if ( this.enum ) {
            if ( value != null ) {
                return this.enum.includes( value );
            }
        }

        return true;
    }

    public prepare(value, key, model): any {
        return value;
    }

    public toJSON(value): any {
        return value;
    }

    public clone(value): any {
        return this.toJSON( value );
    }

    public typeAsString(): string {
        return this.type;
    }

    public equal(selfValue, otherValue, stack): boolean {
        return selfValue === otherValue;
    }
}

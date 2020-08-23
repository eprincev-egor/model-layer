
import {Type, IType, ITypeParams} from "./Type";
import {Model} from "../Model";
import {invalidValuesAsString} from "../utils";
import {
    NoToJSONMethodError, 
    NoCloneMethodError, 
    NoEqualMethodError,
    InvalidValueForCustomClassError
} from "../errors";

export interface ICustomClassTypeParams extends ITypeParams {
    constructor: new (...args: any[]) => any;
    prepare?: (value: any, key: string, model: Model<any>) => InstanceType<this["constructor"]>;
    validate?: 
        ((value: InstanceType<this["constructor"]>, key: string) => boolean) |
        RegExp
    ;
    default?: (() => InstanceType<this["constructor"]>);
    equal?: (
        selfValue: InstanceType<this["constructor"]>, 
        otherValue: InstanceType<this["constructor"]>, 
        stack: any
    ) => boolean;
    clone?: (value: InstanceType<this["constructor"]>, stack: any) => InstanceType<this["constructor"]>;
    toJSON?: (value: InstanceType<this["constructor"]>, stack: any) => any;
}

export interface ICustomClassType<T extends (new(...args: any[]) => any)> extends IType {
    <TConstructor extends (new (...args: any) => any)>(
        params: ICustomClassTypeParams & 
        {constructor: TConstructor}
    ): ICustomClassType<TConstructor>;

    TOutput: InstanceType< T >;
    TInput: InstanceType< T >;
    TJson: unknown;
}

export class CustomClassType extends Type {

    CustomClass: new (...args: any) => any;

    constructor(params: ITypeParams & {constructor: new (...args: any) => any}) {
        super(params);

        this.CustomClass = params.constructor;
    }
    
    prepare(value: any, key: string) {
        if ( value == null ) {
            return null;
        }
    
        const CustomClass = this.CustomClass;
        const className = CustomClass.name;


        if ( value instanceof CustomClass ) {
            return value;
        }

        const valueAsString = invalidValuesAsString( value );
        throw new InvalidValueForCustomClassError({
            className,
            key,
            invalidValue: valueAsString
        });
    }

    typeAsString() {
        return this.CustomClass.name;
    }

    
    toJSON() {
        throw new NoToJSONMethodError({className: this.CustomClass.name});
    }

    clone(model: any, stack: any) {
        throw new NoCloneMethodError({className: this.CustomClass.name});
    }

    equal(): boolean {
        throw new NoEqualMethodError({className: this.CustomClass.name});
    }
}

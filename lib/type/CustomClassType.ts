

import {Type, IType, ITypeParams} from "./Type";

export interface ICustomClassTypeParams extends ITypeParams {
    constructor: new (...args: any[]) => any;
}

export interface ICustomClassType<TConstructor extends (new(...args: any[]) => any)> extends IType {
    (params: ICustomClassTypeParams): ICustomClassType<TConstructor>;
    TOutput: boolean;
    TInput: InstanceType< TConstructor >;
    TJson: unknown;
}

export class CustomClassType extends Type {

}

// tslint:disable: max-classes-per-file
// tslint:disable: member-access

import {Model} from "./Model";
import Collection from "./Collection";

import {IType} from "./type/Type";

import {IAnyType} from "./type/AnyType";
import {IArrayType} from "./type/ArrayType";
import {IBooleanType} from "./type/BooleanType";
// import {AnyType} from "./type/CustomClassType";
import {IDateType} from "./type/DateType";
// import {AnyType} from "./type/ModelType";
import {INumberType} from "./type/NumberType";
import {IObjectType} from "./type/ObjectType";
import {IStringType} from "./type/StringType";
// import {AnyType} from "./type/CollectionType";

const returnParamsWithType: any = (type) => {
    return (params) => ({
        ...params,
        type
    });
};
returnParamsWithType.isTypeHelper = true;

const Types = {
    Number: returnParamsWithType("number") as INumberType,
    String: returnParamsWithType("string") as IStringType,
    Boolean: returnParamsWithType("boolean") as IBooleanType,
    Date: returnParamsWithType("date") as IDateType,
    Array: returnParamsWithType("array") as IArrayType<IType>,
    Object: returnParamsWithType("object") as IObjectType<IType>,
    // Or: (TypeOr as any) as ITypeOr<IType>,
    Any: returnParamsWithType("*") as IAnyType
};

export {Model, Collection, Types};

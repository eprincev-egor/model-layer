// tslint:disable: max-classes-per-file
import {BaseError} from "./BaseError";

// Model errors
export class UnknownPropertyError extends BaseError<{
    propertyName: string
}> {
    getMessage({propertyName}) {
        return {
            ru: `неизвестное свойство: ${propertyName}`,
            en: `unknown property: ${propertyName}`,
        };
    }
}


export class ModelWithoutStructureError extends BaseError<{
    className: string
}> {
    getMessage({className}) {
        return {
            ru: `не объявлен метод ${ className }.structure()`,
            en: `${ className }.structure() is not declared`
        };
    }
}

export class InvalidKeyError extends BaseError<{key: string}> {
    getMessage({key}) {
        return {
            ru: `некорректный ключ: ${ key }`,
            en: `invalid key: ${ key }`
        };
    }
}

export class InvalidValueError extends BaseError<{
    key: string,
    value: string
}> {
    getMessage({key, value}) {
        return {
            ru: `некорректное значение: ${ key }: ${ value }`,
            en: `invalid ${ key }: ${ value }`
        };
    }
}

export class RequiredError extends BaseError<{
    key: string
}> {
    getMessage({key}) {
        return {
            ru: `пропущено обязательное поле: ${ key }`,
            en: `required ${ key }`
        };
    }
}

export class ConstValueError extends BaseError<{
    key: string
}> {
    getMessage({key}) {
        return {
            ru: `невозможно изменить поле только для чтения: ${ key }`,
            en: `cannot assign to read only property: ${ key }`
        };
    }
}

export class DataShouldBeObjectError extends BaseError {
    getMessage() {
        return {
            ru: `ожидается объект row`,
            en: `row must be are object`
        };
    }
}

export class NoToJSONMethodError extends BaseError {
    getMessage({className}) {
        return {
            ru: `невозможно преобразовать [object: ${className}] в json, объявите метод toJSON для этого поля`,
            en: `cannot convert [object: ${className}] to json, need toJSON method for this field`
        };
    }
}

export class NoCloneMethodError extends BaseError {
    getMessage({className}) {
        return {
            ru: `невозможно преобразовать [object: ${className}] в json, объявите метод toJSON для этого поля`,
            en: `cannot convert [object: ${className}] to json, need toJSON method for this field`
        };
    }
}

export class NoEqualMethodError extends BaseError<{className: string}> {
    getMessage({className}) {
        return {
            ru: `невозможно преобразовать [object: ${className}] в json, объявите метод toJSON для этого поля`,
            en: `cannot convert [object: ${className}] to json, need toJSON method for this field`
        };
    }
}

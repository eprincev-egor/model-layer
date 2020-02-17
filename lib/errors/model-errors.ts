// tslint:disable: max-classes-per-file
import {BaseError} from "./BaseError";

// Model errors
export class UnknownPropertyError extends BaseError<{
    propertyName: string
}> {
    getMessage(data: {propertyName: string}) {
        return {
            ru: `неизвестное свойство: ${data.propertyName}`,
            en: `unknown property: ${data.propertyName}`,
        };
    }
}


export class ModelWithoutStructureError extends BaseError<{
    className: string
}> {
    getMessage(data: {className: string}) {
        return {
            ru: `не объявлен метод ${ data.className }.structure()`,
            en: `${ data.className }.structure() is not declared`
        };
    }
}

export class InvalidKeyError extends BaseError<{key: string}> {
    getMessage(data: {key: string}) {
        return {
            ru: `некорректный ключ: ${ data.key }`,
            en: `invalid key: ${ data.key }`
        };
    }
}

export class InvalidValueError extends BaseError<{
    key: string,
    value: string
}> {
    getMessage(data: {key: string, value: string}) {
        return {
            ru: `некорректное значение: ${ data.key }: ${ data.value }`,
            en: `invalid ${ data.key }: ${ data.value }`
        };
    }
}

export class RequiredError extends BaseError<{
    key: string
}> {
    getMessage(data: {key: string}) {
        return {
            ru: `пропущено обязательное поле: ${ data.key }`,
            en: `required ${ data.key }`
        };
    }
}

export class ConstValueError extends BaseError<{
    key: string
}> {
    getMessage(data: {key: string}) {
        return {
            ru: `невозможно изменить поле только для чтения: ${ data.key }`,
            en: `cannot assign to read only property: ${ data.key }`
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

export class InvalidOnArgumentsError extends BaseError {
    getMessage() {
        return {
            ru: `ожидается аргумент listener`,
            en: `expected listener`
        };
    }
}

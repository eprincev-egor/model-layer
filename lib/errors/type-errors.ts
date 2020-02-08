// tslint:disable: max-classes-per-file
import {BaseError} from "./BaseError";

export class CircularStructureToJSONError extends BaseError {
    getMessage() {
        return {
            ru: `Невозможно преобразовать цикличную структуру в JSON`,
            en: `Cannot converting circular structure to JSON`,
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
            ru: `невозможно копировать [object: ${className}], объявите метод clone для этого поля`,
            en: `cannot clone [object: ${className}], need clone method for this field`
        };
    }
}

export class NoEqualMethodError extends BaseError<{className: string}> {
    getMessage({className}) {
        return {
            ru: `невозможно сравнить [object: ${className}], объявите метод equal для этого поля`,
            en: `cannot equal [object: ${className}], need equal method for this field`
        };
    }
}

export class InvalidValueForCustomClassError extends BaseError<{
    className: string;
    key: string;
    invalidValue: string;
}> {
    getMessage({className, key, invalidValue}) {
        return {
            ru: `некорректное значение для класса ${ className }, поле ${key}: ${invalidValue}`,
            en: `invalid value for ${ className }, field ${key}: ${invalidValue}`
        };
    }
}

export class UnknownTypeError extends BaseError<{
    key: string;
    type: string;
}> {
    getMessage({key, type}) {
        return {
            ru: `поле ${key}, неизвестный тип: ${type}`,
            en: `field ${key}, unknown type: ${type}`
        };
    }
}

export class ReservedWordForPrimaryKeyError extends BaseError<{
    key: string;
}> {
    getMessage({key, type}) {
        return {
            ru: `поле ${key} не может быть первичным ключом, потому что это слово занято`,
            en: `field ${key} cannot be primary key, because it reserved word`
        };
    }
}

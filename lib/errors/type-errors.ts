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

export class InvalidValidationError extends BaseError<{
    invalidValue: string;
}> {
    getMessage({invalidValue}) {
        return {
            ru: `validate должен быть функцией или регулярным выражением: ${invalidValue}`,
            en: `validate should be function or RegExp: ${invalidValue}`
        };
    }
}

export class InvalidKeyValidationError extends BaseError<{
    invalidValue: string;
}> {
    getMessage({invalidValue}) {
        return {
            ru: `key validation должен быть функцией или регулярным выражением: ${invalidValue}`,
            en: `key validation should be function or RegExp: ${invalidValue}`
        };
    }
}

export class ConflictFloorCeilRoundError extends BaseError<{
}> {
    getMessage({}) {
        return {
            ru: `разрешено использовать только один тип округления: floor, round, ceil`,
            en: `conflicting parameters: use only round or only ceil or only floor`
        };
    }
}

export class ConflictNullAndZeroParameterError extends BaseError<{
}> {
    getMessage({}) {
        return {
            ru: `разрешено использовать только один обработки null: nullAsZero, zeroAsNull`,
            en: `conflicting parameters: use only nullAsZero or only zeroAsNull`
        };
    }
}

export class InvalidNumberError extends BaseError<{
    key: string;
    invalidValue: string;
}> {
    getMessage({key, invalidValue}) {
        return {
            ru: `некорректное число для поля ${key}: ${invalidValue}`,
            en: `invalid number for ${key}: ${invalidValue}`
        };
    }
}

export class InvalidRoundError extends BaseError<{
    roundType: string;
    invalidValue: string;
}> {
    getMessage({roundType, invalidValue}) {
        return {
            ru: `некорректное значение для параметра ${roundType}: ${invalidValue}`,
            en: `invalid ${roundType}: ${invalidValue}`
        };
    }
}

export class ConflictNullAndFalseParameterError extends BaseError<{
}> {
    getMessage({}) {
        return {
            ru: `разрешено использовать только один обработки null: nullAsFalse, falseAsNull`,
            en: `conflicting parameters: use only nullAsFalse or only falseAsNull`
        };
    }
}

export class InvalidBooleanError extends BaseError<{
    key: string;
    invalidValue: string;
}> {
    getMessage({key, invalidValue}) {
        return {
            ru: `некорректный boolean для поля ${key}: ${invalidValue}`,
            en: `invalid boolean for ${key}: ${invalidValue}`
        };
    }
}

export class ConflictNullAndEmptyStringParameterError extends BaseError<{
}> {
    getMessage({}) {
        return {
            ru: `разрешено использовать только один обработки null: nullAsEmpty, emptyAsNull`,
            en: `conflicting parameters: use only nullAsEmpty or only emptyAsNull`
        };
    }
}

export class ConflictLowerUpperParameterError extends BaseError<{
}> {
    getMessage({}) {
        return {
            ru: `разрешено использовать только один преобразования регистра: lower, upper`,
            en: `conflicting parameters: use only lower or only upper`
        };
    }
}

export class InvalidStringError extends BaseError<{
    key: string;
    invalidValue: string;
}> {
    getMessage({key, invalidValue}) {
        return {
            ru: `некорректная строка для поля ${key}: ${invalidValue}`,
            en: `invalid string for ${key}: ${invalidValue}`
        };
    }
}

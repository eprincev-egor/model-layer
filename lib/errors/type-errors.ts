// tslint:disable: max-classes-per-file
import {BaseError} from "./BaseError";
import {eol} from "../utils";

export class CircularStructureToJSONError extends BaseError {
    getMessage() {
        return {
            ru: `Невозможно преобразовать цикличную структуру в JSON`,
            en: `Cannot converting circular structure to JSON`,
        };
    }
}

export class NoToJSONMethodError extends BaseError {
    getMessage(data: {className: string}) {
        return {
            ru: `невозможно преобразовать [object: ${data.className}] в json, объявите метод toJSON для этого поля`,
            en: `cannot convert [object: ${data.className}] to json, need toJSON method for this field`
        };
    }
}

export class NoCloneMethodError extends BaseError {
    getMessage(data: {className: string}) {
        return {
            ru: `невозможно копировать [object: ${data.className}], объявите метод clone для этого поля`,
            en: `cannot clone [object: ${data.className}], need clone method for this field`
        };
    }
}

export class NoEqualMethodError extends BaseError<{className: string}> {
    getMessage(data: {className: string}) {
        return {
            ru: `невозможно сравнить [object: ${data.className}], объявите метод equal для этого поля`,
            en: `cannot equal [object: ${data.className}], need equal method for this field`
        };
    }
}

export class InvalidValueForCustomClassError extends BaseError<{
    className: string;
    key: string;
    invalidValue: string;
}> {
    getMessage(data: {className: string, key: string, invalidValue: string}) {
        return {
            ru: `некорректное значение для класса ${ data.className }, поле ${data.key}: ${data.invalidValue}`,
            en: `invalid value for ${ data.className }, field ${data.key}: ${data.invalidValue}`
        };
    }
}

export class UnknownTypeError extends BaseError<{
    key: string;
    type: string;
}> {
    getMessage(data: {key: string, type: string}) {
        return {
            ru: `поле ${data.key}, неизвестный тип: ${data.type}`,
            en: `field ${data.key}, unknown type: ${data.type}`
        };
    }
}

export class ReservedWordForPrimaryKeyError extends BaseError<{
    key: string;
}> {
    getMessage(data: {key: string, type: string}) {
        return {
            ru: `поле ${data.key} не может быть первичным ключом, потому что это слово занято`,
            en: `field ${data.key} cannot be primary key, because it reserved word`
        };
    }
}

export class InvalidValidationError extends BaseError<{
    invalidValue: string;
}> {
    getMessage(data: {invalidValue: string}) {
        return {
            ru: `validate должен быть функцией или регулярным выражением: ${data.invalidValue}`,
            en: `validate should be function or RegExp: ${data.invalidValue}`
        };
    }
}

export class InvalidKeyValidationError extends BaseError<{
    invalidValue: string;
}> {
    getMessage(data: {invalidValue: string}) {
        return {
            ru: `key validation должен быть функцией или регулярным выражением: ${data.invalidValue}`,
            en: `key validation should be function or RegExp: ${data.invalidValue}`
        };
    }
}

export class ConflictFloorCeilRoundError extends BaseError<{
}> {
    getMessage() {
        return {
            ru: `разрешено использовать только один тип округления: floor, round, ceil`,
            en: `conflicting parameters: use only round or only ceil or only floor`
        };
    }
}

export class ConflictNullAndZeroParameterError extends BaseError<{
}> {
    getMessage() {
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
    getMessage(data: {key: string, invalidValue: string}) {
        return {
            ru: `некорректное число для поля ${data.key}: ${data.invalidValue}`,
            en: `invalid number for ${data.key}: ${data.invalidValue}`
        };
    }
}

export class InvalidRoundError extends BaseError<{
    roundType: string;
    invalidValue: string;
}> {
    getMessage(data: {roundType: string, invalidValue: string}) {
        return {
            ru: `некорректное значение для параметра ${data.roundType}: ${data.invalidValue}`,
            en: `invalid ${data.roundType}: ${data.invalidValue}`
        };
    }
}

export class ConflictNullAndFalseParameterError extends BaseError<{
}> {
    getMessage() {
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
    getMessage(data: {key: string, invalidValue: string}) {
        return {
            ru: `некорректный boolean для поля ${data.key}: ${data.invalidValue}`,
            en: `invalid boolean for ${data.key}: ${data.invalidValue}`
        };
    }
}

export class ConflictNullAndEmptyStringParameterError extends BaseError<{
}> {
    getMessage() {
        return {
            ru: `разрешено использовать только один обработки null: nullAsEmpty, emptyAsNull`,
            en: `conflicting parameters: use only nullAsEmpty or only emptyAsNull`
        };
    }
}

export class ConflictLowerUpperParameterError extends BaseError<{
}> {
    getMessage() {
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
    getMessage(data: {key: string, invalidValue: string}) {
        return {
            ru: `некорректная строка для поля ${data.key}: ${data.invalidValue}`,
            en: `invalid string for ${data.key}: ${data.invalidValue}`
        };
    }
}

export class InvalidDateError extends BaseError<{
    key: string;
    invalidValue: string;
}> {
    getMessage(data: {key: string, invalidValue: string}) {
        return {
            ru: `некорректная дата для поля ${data.key}: ${data.invalidValue}`,
            en: `invalid date for ${data.key}: ${data.invalidValue}`
        };
    }
}

export class InvalidCollectionError extends BaseError<{
    key: string;
    className: string;
    invalidValue: string;
}> {
    getMessage(data: {className: string, key: string, invalidValue: string}) {
        return {
            ru: `некорректная коллекция ${data.className} для поля ${data.key}: ${data.invalidValue}`,
            en: `invalid collection ${data.className} for ${data.key}: ${data.invalidValue}`
        };
    }
}

export class InvalidModelError extends BaseError<{
    key: string;
    className: string;
    invalidValue: string;
    modelError?: string;
}> {
    getMessage(data: {className: string, key: string, invalidValue: string, modelError?: string}) {
        const postfix = data.modelError ? 
            `,${eol} ${data.modelError}` : 
            "";
        
        return {
            ru: `некорректная модель ${data.className} для поля ${data.key}: ${data.invalidValue}${ postfix }`,
            en: `invalid model ${data.className} for ${data.key}: ${data.invalidValue}${ postfix }`
        };
    }
}

export class InvalidOrValueError extends BaseError<{
    key: string;
    typesNames: string[];
    invalidValue: string;
}> {
    getMessage(data: {key: string, typesNames: string[], invalidValue: string}) {
        return {
            ru: `некорректное значение для типов: ${data.typesNames.join(" or ")}, для поля ${data.key}: ${data.invalidValue}`,
            en: `invalid value for types: ${data.typesNames.join(" or ")}, for ${data.key}: ${data.invalidValue}`
        };
    }
}

export class RequiredOrArrayError extends BaseError<{
}> {
    getMessage() {
        return {
            ru: `необходимо указать перечисление типов`,
            en: `required 'or' array of type descriptions`
        };
    }
}

export class EmptyOrArrayError extends BaseError<{
}> {
    getMessage() {
        return {
            ru: `перечисление типов не должно быть пустым массивом`,
            en: `empty 'or' array of type descriptions`
        };
    }
}

export class InvalidOrTypeError extends BaseError<{
    index: number;
    invalidValue: string;
}> {
    getMessage(data: {index: number, invalidValue: string}) {
        return {
            ru: `некорректное значение для типа or[${ data.index }]: ${ data.invalidValue }`,
            en: `invalid type description or[${ data.index }]: ${ data.invalidValue }`
        };
    }
}

export class ConflictNullAndEmptyObjectParameterError extends BaseError<{
}> {
    getMessage() {
        return {
            ru: `разрешено использовать только один обработки null: nullAsEmpty, emptyAsNull`,
            en: `conflicting parameters: use only nullAsEmpty or only emptyAsNull`
        };
    }
}

export class InvalidObjectError extends BaseError<{
    elementType: string;
    key: string;
    invalidValue: string;
}> {
    getMessage(data: {key: string, elementType: string, invalidValue: string}) {
        return {
            ru: `некорректный объект {*: ${data.elementType}} для поля ${data.key}: ${data.invalidValue}`,
            en: `invalid object {*: ${data.elementType}} for ${data.key}: ${data.invalidValue}`
        };
    }
}

export class InvalidObjectElementError extends BaseError<{
    modelKey: string;
    objectKey: string;
    elementType: string;
    invalidValue: string;
    childError: string;
}> {
    getMessage(data: {
        modelKey: string, objectKey: string, 
        elementType: string, 
        invalidValue: string, childError: string
    }) {
        return {
            ru: `некорректное значение для типа ${data.elementType} в свойстве объекта object[${ data.objectKey }] для поля модели ${data.modelKey}: ${data.invalidValue},${eol} ${data.childError}`,
            en: `invalid value for type ${data.elementType} in property object[${ data.objectKey }] for model field ${data.modelKey}: ${data.invalidValue},${eol} ${data.childError}`
        };
    }
}

export class ConflictNullAndEmptyArrayParameterError extends BaseError<{
}> {
    getMessage() {
        return {
            ru: `разрешено использовать только один обработки null: nullAsEmpty, emptyAsNull`,
            en: `conflicting parameters: use only nullAsEmpty or only emptyAsNull`
        };
    }
}

export class InvalidArrayError extends BaseError<{
    elementType: string;
    key: string;
    invalidValue: string;
}> {
    getMessage(data: {elementType: string, key: string, invalidValue: string}) {
        return {
            ru: `некорректный массив ${data.elementType}[] для поля ${data.key}: ${data.invalidValue}`,
            en: `invalid array ${data.elementType}[] for ${data.key}: ${data.invalidValue}`
        };
    }
}

export class InvalidArrayElementError extends BaseError<{
    modelKey: string;
    index: number;
    elementType: string;
    invalidValue: string;
    childError: string;
}> {
    getMessage(data: {
        modelKey: string, index: number, 
        elementType: string, 
        invalidValue: string, childError: string
    }) {
        return {
            ru: `некорректно значение для элемента массива ${data.elementType}[] по индексу ${data.index} для поля модели ${data.modelKey}: ${data.invalidValue},${eol} ${data.childError}`,
            en: `invalid element for array ${data.elementType}[] at ${data.index} for model field ${data.modelKey}: ${data.invalidValue},${eol} ${data.childError}`
        };
    }
}

export class DuplicateValueForUniqueArrayError extends BaseError<{
    key: string;
    invalidArr: string;
    duplicateValue: string;
}> {    
    getMessage(data: {key: string, duplicateValue: string, invalidArr: string}) {
        return {
            ru: `${data.key} не уникальный массив, дублируется значение ${data.duplicateValue} внутри массива: ${ data.invalidArr }`,
            en: `${data.key} is not unique, duplicated value ${data.duplicateValue} inside arr: ${ data.invalidArr }`
        };
    }
}

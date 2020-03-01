// tslint:disable: max-classes-per-file
import {BaseError} from "./BaseError";

// Collection errors

export class CollectionShouldHaveModelError extends BaseError<{
    className: string
}> {
    getMessage({className}) {
        return {
            ru: `необходимо объявить метод: ${ className }.Model()`,
            en: `${ className }.Model() is not declared`
        };
    }
}

export class WrongModelConstructorError extends BaseError<{
    collection: string;
    invalid: string;
    expected: string;
}> {
    getMessage({collection, invalid, expected}) {
        return {
            ru: `${collection}: ожидается модель класса: ${ expected }, но передана модель: ${ invalid }`,
            en: `${collection}: expected model constructor ${ expected }, but have ${ invalid }`
        };
    }
}

export class InvalidModelRowError extends BaseError<{
    invalidValue: string;
    model: string;
}> {
    getMessage({invalidValue, model}) {
        return {
            ru: `некорректные данные ${invalidValue} для моделей ${model}`,
            en: `invalid row ${invalidValue} for model ${model}`
        };
    }
}

export class InvalidSortParamsError extends BaseError<{
    invalidValue: string;
}> {
    getMessage({invalidValue}) {
        return {
            ru: `некорректное поле или функция сравнения ${invalidValue}`,
            en: `invalid compareFunction or key: ${ invalidValue }`
        };
    }
}

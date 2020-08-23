// tslint:disable: max-classes-per-file
import {BaseError} from "./BaseError";

// Collection errors

export class CollectionShouldHaveModelError extends BaseError<{
    className: string
}> {
    getMessage(data: {className: string}) {
        return {
            ru: `необходимо объявить метод: ${ data.className }.Model()`,
            en: `${ data.className }.Model() is not declared`
        };
    }
}

export class WrongModelConstructorError extends BaseError<{
    collection: string;
    invalid: string;
    expected: string;
}> {
    getMessage(data: {collection: any, invalid: any, expected: any}) {
        return {
            ru: `${data.collection}: ожидается модель класса: ${ data.expected }, но передана модель: ${ data.invalid }`,
            en: `${data.collection}: expected model constructor ${ data.expected }, but have ${ data.invalid }`
        };
    }
}

export class InvalidModelRowError extends BaseError<{
    invalidValue: string;
    model: string;
}> {
    getMessage(data: {invalidValue: any, model: any}) {
        return {
            ru: `некорректные данные ${data.invalidValue} для моделей ${data.model}`,
            en: `invalid row ${data.invalidValue} for model ${data.model}`
        };
    }
}

export class InvalidSortParamsError extends BaseError<{
    invalidValue: string;
}> {
    getMessage(data: {invalidValue: any}) {
        return {
            ru: `некорректное поле или функция сравнения ${data.invalidValue}`,
            en: `invalid compareFunction or key: ${ data.invalidValue }`
        };
    }
}

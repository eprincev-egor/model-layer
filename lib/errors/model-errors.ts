// tslint:disable: max-classes-per-file
import {BaseError} from "./BaseError";

// Model errors
export class UnknownPropertyError extends BaseError.create<{
    propertyName: string
}>({
    messages: {
        ru: ({propertyName}) => `неизвестное свойство: ${propertyName}`,
        en: ({propertyName}) => `unknown property: ${propertyName}`,
    }
}) {}


export class ModelWithoutStructureError extends BaseError.create<{
    className: string
}>({
    messages: {
        ru: ({className}) => `не объявлен метод ${ className }.structure()`,
        en: ({className}) => `${ className }.structure() is not declared`,
    }
}) {}

export class InvalidKeyError extends BaseError.create<{
    key: string
}>({
    messages: {
        ru: ({key}) => `некорректный ключ: ${ key }`,
        en: ({key}) => `invalid key: ${ key }`,
    }
}) {}

export class InvalidValueError extends BaseError.create<{
    key: string,
    value: string
}>({
    messages: {
        ru: ({key, value}) => `некорректное значение: ${ key }: ${ value }`,
        en: ({key, value}) => `invalid ${ key }: ${ value }`,
    }
}) {}

export class RequiredError extends BaseError.create<{
    key: string
}>({
    messages: {
        ru: ({key}) => `пропущено обязательное поле: ${ key }`,
        en: ({key}) => `required ${ key }`,
    }
}) {}

export class ConstValueError extends BaseError.create<{
    key: string
}>({
    messages: {
        ru: ({key}) => `невозможно изменить поле только для чтения: ${ key }`,
        en: ({key}) => `cannot assign to read only property: ${ key }`,
    }
}) {}

export class DataShouldBeObjectError extends BaseError.create<{
    
}>({
    messages: {
        ru: ({}) => `ожидается объект row`,
        en: ({}) => `row must be are object`,
    }
}) {}

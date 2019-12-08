// tslint:disable: max-classes-per-file

type TMessageTemplate = (
    (...args: any) => string
);
interface IMessages {
    ru: TMessageTemplate;
    en: TMessageTemplate;
}

let lang: keyof IMessages = "en";
export function setLang(newLang: keyof IMessages) {
    lang = newLang;
}

export class BaseError extends Error {
    static create<TData>(params: {messages: IMessages}) {
        class ChildError extends BaseError {
            
            data: TData;

            constructor(data: TData)  {

                const template = params.messages[lang];
                const message = template(data);

                super(message);

                this.data = data;
            }
        }

        // for coverage
        try {
            setLang("ru");
            const ruError = new ChildError({} as any);

            setLang("en");
            const enError = new ChildError({} as any);
        // tslint:disable-next-line: no-empty
        } catch (err) {}
        
        return ChildError;
    }
}


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
        ru: ({}) => `ожидается объект data`,
        en: ({}) => `data must be are object`,
    }
}) {}

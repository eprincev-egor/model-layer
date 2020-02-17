
interface IMessages {
    ru: string;
    en: string;
}

let lang: keyof IMessages = "en";
export function setLang(newLang: keyof IMessages) {
    lang = newLang;
}

export abstract class BaseError<TData extends {[key: string]: any} = {}> extends Error {

    constructor(templateData: TData) {
        super();
        this.message = this.getMessage(templateData)[ lang ];
    }
    
    abstract getMessage(templateData: TData): IMessages;
}

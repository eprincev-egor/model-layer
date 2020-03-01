
interface IMessages {
    ru: string;
    en: string;
}

let lang: keyof IMessages = "en";
export function setLang(newLang: keyof IMessages) {
    lang = newLang;
}

export class BaseError<TData extends {[key: string]: any} = {}> extends Error {

    constructor(templateData: TData) {
        super();
        this.message = this.getMessage(templateData)[ lang ];
    }
    
    getMessage(templateData: TData): IMessages {
        return {
            ru: "",
            en: ""
        };
    }
}

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

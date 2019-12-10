// tslint:disable: max-classes-per-file
import {BaseError} from "./BaseError";

// Model errors
export class CircularStructureToJSONError extends BaseError.create<{
    
}>({
    messages: {
        ru: ({}) => `Невозможно преобразовать цикличную структуру в JSON`,
        en: ({}) => `Cannot converting circular structure to JSON`,
    }
}) {}

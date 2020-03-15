import "reflect-metadata";
import EventEmitter from "events";
import {IMeta} from "./Meta";

export type InputRow<SomeModel extends Model> = {
    [key in keyof SomeModel["row"]]: InputValue< SomeModel["row"][key] >;
};

export type InputValue<Value> = (
    Value extends Model ?
        Value["row"] | Value :
    Value extends Model[] ?
        Value | Array<InputRow<Value[0]>> :
        Value
);

export abstract class Model extends EventEmitter {
    private static meta: {
        [key: string]: IMeta;
    };

    row: any;

    constructor(inputRow?: any) {
        super();

        this.row = {};
        for (const key in inputRow) {
            const value = inputRow[ key ];
            const meta = getPropMeta(  );
            this.row[ key ] = value;
        }
    }

    get<Key extends keyof this["row"]>(key: Key): this["row"][Key] {
        return this.row[ key ];
    }

    set(row: Partial<this["row"]>): this {
        this.row = {...this.row, row};
        return this;
    }
}

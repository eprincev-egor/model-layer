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
    readonly row: any;

    private meta!: {
        [key: string]: IMeta;
    };

    constructor(inputRow?: any) {
        super();

        this.row = {};
        for (const key in this.meta) {
            const propMeta = this.meta[ key ];
            if ( propMeta.default ) {
                this.row[ key ] = propMeta.default();
            }
        }

        for (const key in inputRow) {
            const value = inputRow[ key ];
            this.row[ key ] = value;
        }

        this.row = Object.freeze(this.row);
    }

    get<Key extends keyof this["row"]>(key: Key): this["row"][Key] {
        return this.row[ key ];
    }

    set(row: Partial<this["row"]>): this {
        const newRow: any = {};
        let hasChanges = false;

        for (const key in this.row) {
            newRow[ key ] = this.row[ key ];
        }
        for (const key in row) {
            const oldValue = this.row[ key ];
            const newValue = row[ key ];

            if ( newValue !== oldValue ) {
                hasChanges = true;
                newRow[ key ] = row[ key ];
            }
        }
        
        if ( hasChanges ) {
            (this as any).row = Object.freeze(newRow);
        }

        return this;
    }

    hasValue<Key extends keyof this["row"]>(key: Key): boolean {
        return key in this.row;
    }
}

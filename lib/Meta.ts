import "reflect-metadata";
import {Model} from "./Model";

export function Prop(key: string) {
    return {
        Default(defaultValue: () => any) {
            return (targetClass: (new (...args: any) => Model)) => {
                setPropMeta(targetClass, key, {
                    default: defaultValue
                });
            };
        }
    };
}

function setPropMeta(targetClass: any, key: string, meta: any) {
    const classMeta = targetClass.meta || {};
    targetClass.meta = meta;

    const propMeta = classMeta[ key ] || {};
    meta[ key ] = propMeta;

    for (const metaKey in meta) {
        propMeta[ metaKey ] = meta[ metaKey ];
    }
}



export interface IMeta {
    default: () => any;
}

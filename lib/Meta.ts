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

function setPropMeta(targetClass: any, key: string, partialPropMeta: any) {
    const parentClassMeta = targetClass.prototype.meta || {};
    const classMeta = Object.create(parentClassMeta);
    targetClass.prototype.meta = classMeta;

    const propMeta = classMeta[ key ] || {};
    classMeta[ key ] = propMeta;

    for (const metaKey in partialPropMeta) {
        propMeta[ metaKey ] = partialPropMeta[ metaKey ];
    }
}



export interface IMeta {
    default: () => any;
}



import {Type, IType, ITypeParams} from "./Type";
import {invalidValuesAsString} from "../utils";

type ElementType < T extends any[] > = (
    // tslint:disable-next-line: no-shadowed-variable
    T extends ReadonlyArray< infer ElementType > ? 
        ElementType : 
        never
);

export interface IOrTypeParams extends ITypeParams {
    or: IType[];
}

export interface IOrType<T extends IType> extends IType {
    <TOrTypes extends IType[]>(
        params: IOrTypeParams &
        {or: TOrTypes}
    ): ElementType< TOrTypes >;
    
    TOutput: T["TOutput"];
    TInput: T["TInput"];
    TJson: T["TJson"];
}

export class OrType extends Type {

    static prepareDescription(description, key) {
        if ( description.type === "or" ) {
            // prepare OR description
            description.or = description.or.map((childDescription) =>
                Type.create( childDescription, key )
            );
        }
    }


    or: Type[];

    constructor({
        or = [],
        ...otherParams
    }: IOrTypeParams) {
        super(otherParams);

        this.or = or as any;
    }

    prepare(originalValue, key, model) {
        if ( originalValue == null ) {
            return null;
        }

        let value;
        let currentType: Type = null;

        for (let i = 0, n = this.or.length; i < n; i++) {
            const description = this.or[i];

            try {
                value = description.prepare(originalValue, key, model);
            } catch (err) {
                continue;
            }

            currentType = description;
            break;
        }

        if ( !currentType ) {
            const valueAsString = invalidValuesAsString( originalValue );
            const typeName = this.or.map((childDescription) => 
                childDescription.type
            ).join(" or ");

            throw new Error(`invalid ${typeName} for ${key}: ${valueAsString}`);
        }

        return value;
    }
}

import {Type, IType, ITypeParams} from "./Type";
import {Model} from "../Model";
import {invalidValuesAsString} from "../utils";
import {value2json, equal} from "./AnyType";

type ElementType < T extends any[] > = (
    // tslint:disable-next-line: no-shadowed-variable
    T extends ReadonlyArray< infer ElementType > ? 
        ElementType : 
        never
);

type TypesOrModelsOrCollections = (
    Array<
        IType | 
        (new(...args: any) => Model)
    >
);

export interface IOrTypeParams extends ITypeParams {
    or: TypesOrModelsOrCollections;
}

export interface IOrType<T extends IType> extends IType {
    <TOrTypes extends TypesOrModelsOrCollections>(
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
            try {
                description.or = description.or.map((childDescription) =>
                    Type.create( childDescription, key )
                );
            } catch (err) {
                return;
            }
        }
    }


    or: Type[];

    constructor({
        or,
        ...otherParams
    }: IOrTypeParams) {
        super(otherParams);

        if ( !Array.isArray(or) ) {
            throw new Error("expected 'or' array of type descriptions");
        }
        if ( !or.length ) {
            throw new Error("empty 'or' array of type descriptions");
        }

        for (let i = 0, n = or.length; i < n; i++) {
            const elem = or[i];

            if ( elem instanceof Type ) {
                continue;
            }
            throw new Error(`invalid type description or[${ i }]: ${ invalidValuesAsString(elem) }`);
        }

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

    equal(selfValue, otherValue, stack) {
        return equal(selfValue, otherValue, stack);
    }

    toJSON(value, stack = []) {
        return value2json( value, stack );
    }
}

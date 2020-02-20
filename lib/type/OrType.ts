import {Type, IType, ITypeParams} from "./Type";
import {Model} from "../Model";
import {invalidValuesAsString} from "../utils";
import {value2json, equal, clone} from "./AnyType";
import {
    InvalidOrValueError,
    RequiredOrArrayError,
    EmptyOrArrayError,
    InvalidOrTypeError
} from "../errors";
import EqualStack from "../EqualStack";

type ElementType < T extends any[] > = (
    // tslint:disable-next-line: no-shadowed-variable
    T extends ReadonlyArray< infer ElementType > ? 
        ElementType : 
        never
);

type TypesOrModelsOrCollections = (
    Array<
        IType | 
        (new(...args: any) => Model<any>)
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

    static prepareDescription(description: any, key: string) {
        if ( description.type === "or" ) {
            // prepare OR description
            try {
                description.or = description.or.map((childDescription: any) =>
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
            throw new RequiredOrArrayError({});
        }
        if ( !or.length ) {
            throw new EmptyOrArrayError({});
        }

        for (let i = 0, n = or.length; i < n; i++) {
            const elem = or[i];

            if ( elem instanceof Type ) {
                continue;
            }
            throw new InvalidOrTypeError({
                index: i,
                invalidValue: invalidValuesAsString(elem)
            });
        }

        this.or = or as any;
    }

    prepare(originalValue: any, key: string, model: Model<any>) {
        if ( originalValue == null ) {
            return null;
        }

        let value;
        let currentType: Type | null = null;

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
            
            throw new InvalidOrValueError({
                key,
                invalidValue: valueAsString,
                typesNames: this.or.map((childDescription) => 
                    childDescription.type
                )
            });
        }

        return value;
    }

    clone(value: any, stack: EqualStack) {
        return clone(value, stack);
    }

    equal(selfValue: any, otherValue: any, stack: EqualStack) {
        return equal(selfValue, otherValue, stack);
    }

    toJSON(value: any, stack: any[]) {
        return value2json( value, stack );
    }
}

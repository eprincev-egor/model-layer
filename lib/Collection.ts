
import * as EventEmitter from "events";
import {Model, ISimpleObject, JSONData} from "./Model";
import EqualStack from "./EqualStack";
import {invalidValuesAsString, isPlainObject} from "./utils";

type IRow<TModel extends Model<ISimpleObject>> = TModel["data"] | TModel;
type IRows<
    TCollection extends Collection<Model<ISimpleObject>>, 
    TModel extends Model<ISimpleObject>
> = (
    TCollection | 
    Array< IRow<TModel> >
);

interface IAddEvent<TCollection, TModel> {
    type: "add";
    model: TModel;
    collection: TCollection;
}

interface IRemoveEvent<TCollection, TModel> {
    type: "remove";
    model: TModel;
    collection: TCollection;
}

// tslint:disable-next-line:interface-name
declare interface Collection<TModel extends Model<ISimpleObject>> {
    // events
    on(
        event: "add", 
        listener: (event: IAddEvent<Collection<TModel>, TModel>) => void
    ): this;

    on(
        event: "remove", 
        listener: (event: IRemoveEvent<Collection<TModel>, TModel>) => void
    ): this;
}

class Collection<TModel extends Model<ISimpleObject>> extends EventEmitter {
    public models: TModel[];
    public length: number;
    public Model: new (object) => TModel;

    constructor(rows?: TModel[] | Array<TModel["data"]>) {
        super();

        if ( !this.constructor.prototype.hasOwnProperty( "Model" ) ) {
            const constructor = this.constructor as any;
            const structure = constructor.data;
            let CustomModel;

            const result = structure();
            if ( result && result.prototype instanceof Model ) {
                CustomModel = result;
            }
            else {
                // tslint:disable-next-line:max-classes-per-file
                CustomModel = class extends Model<object> {
                    public static data() {
                        return result;
                    }
                };
            }

            this.constructor.prototype.Model = CustomModel;
        }

        this.models = [];

        if ( rows instanceof Array ) {
            rows.forEach((row) => {
                const model = this.prepareRow( row );
                this.models.push( model );
            });

            this.length = rows.length;
        } else {
            this.length = 0;
        }
    }

    public at(index: number, model?: TModel): TModel {
        // set
        if ( model ) {
            const removedModel = this.models[ index ];

            model = this.prepareRow( model );
            this.models[ index ] = model;
            this.length = this.models.length;

            if ( removedModel ) {
                const removeEvent: IRemoveEvent<this, TModel> = {
                    type: "remove",
                    collection: this,
                    model: removedModel
                };
                this.emit("remove", removeEvent);
            }

            const addEvent: IAddEvent<this, TModel> = {
                type: "add",
                model,
                collection: this
            };
            this.emit("add", addEvent);
        } 
        // get
        else {
            return this.models[ index ];
        }
    }

    public prepareRow(row: TModel["data"] | TModel | Model<object>): TModel {
        const CustomModel = this.Model;
        let model: TModel;
        
        if ( row instanceof CustomModel ) {
            model = row;
            return model;
        }

        if ( row instanceof Model ) {
            row = row.data;
        }
        
        if ( isPlainObject(row) ) {
            model = new CustomModel( row );
        }
        else {
            throw new Error( `invalid model: ${ invalidValuesAsString( row ) }` );
        }

        return model;
    }

    public push(...models: Array<IRow<TModel>>) {
        if ( !models.length ) {
            return;
        }

        const addedModels = [];
        for (let i = 0, n = models.length; i < n; i++) {
            const inputModel = models[i];
            const model = this.prepareRow( inputModel );

            addedModels.push( model );
            this.models.push( model );
        }
        
        this.length = this.models.length;

        for (let i = 0, n = addedModels.length; i < n; i++) {
            const model = addedModels[i];
            
            const addEvent: IAddEvent<this, TModel> = {
                type: "add",
                model,
                collection: this
            };
            this.emit("add", addEvent);
        }
    }

    public add(...models) {
        if ( !models.length ) {
            return;
        }

        let inputModels = [];
        for (let i = 0, n = models.length; i < n; i++) {
            const modelOrArr = models[i];

            if ( Array.isArray(modelOrArr) ) {
                const arr = modelOrArr;
                inputModels = inputModels.concat( arr );
            }
            else {
                const model = modelOrArr;
                inputModels.push( model );
            }
        }

        const addedModels = [];
        for (let i = 0, n = inputModels.length; i < n; i++) {
            let model = inputModels[i];

            model = this.prepareRow( model );
            addedModels.push( model );
            this.models.push( model );
        }
        
        this.length = this.models.length;

        for (let i = 0, n = addedModels.length; i < n; i++) {
            const model = addedModels[i];
            
            const addEvent: IAddEvent<this, TModel> = {
                type: "add",
                model,
                collection: this
            };
            this.emit("add", addEvent);
        }
    }

    public forEach(
        iteration: (model: TModel, index: number, models: TModel[]) => void, 
        context?
    ): void {
        this.models.forEach(iteration, context || this);
    }

    public each(
        iteration: (model: TModel, index: number, models: TModel[]) => void, 
        context?
    ): void {
        this.models.forEach(iteration, context || this);
    }

    public find(
        iteration: (model: TModel, index: number, models: TModel[]) => boolean, 
        context?
    ): TModel {
        return this.models.find(iteration, context || this);
    }

    public findIndex(
        iteration: (model: TModel, index: number, models: TModel[]) => boolean, 
        context?
    ): number {
        return this.models.findIndex(iteration, context || this);
    }

    public filter(
        iteration: (model: TModel, index: number, models: TModel[]) => boolean, 
        context?
    ): TModel[] {
        return this.models.filter(iteration, context || this);
    }

    public map<T>(
        iteration: (model: TModel, index: number, models: TModel[]) => T, 
        context?
    ): T[] {
        return this.models.map(iteration, context || this);
    }

    public flatMap<TArr extends any[]>(
        iteration: (model: TModel, index: number, models: TModel[]) => TArr, 
        context?
    ): Array<TArr[0]> {
        const result = this.models.map(iteration, context || this);
            
        let output = [];
        for (let i = 0, n = result.length; i < n; i++) {
            const elem = result[ i ];

            if ( Array.isArray(elem) ) {
                output = output.concat( elem );
            }
            else {
                output.push( elem );
            }
        }

        return output;
    }

    public reduce<T>(
        iteration: (total: T, nextModel: TModel) => T,
        initialValue?: T
    ): T {
        return this.models.reduce(iteration, initialValue);
    }

    public reduceRight<T>(
        iteration: (total: T, nextModel: TModel) => T,
        initialValue?: T
    ): T {
        return this.models.reduceRight(iteration, initialValue);
    }

    public every(
        iteration: (model: TModel, index: number, models: TModel[]) => boolean, 
        context?
    ): boolean {
        return this.models.every(iteration, context || this);
    }

    public some(
        iteration: (model: TModel, index: number, models: TModel[]) => boolean, 
        context?
    ): boolean {
        return this.models.some(iteration, context || this);
    }

    public slice(begin?: number, end?: number): TModel[] {
        return this.models.slice(begin, end);
    }

    public flat(): TModel[] {
        return this.models.slice();
    }

    public indexOf(searchElement: TModel, fromIndex?: number): number {
        return this.models.indexOf(searchElement, fromIndex);
    }

    public lastIndexOf(searchElement: TModel, fromIndex?: number): number {
        if ( arguments.length === 2 ) {
            return this.models.lastIndexOf(searchElement, fromIndex);
        }
        else {
            return this.models.lastIndexOf(searchElement);
        }
    }

    public includes(searchElement: TModel, fromIndex?: number): boolean {
        return this.models.includes(searchElement, fromIndex);
    }

    public pop(): TModel {
        const model = this.models.pop();
        this.length = this.models.length;
        
        const removeEvent: IRemoveEvent<this, TModel> = {
            type: "remove",
            collection: this,
            model
        };
        this.emit("remove", removeEvent);

        return model;
    }

    public shift(): TModel {
        const model = this.models.shift();
        this.length = this.models.length;

        const removeEvent: IRemoveEvent<this, TModel> = {
            type: "remove",
            collection: this,
            model
        };
        this.emit("remove", removeEvent);

        return model;
    }

    public unshift(...models: TModel[] | object[]) {
        if ( !models.length ) {
            return;
        }

        const preparedModels: TModel[] = [];
        for (let i = 0, n = models.length; i < n; i++) {
            const row = models[i];
            const model = this.prepareRow( row );

            preparedModels.push( model );
        }

        this.models.unshift.apply(this.models, preparedModels);
        
        this.length = this.models.length;

        for (let i = 0, n = preparedModels.length; i < n; i++) {
            const model = preparedModels[i];
            
            const addEvent: IAddEvent<this, TModel> = {
                type: "add",
                model,
                collection: this
            };
            this.emit("add", addEvent);
        }
    }

    public sort(
        compareFunctionOrKey?: 
            keyof TModel["data"] |
            ((modelA: TModel, modelB: TModel) => number), 
        ...otherKeys: Array<keyof TModel["data"] & string>
    ) {

        if ( typeof compareFunctionOrKey === "string" ) {
            const firstKey = compareFunctionOrKey;
            
            // order by key asc
            if ( !otherKeys.length ) {
                const key = firstKey;

                this.models.sort((modelA, modelB) => {
                    const valueA = modelA.get(key);
                    const valueB = modelB.get(key);
    
                    return valueA > valueB ? 1 : -1;
                });
            }

            // order by key1 asc, key2 asc, ...
            else {
                const keys = [firstKey].concat( otherKeys ) as Array<keyof TModel["data"]>;

                this.models.sort((modelA, modelB) => {

                    for (let i = 0, n = keys.length; i < n; i++) {
                        const key = keys[i] as string;

                        const valueA = modelA.get(key);
                        const valueB = modelB.get(key);
    
                        if ( valueA > valueB ) {
                            return 1;
                        }

                        if ( valueA < valueB ) {
                            return -1;
                        }
                    }
                });
            }
            
        }
        
        // sort by compareFunction( (modelA, modelB) => ... )
        else if ( typeof compareFunctionOrKey === "function" ) {
            const compareFunction = compareFunctionOrKey;
            this.models.sort(compareFunction);
        }

        else {
            const invalidValue = invalidValuesAsString( compareFunctionOrKey );
            throw new Error(`invalid compareFunction or key: ${ invalidValue }`);
        }
    }
    
    public reverse(): this {
        this.models.reverse();
        return this;
    }

    public concat(...values: Array<IRows< this, TModel >>): this {
        
        const CustomCollection = this.constructor as any;
        let outputModels = this.models;

        for (let i = 0, n = values.length; i < n; i++) {
            const rowsOrCollection = values[ i ];

            if ( rowsOrCollection instanceof Collection ) {
                const collection = rowsOrCollection;
                outputModels = outputModels.concat( collection.models );
            } 
            else {
                const rows = rowsOrCollection;
                const models = rows.map((row) => this.prepareRow(row));
                outputModels = outputModels.concat( models );
            }
        }

        return new CustomCollection(outputModels);
    }

    public join(separator: string = ""): string {
        return this.models.join(separator);
    }

    // https://developer.mozilla.org/en/docs/Web/JavaScript/Reference/Global_Objects/Array/fill
    public fill(row: IRow<TModel>, start: number, end?: number) {
        // Step 3-5.
        // tslint:disable-next-line: no-bitwise
        const len = this.length >>> 0;

        // Step 6-7.
        start = arguments[1];
        // tslint:disable-next-line: no-bitwise
        const relativeStart = start >> 0;

        // Step 8.
        let k = relativeStart < 0 ?
            Math.max(len + relativeStart, 0) :
            Math.min(relativeStart, len);

        // Step 9-10.
        end = arguments[2];
        const relativeEnd = end === undefined ?
            // tslint:disable-next-line: no-bitwise
            len : end >> 0;

        // Step 11.
        const final = relativeEnd < 0 ?
            Math.max(len + relativeEnd, 0) :
            Math.min(relativeEnd, len);

        // Step 12.
        const addedModels = [];
        while (k < final) {
            const model = this.prepareRow(row);

            addedModels.push(model);
            this.models[k] = model;
            k++;
        }

        for (let i = 0, n = addedModels.length; i < n; i++) {
            const model = addedModels[i];
            
            const addEvent: IAddEvent<this, TModel> = {
                type: "add",
                model,
                collection: this
            };
            this.emit("add", addEvent);
        }

        // Step 13.
        return this;
    }

    public splice(start: number, deleteCount: number, ...inputItems: Array<IRow<TModel>>) {
        let items: TModel[];

        if ( inputItems && inputItems.length ) {
            items = inputItems.map((row) => 
                this.prepareRow(row)
            );
        }

        const removedModels = this.models.slice(start, start + deleteCount);

        this.models.splice(start, deleteCount, ...items);
        this.length = this.models.length;

        for (let i = 0, n = removedModels.length; i < n; i++) {
            const model = removedModels[ i ];

            const removeEvent: IRemoveEvent<this, TModel> = {
                type: "remove",
                collection: this,
                model
            };
            this.emit("remove", removeEvent);
        }

        for (let i = 0, n = items.length; i < n; i++) {
            const model = items[i];
            
            const addEvent: IAddEvent<this, TModel> = {
                type: "add",
                model,
                collection: this
            };
            this.emit("add", addEvent);
        }
    }

    public reset() {
        const removedModels = this.models.slice();

        this.models = [];
        this.length = 0;

        for (let i = 0, n = removedModels.length; i < n; i++) {
            const model = removedModels[ i ];

            const removeEvent: IRemoveEvent<this, TModel> = {
                type: "remove",
                collection: this,
                model
            };
            this.emit("remove", removeEvent);
        }
    }

    public first(): TModel {
        return this.models[0];
    }

    public last(): TModel {
        return this.models[ this.models.length - 1 ];
    }

    public create(row: TModel["data"]): TModel {
        const model = this.prepareRow(row);
        
        this.models.push( model );
        this.length = this.models.length;
        
        const addEvent: IAddEvent<this, TModel> = {
            type: "add",
            model,
            collection: this
        };
        this.emit("add", addEvent);

        return model;
    }

    public toJSON(): Array<JSONData<TModel["data"]>> {
        return this.models.map((model) =>
            model.toJSON()
        );
    }

    public clone(): this {
        const models = this.models.map((model) => 
            model.clone()
        );

        const ChildCollection = this.constructor as any;
        const clone = new ChildCollection( models );
        
        return clone;
    }

    public remove(idOrModel: TModel | number | string): void {
        let index = -1;
        let removedModel;
        
        if ( idOrModel instanceof Model ) {
            const model = idOrModel;
            index = this.models.indexOf( model );

            removedModel = model;
        }
        else {
            const id = idOrModel;
            index = this.models.findIndex( (model) => 
                model.primaryValue === id
            );

            removedModel = this.models[ index ];
        }

        if ( index !== -1 ) {
            this.models.splice(index, 1);
            this.length = this.models.length;
        }

        if ( removedModel ) {
            const removeEvent: IRemoveEvent<this, TModel> = {
                type: "remove",
                collection: this,
                model: removedModel
            };

            this.emit("remove", removeEvent);
        }
    }

    public get(id: number | string): TModel {
        return this.find((model) => 
            model.primaryValue === id
        );
    }

    public equal(
        otherCollection: Collection<Model<ISimpleObject>> | 
            Array<Model<ISimpleObject>> | 
            ISimpleObject[], 
        stack?: EqualStack
    ): boolean {
        if ( 
            !(otherCollection instanceof Collection) &&
            !Array.isArray(otherCollection)
        ) {
            return false;
        }

        if ( this.length !== otherCollection.length ) {
            return false;
        }

        stack = stack || new EqualStack();

        // stop circular recursion
        const stacked = stack.get(this);
        if ( stacked ) {
            return stacked === otherCollection;
        }
        stack.add(this, otherCollection);


        for (let i = 0, n = this.length; i < n; i++) {
            const selfModel = this.at(i);
            const otherModel = otherCollection instanceof Collection ?
                otherCollection.at(i) :
                otherCollection[i];
            
            const isEqual = selfModel.equal( otherModel, stack );

            if ( !isEqual ) {
                return false;
            }
        }

        return true;
    }
}

export default Collection;

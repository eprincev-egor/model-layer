
import EventEmitter from "events";
import {Model, ISimpleObject} from "./Model";
import EqualStack from "./EqualStack";
import {invalidValuesAsString, isPlainObject} from "./utils";
import {
    CollectionShouldHaveModelError,
    WrongModelConstructorError,
    InvalidModelRowError,
    InvalidSortParamsError
} from "./errors";

interface IAddEvent<TCollection, TModel> {
    type: "add";
    model: TModel;
    collection: TCollection;
}
type TAddEventListener<
    TCollection extends Collection<any>, 
    TModel extends Model<any>
> = (event: IAddEvent<TCollection, TModel>) => void;

interface IRemoveEvent<TCollection, TModel> {
    type: "remove";
    model: TModel;
    collection: TCollection;
}
type TRemoveEventListener<
    TCollection extends Collection<any>, 
    TModel extends Model<any>
> = (event: IAddEvent<TCollection, TModel>) => void;

export abstract class Collection<
    ChildCollection extends Collection<any>,
    TModel extends Model<any> = InstanceType< ReturnType< ChildCollection["Model"] > >
> extends EventEmitter {
    TModel: TModel;
    models: TModel[];
    length: number;
    
    TInput: this | Array< TModel["TInput"] >;
    TOutput: this;
    TJson: Array< TModel["TJson"] >;

    // this.ModelConstructor = this.Model();
    private ModelConstructor: (new (...args: any) => TModel) | undefined;


    constructor(rows?: Array< TModel["TInput"] >) {
        super();

        if ( !this.constructor.prototype.hasOwnProperty("ModelConstructor") ) {
            const ModelConstructor = this.Model();
            
            // prepare model structure without calling constructor
            const tmpModel = Object.create( ModelConstructor.prototype );
            tmpModel.prepareStructure();
            
            this.constructor.prototype.ModelConstructor = ModelConstructor;
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

        // for fix typescript error:
        // prop has no initializer and is not definitely assigned in the constructor
        this.TModel = null as any;
        this.TInput = null as any;
        this.TOutput = null as any;
        this.TJson = null as any;
        delete this.TModel;
        delete this.TInput;
        delete this.TOutput;
        delete this.TJson;
    }

    abstract Model(): new (...args: any) => TModel;

    at(index: number): TModel;
    at(index: number, rowOrModel: TModel["TInput"]): void;
    at(index: number, rowOrModel?: TModel["TInput"]): TModel | void {
        // set
        if ( rowOrModel ) {
            const removedModel = this.models[ index ];

            const model = this.prepareRow( rowOrModel );
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

    prepareRow(row: TModel["TInput"]): TModel {
        let model: TModel;
        
        if ( row instanceof (this.ModelConstructor as any) ) {
            model = row as TModel;
            return model;
        }

        if ( row instanceof Model ) {
            throw new WrongModelConstructorError({
                invalid: row.constructor.name,
                expected: (this.ModelConstructor as any).name,
                collection: this.constructor.name
            });
        }
        
        if ( isPlainObject(row) ) {
            model = new (this.ModelConstructor as any)( row );
        }
        else {
            throw new InvalidModelRowError({
                model: (this.ModelConstructor as any).name,
                invalidValue: invalidValuesAsString( row )
            });
        }

        return model;
    }

    push(...models: Array<TModel["TInput"]>) {
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

    add(...models: Array<TModel["TInput"] | Array<TModel["TInput"]>>) {
        if ( !models.length ) {
            return;
        }

        let inputModels: Array< TModel["TInput"] > = [];
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
            const inputModel = inputModels[i];
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

    forEach(
        iteration: (model: TModel, index: number, models: TModel[]) => void, 
        context?: any
    ): void {
        this.models.forEach(iteration, context || this);
    }

    each(
        iteration: (model: TModel, index: number, models: TModel[]) => void, 
        context?: any
    ): void {
        this.models.forEach(iteration, context || this);
    }

    find(
        iteration: (model: TModel, index: number, models: TModel[]) => boolean, 
        context?: any
    ): TModel | undefined {
        return this.models.find(iteration, context || this);
    }

    findIndex(
        iteration: (model: TModel, index: number, models: TModel[]) => boolean, 
        context?: any
    ): number {
        return this.models.findIndex(iteration, context || this);
    }

    filter(
        iteration: (model: TModel, index: number, models: TModel[]) => boolean, 
        context?: any
    ): TModel[] {
        return this.models.filter(iteration, context || this);
    }

    map<T>(
        iteration: (model: TModel, index: number, models: TModel[]) => T, 
        context?: any
    ): T[] {
        return this.models.map(iteration, context || this);
    }

    flatMap<U, TArr extends U[]>(
        iteration: (model: TModel, index: number, models: TModel[]) => TArr, 
        context?: any
    ): U[] {
        const result = this.models.map(iteration, context || this);
            
        let output: U[] = [];
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

    reduce<T>(
        iteration: (total: T, nextModel: TModel) => T,
        initialValue?: T
    ): T {
        return this.models.reduce<any>(iteration, initialValue);
    }

    reduceRight<T>(
        iteration: (total: T, nextModel: TModel) => T,
        initialValue?: T
    ): T {
        return this.models.reduceRight<any>(iteration, initialValue);
    }

    every(
        iteration: (model: TModel, index: number, models: TModel[]) => boolean, 
        context?: any
    ): boolean {
        return this.models.every(iteration, context || this);
    }

    some(
        iteration: (model: TModel, index: number, models: TModel[]) => boolean, 
        context?: any
    ): boolean {
        return this.models.some(iteration, context || this);
    }

    slice(begin?: number, end?: number): TModel[] {
        return this.models.slice(begin, end);
    }

    flat(): TModel[] {
        return this.models.slice();
    }

    indexOf(searchElement: TModel, fromIndex?: number): number {
        return this.models.indexOf(searchElement, fromIndex);
    }

    lastIndexOf(searchElement: TModel, fromIndex?: number): number {
        if ( arguments.length === 2 ) {
            return this.models.lastIndexOf(searchElement, fromIndex);
        }
        else {
            return this.models.lastIndexOf(searchElement);
        }
    }

    includes(searchElement: TModel, fromIndex?: number): boolean {
        return this.models.includes(searchElement, fromIndex);
    }

    pop(): TModel | undefined {
        const model = this.models.pop();
        this.length = this.models.length;
        
        if ( model ) {
            const removeEvent: IRemoveEvent<this, TModel> = {
                type: "remove",
                collection: this,
                model
            };
            this.emit("remove", removeEvent);
        }
        
        return model;
    }

    shift(): TModel | undefined {
        const model = this.models.shift();
        this.length = this.models.length;

        if ( model ) {
            const removeEvent: IRemoveEvent<this, TModel> = {
                type: "remove",
                collection: this,
                model
            };
            this.emit("remove", removeEvent);
        }
        
        return model;
    }

    unshift(...models: Array<TModel["TInput"]>) {
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

    sort(
        compareFunctionOrKey?: 
            keyof TModel["row"] |
            ((modelA: TModel, modelB: TModel) => number), 
        ...otherKeys: Array<keyof TModel["row"] & string>
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
                const keys = [firstKey].concat( otherKeys ) as Array<keyof TModel["row"]>;

                this.models.sort((modelA: TModel, modelB: TModel) => {

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

                    return 0;
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
            throw new InvalidSortParamsError({
                invalidValue
            });
        }
    }
    
    reverse(): this {
        this.models.reverse();
        return this;
    }

    concat(...values: Array< this["TInput"] >): this {
        
        const CustomCollection = this.constructor as any;
        let outputModels = this.models;

        for (let i = 0, n = values.length; i < n; i++) {
            const rowsOrCollection = values[ i ];

            if ( rowsOrCollection instanceof Collection ) {
                const collection = rowsOrCollection;
                outputModels = outputModels.concat( collection.models as any );
            } 
            else {
                const rows = rowsOrCollection as any;
                const models = rows.map((row: any) => this.prepareRow(row));
                outputModels = outputModels.concat( models );
            }
        }

        return new CustomCollection(outputModels);
    }

    join(separator: string = ","): string {
        return this.models.join(separator);
    }

    // https://developer.mozilla.org/en/docs/Web/JavaScript/Reference/Global_Objects/Array/fill
    fill(row: TModel["TInput"], start: number, end?: number) {
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

    splice(start: number, deleteCount: number, ...inputItems: Array<TModel["TInput"]>) {
        let items: TModel[];

        if ( inputItems && inputItems.length ) {
            items = inputItems.map((row) => 
                this.prepareRow(row)
            );
        }
        else {
            items = [];
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

    reset() {
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

    first(): TModel {
        return this.models[0];
    }

    last(): TModel {
        return this.models[ this.models.length - 1 ];
    }

    create(row: TModel["TInputData"]): TModel {
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

    toJSON(stack: any[] = []): Array<TModel["TJson"]> {
        return this.models.map((model) =>
            model.toJSON(stack)
        );
    }

    clone(stack?: EqualStack): this {
        stack = stack || new EqualStack();

        const existsClone = stack.get(this);
        if ( existsClone ) {
            return existsClone;
        }

        const clone = Object.create( this.constructor.prototype );
        stack.add(this, clone);

        const models = this.models.map((model) => 
            model.clone(stack)
        );
        clone.models = models;
        clone.length = models.length;
        
        return clone;
    }

    remove(idOrModel: TModel | number | string): void {
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

    get(id: number | string): TModel | undefined {
        return this.find((model) => 
            model.primaryValue === id
        );
    }

    equal(
        otherCollection: Collection<any> | 
            Array<Model<any>> | 
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

    on(eventName: "add", listener: TAddEventListener<this, TModel>): this;
    on(eventName: "remove", listener: TRemoveEventListener<this, TModel>): this;
    on(
        eventName: "add" | "remove", 
        listener: TAddEventListener<this, TModel> | TRemoveEventListener<this, TModel>
    ): this {
        return super.on(eventName, listener);
    }
}

// for js
(Collection as any).prototype.Model = function() {
    throw new CollectionShouldHaveModelError({
        className: this.constructor.name
    });
};

export default Collection;

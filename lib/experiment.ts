
type TInstanceOrT<T> = (
    T extends new (...args: any) => any ?
        InstanceType<T> :
        T
);


interface IType {
    outputType: any;
    inputType: any;
    jsonType: any;
}

interface ITypeParams {
    required?: boolean;
}

function Type(params: ITypeParams) {
    return {
        ...params,
        type: "any"
    };
}


// Number
interface ITypeNumberParams extends ITypeParams {
    round?: number;
}

interface ITypeNumber extends IType {
    (params: ITypeNumberParams): ITypeNumber;
    outputType: number;
    inputType: number | string;
    jsonType: number;
}

function TypeNumber(params: ITypeNumberParams) {
    return {
        ...params,
        type: "number"
    };
}


// String
interface ITypeStringParams extends ITypeParams {
    trim?: boolean;
}

interface ITypeString extends IType {
    (params: ITypeNumberParams): ITypeString;
    outputType: string;
    inputType: number | string;
    jsonType: string;
}

function TypeString(params: ITypeStringParams) {
    return {
        ...params,
        type: "string"
    };
}

// Boolean
interface ITypeBooleanParams extends ITypeParams {
    nullAsFalse?: boolean;
}

interface ITypeBoolean extends IType {
    (params: ITypeNumberParams): ITypeBoolean;
    outputType: boolean;
    inputType: boolean | 1 | 0;
    jsonType: boolean;
}

function TypeBoolean(params: ITypeBooleanParams) {
    return {
        ...params,
        type: "boolean"
    };
}

// Array
interface ITypeArrayParams extends ITypeParams {
    element: IType | (new (...args: any) => BaseModel<any>);
    nullAsEmpty?: boolean;
}

interface ITypeArray<T extends IType> {
    <TElement extends IType | (new (...args: any) => BaseModel<any>)>(
        params: ITypeArrayParams & 
        {element: TElement}
    ): ITypeArray< TInstanceOrT< TElement > >;

    outputType: Array< T["outputType"] >;
    inputType: Array< T["inputType"] >;
    jsonType: Array< T["jsonType"] >;
}

function TypeArray(params: ITypeArrayParams) {
    return {
        ...params,
        type: "array"
    };
}

// Object
interface ITypeObjectParams extends ITypeParams {
    element: IType | (new (...args: any) => BaseModel<any>);
}
interface IObject<T> {
    [key: string]: T;
}

interface ITypeObject<T extends IType> extends IType {
    <TElement extends IType | (new (...args: any) => BaseModel<any>)>(
        params: ITypeObjectParams & 
        {element: TElement}
    ): ITypeObject< TInstanceOrT<TElement> >;

    outputType: IObject< T["outputType"] >;
    inputType: IObject< T["inputType"] >;
    jsonType: IObject< T["jsonType"] >;
}

function TypeObject(params: ITypeObjectParams) {
    return {
        ...params,
        type: "object"
    };
}

// Any
interface ITypeAnyParams extends ITypeParams {
    (params: ITypeAnyParams): ITypeAny;
}

interface ITypeAny extends IType {
    (params: ITypeAnyParams): ITypeAny;

    outputType: any;
    inputType: any;
    jsonType: any;
}

function TypeAny(params: ITypeAnyParams) {
    return {
        ...params,
        type: "any"
    };
}

// Date
interface ITypeDateParams extends ITypeParams {
    (params: ITypeDateParams): ITypeDate;
}

interface ITypeDate extends IType {
    (params: ITypeDateParams): ITypeDate;
    outputType: Date;
    inputType: number | string | Date;
    jsonType: string;
}

function TypeDate(params: ITypeDateParams) {
    return {
        ...params,
        type: "date"
    };
}

// Or
type ElementType < T extends any[] > = (
    // tslint:disable-next-line: no-shadowed-variable
    T extends ReadonlyArray< infer ElementType > ? 
        ElementType : 
        never
);

interface IOrParams extends ITypeParams {
    or: IType[];
}
interface ITypeOr<T extends IType> extends IType {
    <TOrTypes extends IType[]>(
        params: IOrParams &
        {or: TOrTypes}
    ): ElementType< TOrTypes >;
    
    outputType: T["outputType"];
    inputType: T["inputType"];
    jsonType: T["jsonType"];
}

function TypeOr(params: IOrParams) {
    return {
        ...params,
        type: "or"
    };
}

// Types
const Types = {
    Number: (TypeNumber as any) as ITypeNumber,
    String: (TypeString as any) as ITypeString,
    Boolean: (TypeBoolean as any) as ITypeBoolean,
    Date: (TypeDate as any) as ITypeDate,
    Array: (TypeArray as any) as ITypeArray<IType>,
    Object: (TypeObject as any) as ITypeObject<IType>,
    Or: (TypeOr as any) as ITypeOr<IType>,
    Any: (TypeAny as any) as ITypeAny
};


























interface IObjectWithAnyKey {
    "*": any;
}

// output
type outputValue<T extends any> = (
    TInstanceOrT<T>["outputType"]
);
type outputData<T> = {
    readonly [key in keyof T]: outputValue< T[key] >;
};

interface IOutputAnyData<T> {
    readonly [key: string]: outputValue< T >;
}

type output<T> = (
    T extends IObjectWithAnyKey ?
        IOutputAnyData< T["*"] > & outputData< Omit< T, "*" > > :
        outputData< T >
);

// input
type inputValue<T extends any> = (
    TInstanceOrT<T>["inputType"]
);

type inputData<T> = {
    [key in keyof T]?: inputValue< T[key] >;
};

interface IInputAnyData<T> {
    [key: string]: inputValue< T >;
}

type input<T> = (
    T extends IObjectWithAnyKey ?
        IInputAnyData< T["*"] > & inputData< Omit< T, "*" > > :
        inputData< T >
);

// json
type jsonValue<T extends any> = (
    TInstanceOrT<T>["jsonType"]
);

interface IJsonAnyData<T> {
    [key: string]: jsonValue< T >;
}

type jsonData<T> = {
    [key in keyof T]?: jsonValue< T[key] >;
};

type json<T> = (
    T extends IObjectWithAnyKey ?
        IJsonAnyData< T["*"] > & jsonData< Omit< T, "*" > > :
        jsonData< T >
);

// type myDataType = convert<typeof myData>;
// tslint:disable-next-line: max-classes-per-file
abstract class BaseModel<
    T extends (() => object),
    TStructure = ReturnType<T>, 
    TData = output<TStructure>, 
    InputData = input<TStructure>, 
    JSONData = json<TStructure>
> {
    public static data(): object {
        return {};
    }

    public outputType: this;
    public inputType: InputData | this;
    public jsonType: JSONData;

    public data: TData;

    public get<TKey extends keyof TData>(key: TKey): TData[TKey] {
        return this.data[ key ];
    }

    public set(changes: InputData): void {
        const selfData = this.data as any;
        for (const key in changes) {
            selfData[key] = changes[ key ];
        }
    }

    public toJSON(): JSONData {
        return this.data as any;
    }
}


// tslint:disable-next-line: max-classes-per-file
abstract class BaseCollection<TModel extends BaseModel<any>> {
    public models: TModel[];
    public Model: (new (...args: any) => TModel);
    
    public inputType: Array< TModel["inputType"] >;
    public outputType: this;
    public jsonType: Array< TModel["jsonType"] >;

    public prepareRow(row: TModel["inputType"]) {
        if ( row instanceof this.Model ) {
            return row;
        }
        else {
            return new this.Model( row );
        }
    }

    public push(row: TModel["inputType"]) {
        const model = this.prepareRow( row );
        this.models.push( model );
    }
}















// Examples:::

const dictionaryData = () => ({
    "*": Types.Or({
        or: [Types.Boolean, Types.Number]
    }),
    "n": Types.Number,
    "bool": Types.Boolean
});

// tslint:disable-next-line: max-classes-per-file
class Dictionary extends BaseModel<typeof dictionaryData> {
    public static data = dictionaryData;
}

const dictionary = new Dictionary();

type iii = typeof dictionary.inputType;

dictionary.set({
    x: true,
    n: 2,
    bool: false
});



const productData = () => ({
    id: Types.Number({
        required: true
    }),
    name: Types.String,
    price: Types.Number
});

// tslint:disable-next-line: max-classes-per-file
class Product extends BaseModel<typeof productData> {
    public static data = productData;
}

// tslint:disable-next-line: max-classes-per-file
class Cart extends BaseCollection<Product> {
    public static Model = Product;
}

const cart = new Cart();

cart.push({
    name: "eggs",
    price: 100
});


const myData = () => ({
    x: Types.Number({
        required: true,
        round: 2
    }),
    y: Types.String,
    z: Types.Boolean,
    m: MyModel,
    numbers: Types.Array({
        element: Types.Number
    }),
    strings: Types.Array({
        element: Types.String
    }),
    boolOrNumb: Types.Or({
        or: [Types.Boolean, Types.Number]
    }),
    obj: Types.Object({
        element: Types.String
    }),
    date: Types.Date,
    any: Types.Any,
    products: Types.Array({
        element: Product
    }),
    productById: Types.Object({
        element: Product
    }),
    cart: Cart
});

// tslint:disable-next-line: max-classes-per-file
class MyModel<T extends typeof myData> extends BaseModel<T> {
    public static data = myData;

    public getValue() {
        return this.data.x;
    }
}

const myModel = new MyModel();
const x = myModel.get("x");
const y = myModel.get("y");
const z = myModel.get("z");
const m = myModel.get("m");
const numbers = myModel.get("numbers");
const products = myModel.get("products");
const mCart = myModel.get("cart");

const mx = m.get("x");
const my = m.get("y");
const mz = m.get("z");
const mm = m.get("m");

myModel.set({
    x: "1",
    z: 1,
    m: {
        z: 1
    },
    numbers: [2],
    strings: ["x", 1],
    boolOrNumb: 2,
    obj: {
        a: "nice",
        b: 2
    },
    any: NaN,
    date: new Date(),
    products: [
        {name: "Test", price: 100},
        new Product()
    ],
    productById: {
        1: {name: "Test", price: 100},
        2: new Product()
    },
    cart: [
        {name: "Eggs", price: 20},
        new Product()
    ]
});

const childData = () => ({
    ...myData(),
    x: Types.Number({
        required: false
    }),
    a: Types.String({
        required: true
    })
});

// tslint:disable-next-line: max-classes-per-file
class ChildModel extends MyModel<typeof childData> {
    public static data = childData;
}
const child = new ChildModel();

const ca = child.get("a");
const cx = child.get("x");

child.getValue();


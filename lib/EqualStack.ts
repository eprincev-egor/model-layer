

interface IListItem {
    self: any;
    other: any;
}

export default class EqualStack {
    public list: IListItem[];

    constructor() {
        this.list = [];
    }

    public get(selfValue: any): any {
        const item = this.list.find((pair) =>
            pair.self === selfValue
        );

        if ( item ) {
            return item.other;
        }
    }
        
    public add(selfValue: any, otherValue: any) {
        this.list.push({
            self: selfValue,
            other: otherValue
        });
    }
}

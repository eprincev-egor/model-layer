

interface IListItem {
    self: any;
    other: any;
}

export default class EqualStack {
    list: IListItem[];

    constructor() {
        this.list = [];
    }

    get(selfValue: any): any {
        const item = this.list.find((pair) =>
            pair.self === selfValue
        );

        if ( item ) {
            return item.other;
        }
    }
        
    add(selfValue: any, otherValue: any) {
        this.list.push({
            self: selfValue,
            other: otherValue
        });
    }
}

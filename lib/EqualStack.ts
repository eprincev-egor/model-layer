"use strict";

export default class EqualStack {
    constructor() {
        this.list = [];
    }

    get(selfValue) {
        let item = this.list.find(pair =>
            pair.self === selfValue
        );

        if ( item ) {
            return item.other;
        }
    }
        
    add(selfValue, otherValue) {
        this.list.push({
            self: selfValue,
            other: otherValue
        });
    }
}
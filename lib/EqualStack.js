"use strict";

class EqualStack {
    constructor() {
        this.list = [];
        this.x = Math.random() * 100;
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

module.exports = EqualStack;
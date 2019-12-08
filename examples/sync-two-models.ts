

// const {Model} = require("model-layer");
import {Model, Types} from "../lib/index";
import assert from "assert";

class PagesModel extends Model<PagesModel> {
    structure() {
        return {
            pages: Types.Array({
                element: Types.Number
            }),
            current: Types.Number
        };
    }
}

const topPages = new PagesModel();
const bottomPages = new PagesModel();


// options is object of any properties
topPages.on("change", (event, options) => {
    if ( options.stopSync ) {
        return;
    }

    // call 'set' method with your options
    bottomPages.set(event.changes, {
        stopSync: true
    });
});
bottomPages.on("change", (event, options) => {
    if ( options.stopSync ) {
        return;
    }

    // call 'set' method with your options
    topPages.set(event.changes, {
        stopSync: true
    });
});


// change first model
topPages.set({
    pages: [1, 2, 3, 4],
    current: 1
});

assert.deepStrictEqual(topPages.data, {
    pages: [1, 2, 3, 4],
    current: 1
});
// and changed second model
assert.deepStrictEqual(bottomPages.data, {
    pages: [1, 2, 3, 4],
    current: 1
});



// change second model
bottomPages.set({
    current: 2
});

assert.deepStrictEqual(bottomPages.data, {
    pages: [1, 2, 3, 4],
    current: 2
});
// and changed first model
assert.deepStrictEqual(topPages.data, {
    pages: [1, 2, 3, 4],
    current: 2
});

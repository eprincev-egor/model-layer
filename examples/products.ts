

// const {Model} = require("model-layer");
import {Model, Types, MutableObject} from "../lib/index";
import assert from "assert";

class Product extends Model<Product> {
    structure() {
        return {
            
            name: Types.String({
                required: true
            }),

            price: Types.Number({
                required: true,
                // define prepare value, round to cents
                round: 2
            }),

            quantity: Types.Number({
                default: 1
            })
        };
    }
}


// tslint:disable-next-line: max-classes-per-file
class Cart extends Model<Cart> {
    structure() {
        return {
            // define array of models
            products: Types.Array({
                element: Product
            }),

            // simplest define number
            total: Types.Number
        };
    }

    // calc total price for cart
    prepare(row: MutableObject< this["row"] >) {
        row.total = row.products!.reduce((total, product) =>
            total + product.get("price")! * product.get("quantity")!,
            0 as number
        );
    }
}


const milk = new Product({
    name: "milk",
    price: 10.333
});

const eggs = new Product({
    name: "eggs",
    price: 1.6,
    quantity: 10
});

const cart = new Cart({
    products: [milk, eggs]
});


// any model has method toJSON, 
// for map all models to objects
assert.deepEqual(cart.toJSON(), {
    products: [
        {
            name: "milk",
            price: 10.33,
            quantity: 1
        },
        {
            name: "eggs",
            price: 1.6,
            quantity: 10
        }
    ],
    total: 26.33
});

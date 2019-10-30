

// const {Model} = require("model-layer");
import {Model} from "../lib/index";
import assert from "assert";

interface IProduct {
    name: string;
    price: number;
    quantity: number;
}

class Product extends Model<IProduct> {
    public static data() {
        return {
            
            name: {
                type: "string",
                required: true
            },

            price: {
                type: "number",
                required: true,
                // define prepare value, round to cents
                round: 2
            },

            quantity: {
                type: "number",
                default: 1
            }
        };
    }
}

interface ICart {
    products: Product[];
    total: number;
}

// tslint:disable-next-line: max-classes-per-file
class Cart extends Model<ICart> {
    public static data() {
        return {
            // define array of models
            products: [Product],

            // simplest define number
            total: "number"
        };
    }

    // calc total price for cart
    public prepare(data) {
        data.total = data.products.reduce((total, product) =>
            total + product.get("price") * product.get("quantity"), 0
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

"use strict";

// const {Model} = require("model-layer");
const {Model} = require("../lib/index");
const assert = require("assert");

class Product extends Model {
    static structure() {
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

class Cart extends Model {
    static structure() {
        return {
            // define array of models
            products: [Product],

            // simplest define number
            total: "number"
        };
    }

    // calc total price for cart
    prepare(data) {
        data.total = data.products.reduce((total, product) =>
            total + product.get("price") * product.get("quantity"), 0
        );
    }
}


let milk = new Product({
    name: "milk",
    price: 10.333
});

let eggs = new Product({
    name: "eggs",
    price: 1.6,
    quantity: 10
});

let cart = new Cart({
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
"use strict";

const {Collection} = require("../../../lib/index");
const assert = require("assert");

describe("Collection.flatMap", () => {

    it("flatMap()", () => {

        class Books extends Collection {
            static structure() {
                return {
                    name: "text",
                    price: "number"
                };
            }
        }

        let books = new Books([
            {name: "Book 1"},
            {name: "Book 2"}
        ]);

        let words = books.flatMap(book =>
            book.get("name").split(" ")
        );

        assert.deepStrictEqual( words, ["Book", "1", "Book", "2"] );
    });
    
    it("flatMap(f, context)", () => {
        class Products extends Collection {
            static structure() {
                return {
                    name: "text",
                    price: "number"
                };
            }
        }

        let products = new Products([
            {name: "Eggs", price: 1.2}
        ]);

        
        let context = {
            changed: false
        };

        products.flatMap(function() {
            this.changed = true;
        }, context);

        assert.strictEqual(context.changed, true);
    });
});
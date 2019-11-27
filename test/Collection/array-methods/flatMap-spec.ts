
import {Collection, Model, Types} from "../../../lib/index";
import assert from "assert";

describe("Collection.flatMap", () => {

    it("flatMap()", () => {
        class Book extends Model<Book> {
            public structure() {
                return {
                    name: Types.String,
                    price: Types.Number
                };
            }
        }

        class Books extends Collection<Book> {
            public Model = Book;
        }

        const books = new Books([
            {name: "Book 1", price: 1.23},
            {name: "Book 2", price: 2.3},
            {name: "Book 3", price: null}
        ]);

        const words = books.flatMap((book) =>
            book.get("name").split(" ")
        );

        assert.deepStrictEqual( words, ["Book", "1", "Book", "2", "Book", "3"] );

        const digits = books.flatMap((book) => {
            const price = book.get("price");
            
            if ( price != null ) {
                return price.toString()
                    .split(".")
                    .map((str) => +str);
            }
            else {
                return null;
            }
        });
        
        assert.deepStrictEqual( digits, [1, 23, 2, 3, null] );
    });
    
    it("flatMap(f, context)", () => {
        class Product extends Model<Product> {
            public structure() {
                return {
                    name: Types.String,
                    price: Types.Number
                };
            }
        }

        class Products extends Collection<Product> {
            public Model = Product;
        }

        const products = new Products([
            {name: "Eggs", price: 1.2}
        ]);

        
        const context = {
            changed: false
        };

        products.flatMap(function() {
            this.changed = true;
            return [];
        }, context);

        assert.strictEqual(context.changed, true);
    });
});

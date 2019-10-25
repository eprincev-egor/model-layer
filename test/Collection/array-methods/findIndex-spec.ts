

import {Collection, Model} from "../../../lib/index";
import assert from "assert";

describe("Collection.findIndex", () => {

    it("findIndex()", () => {
        interface IColor {
            name: string;
            price: number;
        }
        class Color extends Model<IColor> {}

        class Colors extends Collection<Color> {
            public static data() {
                return {
                    name: "text"
                };
            }
        }

        const colors = new Colors([
            {name: "red"},
            {name: "green"},
            {name: "blue"}
        ]);

        const index = colors.findIndex((color) =>
            color.get("name") === "green"
        );

        assert.strictEqual( index, 1 );
    });
    
    it("findIndex(f, context)", () => {
        interface IProduct {
            name: string;
            price: number;
        }
        class Product extends Model<IProduct> {}

        class Products extends Collection<Product> {
            public static data() {
                return {
                    name: "text",
                    price: "number"
                };
            }
        }

        const products = new Products([
            {name: "Eggs", price: 1.2}
        ]);

        
        const context = {
            changed: false
        };

        products.findIndex(function() {
            this.changed = true;
            return true;
        }, context);

        assert.strictEqual(context.changed, true);
    });

});

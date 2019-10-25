
import {Collection, Model} from "../../../lib/index";
import assert from "assert";

describe("Collection.find", () => {

    it("find()", () => {
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

        const red = colors.find((color) =>
            color.get("name") === "red"
        );

        assert.strictEqual( red.get("name"), "red" );
    });
    
    it("find(f, context)", () => {
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

        products.find(function() {
            this.changed = true;
            return true;
        }, context);

        assert.strictEqual(context.changed, true);
    });

});

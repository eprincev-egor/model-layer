
import {Collection, Model, Types} from "../../../lib/index";
import assert from "assert";

describe("Collection.find", () => {

    it("find()", () => {
        class Color extends Model<Color> {
            structure() {
                return {
                    name: Types.String,
                    price: Types.Number
                };
            }
        }
        

        class Colors extends Collection<Color> {
            Model = Color;
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
        class Product extends Model<Product> {
            structure() {
                return {
                    name: Types.String,
                    price: Types.Number
                };
            }
        }
        
        class Products extends Collection<Product> {
            Model = Product;
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


import {Collection, Model, Types} from "../../../lib/index";
import assert from "assert";

describe("Collection.remove", () => {

    it("remove(model)", () => {
        
        class Product extends Model<Product> {
            structure() {
                return {
                    name: Types.String
                };
            }
        }

        class Products extends Collection<Products> {
            Model() {
                return Product;
            }
        }

        const products = new Products([
            {name: "Pie"},
            {name: "Milk"}
        ]);

        assert.deepStrictEqual( products.toJSON(), [
            {name: "Pie"},
            {name: "Milk"}
        ]);

        const firstModel = products.first();
        products.remove( firstModel );

        assert.deepStrictEqual( products.toJSON(), [
            {name: "Milk"}
        ]);

        // expected without errors
        products.remove( firstModel );
    });

    it("remove(id)", () => {
        
        class Company extends Model<Company> {
            structure() {
                return {
                    id: Types.Number({
                        primary: true
                    }),
                    name: Types.String
                };
            }
        }

        class Companies extends Collection<Companies> {
            Model() {
                return Company;
            }
        }

        const companies = new Companies([
            {id: 1, name: "X"},
            {id: 2, name: "Y"}
        ]);

        assert.deepStrictEqual( companies.toJSON(), [
            {id: 1, name: "X"},
            {id: 2, name: "Y"}
        ]);

        
        companies.remove( 1 );

        assert.deepStrictEqual( companies.toJSON(), [
            {id: 2, name: "Y"}
        ]);

        // expected without errors
        companies.remove( 1 );
    });

});


import {Collection, Model} from "../../../lib/index";
import assert from "assert";

describe("Collection.remove", () => {

    it("remove(model)", () => {
        
        interface IProduct {
            name: string;
            price: number;
        }
        class Product extends Model<IProduct> {}

        class Products extends Collection<Product> {
            static data() {
                return {
                    name: "text"
                };
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
        
        interface ICompany {
            id: number;
            name: string;
        }
        class Company extends Model<ICompany> {}

        class Companies extends Collection<Company> {
            static data() {
                return {
                    id: {
                        type: "number",
                        primary: true
                    },
                    name: "text"
                };
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

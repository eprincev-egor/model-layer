
import {Collection, Model, Types} from "../../../lib/index";
import assert from "assert";

describe("Collection.clone", () => {

    it("clone()", () => {
        
        class Company extends Model<Company> {
            structure() {
                return {
                    name: Types.String
                };
            }
        }

        class Companies extends Collection<Company> {
            Model = Company;
        }

        const companies = new Companies([
            {name: "X"},
            {name: "Y"}
        ]);


        const clone = companies.clone();

        assert.deepStrictEqual(clone.toJSON(), [
            {name: "X"},
            {name: "Y"}
        ]);

        assert.ok( clone !== companies );
        assert.ok( clone instanceof Companies );
    });


});

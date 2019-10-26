
import {Collection, Model} from "../../../lib/index";
import assert from "assert";

describe("Collection.clone", () => {

    it("clone()", () => {
        interface ICompany {
            name: string;
        }
        class Company extends Model<ICompany> {}

        class Companies extends Collection<Company> {
            public static data() {
                return {
                    name: "text"
                };
            }
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

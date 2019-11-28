
import {Collection, Model, Types} from "../../../lib/index";
import assert from "assert";

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

describe("Collection.get", () => {

    it("get(id)", () => {
        
        class Companies extends Collection<Company> {
            Model = Company;
        }

        const companies = new Companies([
            {id: 1, name: "X"},
            {id: 2, name: "Y"}
        ]);


        const first = companies.get(1);
        assert.deepStrictEqual( first.toJSON(), {
            id: 1, 
            name: "X"
        });

        const second = companies.get(2);
        assert.deepStrictEqual( second.toJSON(), {
            id: 2, 
            name: "Y"
        });

    });


});

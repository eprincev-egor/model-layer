
import {Collection, Model} from "../../../lib/index";
import assert from "assert";

interface ICompany {
    id: number;
    name: string;
}
class Company extends Model<ICompany> {}

describe("Collection.get", () => {

    it("get(id)", () => {
        
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

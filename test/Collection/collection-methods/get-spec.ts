

const {Collection} = require("../../../lib/index");
const assert = require("assert");

describe("Collection.get", () => {

    it("get(id)", () => {
        
        class Companies extends Collection {
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

        let companies = new Companies([
            {id: 1, name: "X"},
            {id: 2, name: "Y"}
        ]);


        let first = companies.get(1);
        assert.deepStrictEqual( first.toJSON(), {
            id: 1, 
            name: "X"
        });

        let second = companies.get(2);
        assert.deepStrictEqual( second.toJSON(), {
            id: 2, 
            name: "Y"
        });

    });


});
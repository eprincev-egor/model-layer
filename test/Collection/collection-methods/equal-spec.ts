
import {Collection, Model} from "../../../lib/index";
import assert from "assert";

describe("Collection.equal", () => {

    it("equal()", () => {
        
        interface ICompany {
            name: string;
            price: number;
        }
        class Company extends Model<ICompany> {}

        class Companies extends Collection<Company> {
            public static data() {
                return {
                    name: "text"
                };
            }
        }

        const collection1 = new Companies([
            {name: "X"}
        ]);
        const collection2 = new Companies([
            {name: "X"}
        ]);
        const collection3 = new Companies([
            {name: "X"},
            {name: "Y"}
        ]);
        const collection4 = new Companies([
            {name: "Y"}
        ]);
        const collection5 = new Companies();
        const arr1 = [
            {name: "X"}
        ];
        const arr2 = [
            {name: "Y"}
        ];

        
        assert.ok( collection1.equal( collection2 ) );
        assert.ok( collection2.equal( collection1 ) );

        assert.ok( !collection1.equal( collection3 ) );
        assert.ok( !collection3.equal( collection1 ) );

        assert.ok( !collection1.equal( collection4 ) );
        assert.ok( !collection1.equal( collection5 ) );
        assert.ok( !collection2.equal( collection5 ) );

        assert.ok( collection1.equal( arr1 ) );
        assert.ok( collection2.equal( arr1 ) );
        assert.ok( !collection1.equal( arr2 ) );

        assert.ok( collection4.equal( arr2 ) );
    });


    it("equal Collections, circular recursion", () => {
        interface ICustom {
            name: string;
            child: CustomCollection;
        }

        class Custom extends Model<ICustom> {}

        class CustomCollection extends Collection<Custom> {
            public static data() {
                return {
                    name: "text",
                    child: CustomCollection
                };
            }
        }

        const collection1 = new CustomCollection([
            {name: "X"}
        ]);
        collection1.first().set({child: collection1});

        const collection2 = new CustomCollection([
            {name: "X"}
        ]);
        collection2.first().set({child: collection2});

        assert.ok( collection1.equal( collection2 ) );
        assert.ok( collection2.equal( collection1 ) );
    });
    
});


import {Model, Types} from "../../lib/index";
import assert from "assert";

describe("CustomClassType", () => {
    
    it("prepare boolean", () => {

        class DBDriver {
            load(): string {
                return "loaded";
            }
        }

        class DBState extends Model<DBState> {
            structure() {
                return {
                    driver: Types.CustomClass({
                        constructor: DBDriver
                    })
                };
            }
        }
        
        const driver = new DBDriver();
        const model = new DBState({
            driver
        });

        assert.ok( model.get("driver") === driver );

        assert.strictEqual(model.get("driver").load(), "loaded");
    });


});

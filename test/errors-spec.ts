
import assert from "assert";
import {setLang, Model, Types} from "../lib/index";

describe("Errors", () => {

    it("setLang", () => {
        class TestModel extends Model<TestModel> {
            structure() {
                return {
                    name: Types.String
                };
            }
        }

        
        setLang("ru");
        assert.throws(
            () => {
                const model = new TestModel({
                    x: 1
                } as any);
            },
            (err) =>
                err.message === "неизвестное свойство: x"
        );

        setLang("en");
        assert.throws(
            () => {
                const model = new TestModel({
                    x: 1
                } as any);
            },
            (err) =>
                err.message === "unknown property: x"
        );
    });

});

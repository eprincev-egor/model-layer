
import assert from "assert";
import {setLang, Model, Types} from "../lib/index";
import { UnknownPropertyError } from "../lib/errors";

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
            (err: Error) =>
                err.message === "неизвестное свойство: x" &&
                err instanceof UnknownPropertyError
        );

        setLang("en");
        assert.throws(
            () => {
                const model = new TestModel({
                    x: 1
                } as any);
            },
            (err: Error) =>
                err.message === "unknown property: x" &&
                err instanceof UnknownPropertyError
        );
    });

});

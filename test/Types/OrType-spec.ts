
import {Model, Types} from "../../lib/index";
import assert from "assert";

describe("OrType", () => {
    
    it("constructor with string or number", () => {

        class SomeModel extends Model<SomeModel> {
            structure() {
                return {
                    id: Types.Or({
                        or: [Types.Number, Types.String]
                    })
                };
            }
        }

        const model1 = new SomeModel({
            id: 1
        });

        const model2 = new SomeModel({
            id: "b"
        });

        assert.strictEqual(model1.data.id, 1);
        assert.strictEqual(model2.data.id, "b");
        
    });

    it("set string or number", () => {

        class SomeModel extends Model<SomeModel> {
            structure() {
                return {
                    id: Types.Or({
                        or: [Types.Number, Types.String]
                    })
                };
            }
        }

        const model1 = new SomeModel();
        const model2 = new SomeModel();

        assert.strictEqual(model1.data.id, null);
        assert.strictEqual(model2.data.id, null);

        model1.set({
            id: 1
        });
        model2.set({
            id: "b"
        });

        assert.strictEqual(model1.data.id, 1);
        assert.strictEqual(model2.data.id, "b");
        
    });

    it("id is a number or string, but we set object", () => {

        class SomeModel extends Model<SomeModel> {
            structure() {
                return {
                    id: Types.Or({
                        or: [Types.Number, Types.String]
                    })
                };
            }
        }

        assert.throws(
            () => {
                const model = new SomeModel({
                    id: {} as any
                });
            },
            (err) =>
                err.message === "invalid number or string for id: {}"
        );
        
    });

});

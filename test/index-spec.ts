
import assert from "assert";
import * as index from "../lib/index";

describe("test index", () => {

    it("index has Model", () => {

        assert.ok( index.Model );

    });

    it("index has Collection", () => {

        assert.ok( index.Collection );

    });

});

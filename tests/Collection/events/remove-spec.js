"use strict";

const {Collection} = require("../../../lib/index");
const assert = require("assert");

describe("Collection event add", () => {

    it("remove(id)", () => {
        
        class Users extends Collection {
            static structure() {
                return {
                    id: {
                        type: "number",
                        primary: true
                    },
                    name: "text"
                };
            }
        }

        let users = new Users();

        let model;
        let type;
        let count = 0;
        let length;
        let collection;
        users.on("remove", (event) => {
            model = event.model;
            type = event.type;
            collection = event.collection;
            count++;
            length = users.length;
        });

        users.add({
            id: 1,
            name: "Bob"
        });
        users.remove( 1 );

        assert.strictEqual(type, "remove");
        assert.strictEqual(count, 1);
        assert.strictEqual(length, 0);
        assert.strictEqual(model.get("name"), "Bob");
        assert.ok(collection == users);
    });

    it("reset()", () => {
        
        class Users extends Collection {
            static structure() {
                return {
                    id: {
                        type: "number",
                        primary: true
                    },
                    name: "text"
                };
            }
        }

        let users = new Users();

        let model;
        let type;
        let count = 0;
        let length;
        let collection;
        users.on("remove", (event) => {
            model = event.model;
            type = event.type;
            collection = event.collection;
            count++;
            length = users.length;
        });

        users.add({
            id: 1,
            name: "Bob"
        });
        users.reset();

        assert.strictEqual(type, "remove");
        assert.strictEqual(count, 1);
        assert.strictEqual(length, 0);
        assert.strictEqual(model.get("name"), "Bob");
        assert.ok(collection == users);
    });


    it("at(index, row)", () => {
        
        class Users extends Collection {
            static structure() {
                return {
                    id: {
                        type: "number",
                        primary: true
                    },
                    name: "text"
                };
            }
        }

        let users = new Users();

        let model;
        let type;
        let count = 0;
        let length;
        let collection;
        users.on("remove", (event) => {
            model = event.model;
            type = event.type;
            collection = event.collection;
            count++;
            length = users.length;
        });

        users.add({
            id: 1,
            name: "Bob"
        });
        users.at( 0, {
            id: 2,
            name: "Oliver"
        });

        assert.strictEqual(type, "remove");
        assert.strictEqual(count, 1);
        assert.strictEqual(length, 1);
        assert.strictEqual(model.get("name"), "Bob");
        assert.ok(collection == users);
    });

    it("pop()", () => {
        
        class Users extends Collection {
            static structure() {
                return {
                    id: {
                        type: "number",
                        primary: true
                    },
                    name: "text"
                };
            }
        }

        let users = new Users();

        let model;
        let type;
        let count = 0;
        let length;
        let collection;
        users.on("remove", (event) => {
            model = event.model;
            type = event.type;
            collection = event.collection;
            count++;
            length = users.length;
        });

        users.add({
            id: 1,
            name: "Bob"
        });
        users.pop();

        assert.strictEqual(type, "remove");
        assert.strictEqual(count, 1);
        assert.strictEqual(length, 0);
        assert.strictEqual(model.get("name"), "Bob");
        assert.ok(collection == users);
    });

    it("shift()", () => {
        
        class Users extends Collection {
            static structure() {
                return {
                    id: {
                        type: "number",
                        primary: true
                    },
                    name: "text"
                };
            }
        }

        let users = new Users();

        let model;
        let type;
        let count = 0;
        let length;
        let collection;
        users.on("remove", (event) => {
            model = event.model;
            type = event.type;
            collection = event.collection;
            count++;
            length = users.length;
        });

        users.add({
            id: 1,
            name: "Bob"
        });
        users.shift();

        assert.strictEqual(type, "remove");
        assert.strictEqual(count, 1);
        assert.strictEqual(length, 0);
        assert.strictEqual(model.get("name"), "Bob");
        assert.ok(collection == users);
    });

    it("splice(0, 1)", () => {
        
        class Users extends Collection {
            static structure() {
                return {
                    id: {
                        type: "number",
                        primary: true
                    },
                    name: "text"
                };
            }
        }

        let users = new Users();

        let model;
        let type;
        let count = 0;
        let length;
        let collection;
        users.on("remove", (event) => {
            model = event.model;
            type = event.type;
            collection = event.collection;
            count++;
            length = users.length;
        });

        users.add({
            id: 1,
            name: "Bob"
        });
        users.splice(0, 1);

        assert.strictEqual(type, "remove");
        assert.strictEqual(count, 1);
        assert.strictEqual(length, 0);
        assert.strictEqual(model.get("name"), "Bob");
        assert.ok(collection == users);
    });

});
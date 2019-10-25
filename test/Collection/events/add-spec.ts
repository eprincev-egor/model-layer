"use strict";

const {Collection} = require("../../../lib/index");
const assert = require("assert");

describe("Collection event add", () => {

    it("add(row)", () => {
        
        class Users extends Collection {
            static data() {
                return {
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
        users.on("add", (event) => {
            model = event.model;
            type = event.type;
            collection = event.collection;
            count++;
            length = users.length;
        });

        users.add({
            name: "Bob"
        });

        assert.strictEqual(type, "add");
        assert.strictEqual(count, 1);
        assert.strictEqual(length, 1);
        assert.strictEqual(model.get("name"), "Bob");
        assert.ok(collection == users);
    });


    it("create(row)", () => {
        
        class Users extends Collection {
            static data() {
                return {
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
        users.on("add", (event) => {
            model = event.model;
            type = event.type;
            collection = event.collection;
            count++;
            length = users.length;
        });

        users.create({
            name: "Bob"
        });

        assert.strictEqual(type, "add");
        assert.strictEqual(count, 1);
        assert.strictEqual(length, 1);
        assert.strictEqual(model.get("name"), "Bob");
        assert.ok(collection == users);
    });

    it("push(row)", () => {
        
        class Users extends Collection {
            static data() {
                return {
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
        users.on("add", (event) => {
            model = event.model;
            type = event.type;
            collection = event.collection;
            count++;
            length = users.length;
        });

        users.push({
            name: "Bob"
        });

        assert.strictEqual(type, "add");
        assert.strictEqual(count, 1);
        assert.strictEqual(length, 1);
        assert.strictEqual(model.get("name"), "Bob");
        assert.ok(collection == users);
    });

    it("unshift(row)", () => {
        
        class Users extends Collection {
            static data() {
                return {
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
        users.on("add", (event) => {
            model = event.model;
            type = event.type;
            collection = event.collection;
            count++;
            length = users.length;
        });

        users.unshift({
            name: "Bob"
        });

        assert.strictEqual(type, "add");
        assert.strictEqual(count, 1);
        assert.strictEqual(length, 1);
        assert.strictEqual(model.get("name"), "Bob");
        assert.ok(collection == users);
    });

    it("splice(0, 0, row)", () => {
        
        class Users extends Collection {
            static data() {
                return {
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
        users.on("add", (event) => {
            model = event.model;
            type = event.type;
            collection = event.collection;
            count++;
            length = users.length;
        });

        users.splice(0, 0, {
            name: "Bob"
        });

        assert.strictEqual(type, "add");
        assert.strictEqual(count, 1);
        assert.strictEqual(length, 1);
        assert.strictEqual(model.get("name"), "Bob");
        assert.ok(collection == users);
    });

    it("at(0, row)", () => {
        
        class Users extends Collection {
            static data() {
                return {
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
        users.on("add", (event) => {
            model = event.model;
            type = event.type;
            collection = event.collection;
            count++;
            length = users.length;
        });

        users.at(0, {
            name: "Bob"
        });

        assert.strictEqual(type, "add");
        assert.strictEqual(count, 1);
        assert.strictEqual(length, 1);
        assert.strictEqual(model.get("name"), "Bob");
        assert.ok(collection == users);
    });

    it("fill(row, start, end)", () => {
        
        class Users extends Collection {
            static data() {
                return {
                    name: "text"
                };
            }
        }

        let users = new Users([
            {name: "A"},
            {name: "B"},
            {name: "C"}
        ]);

        let model;
        let type;
        let count = 0;
        let length;
        let collection;
        users.on("add", (event) => {
            model = event.model;
            type = event.type;
            collection = event.collection;
            count++;
            length = users.length;
        });

        users.fill({
            name: "Bob"
        }, 0, 1);

        assert.strictEqual(type, "add");
        assert.strictEqual(count, 1);
        assert.strictEqual(length, 3);
        assert.strictEqual(model.get("name"), "Bob");
        assert.ok(collection == users);
    });

});
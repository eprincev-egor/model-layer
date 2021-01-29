
import {Collection, Model, Types} from "../../../lib/index";
import assert from "assert";

describe("Collection event add", () => {

    it("remove(id)", () => {
        
        class User extends Model<User> {
            structure() {
                return {
                    id: Types.Number({
                        primary: true
                    }),
                    name: Types.String
                };
            }
        }

        class Users extends Collection<User> {
            Model() {
                return User;
            }
        }

        const users = new Users();

        let model!: User;
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
        assert.ok(collection === users);
    });

    it("reset()", () => {
        
        class User extends Model<User> {
            structure() {
                return {
                    id: Types.Number({
                        primary: true
                    }),
                    name: Types.String
                };
            }
        }

        class Users extends Collection<User> {
            Model() {
                return User;
            }
        }

        const users = new Users();

        let model!: User;
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
        assert.ok(collection === users);
    });


    it("at(index, row)", () => {
        
        class User extends Model<User> {
            structure() {
                return {
                    id: Types.Number({
                        primary: true
                    }),
                    name: Types.String
                };
            }
        }

        class Users extends Collection<User> {
            Model() {
                return User;
            }
        }

        const users = new Users();

        let model!: User;
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
        assert.ok(collection === users);
    });

    it("pop()", () => {
        
        class User extends Model<User> {
            structure() {
                return {
                    id: Types.Number({
                        primary: true
                    }),
                    name: Types.String
                };
            }
        }

        class Users extends Collection<User> {
            Model() {
                return User;
            }
        }

        const users = new Users();

        let model!: User;
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
        assert.ok(collection === users);
    });

    it("shift()", () => {
        
        class User extends Model<User> {
            structure() {
                return {
                    id: Types.Number({
                        primary: true
                    }),
                    name: Types.String
                };
            }
        }

        class Users extends Collection<User> {
            Model() {
                return User;
            }
        }

        const users = new Users();

        let model!: User;
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
        assert.ok(collection === users);
    });

    it("splice(0, 1)", () => {
        
        class User extends Model<User> {
            structure() {
                return {
                    id: Types.Number({
                        primary: true
                    }),
                    name: Types.String
                };
            }
        }

        class Users extends Collection<User> {
            Model() {
                return User;
            }
        }

        const users = new Users();

        let model!: User;
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
        assert.ok(collection === users);
    });

});

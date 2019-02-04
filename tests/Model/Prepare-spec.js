"use strict";

const Model = require("../../lib/Model");
const assert = require("assert");

describe("Model prepare", () => {
    
    it("prepare number", () => {
        class SomeModel extends Model {
            static structure() {
                return {
                    age: {
                        type: "number",
                        default: "0"
                    }
                };
            }
        }
        let model;

        model = new SomeModel();
        assert.strictEqual( model.data.age, 0 );

        model = new SomeModel({
            age: "1"
        });
        assert.strictEqual( model.data.age, 1 );
        
        model.set("age", "2");
        assert.strictEqual( model.data.age, 2 );

        model.set("age", null);
        assert.strictEqual( model.data.age, null );

        model.set("age", "-2000.123");
        assert.strictEqual( model.data.age, -2000.123 );

        assert.throws(
            () => {
                model.set("age", "wrong");
            },
            err =>
                err.message == "invalid number for age: \"wrong\""
        );

        assert.throws(
            () => {
                model.set("age", {});
            },
            err =>
                err.message == "invalid number for age: {}"
        );

        assert.throws(
            () => {
                model.set("age", {age: 1});
            },
            err =>
                err.message == "invalid number for age: {\"age\":1}"
        );

        assert.throws(
            () => {
                model.set("age", false);
            },
            err =>
                err.message == "invalid number for age: false"
        );

        assert.throws(
            () => {
                model.set("age", true);
            },
            err =>
                err.message == "invalid number for age: true"
        );

        assert.throws(
            () => {
                model.set("age", /x/);
            },
            err =>
                err.message == "invalid number for age: /x/"
        );

        assert.throws(
            () => {
                model.set("age", -1 / 0);
            },
            err =>
                err.message == "invalid number for age: -Infinity"
        );

        assert.throws(
            () => {
                model.set("age", 1 / 0);
            },
            err =>
                err.message == "invalid number for age: Infinity"
        );

        assert.throws(
            () => {
                model.set("age", NaN);
            },
            err =>
                err.message == "invalid number for age: NaN"
        );

        assert.throws(
            () => {
                model.set("age", [0]);
            },
            err =>
                err.message == "invalid number for age: [0]"
        );


        let circularJSON = {};
        circularJSON.test = circularJSON;
        assert.throws(
            () => {
                model.set("age", circularJSON);
            },
            err =>
                err.message == "invalid number for age: [object Object]"
        );


        assert.strictEqual( model.data.age, -2000.123 );
    });

    
    it("prepare string", () => {
        class SomeModel extends Model {
            static structure() {
                return {
                    name: {
                        type: "string",
                        default: 10
                    }
                };
            }
        }
        let model;

        model = new SomeModel();
        assert.strictEqual( model.data.name, "10" );

        model = new SomeModel({
            name: -20
        });
        assert.strictEqual( model.data.name, "-20" );
        
        model.set("name", 1.1);
        assert.strictEqual( model.data.name, "1.1" );

        model.set("name", null);
        assert.strictEqual( model.data.name, null );

        model.set("name", "nice");
        assert.strictEqual( model.data.name, "nice" );

        
        assert.throws(
            () => {
                model.set("name", {});
            },
            err =>
                err.message == "invalid string for name: {}"
        );

        assert.throws(
            () => {
                model.set("name", {name: 1});
            },
            err =>
                err.message == "invalid string for name: {\"name\":1}"
        );

        assert.throws(
            () => {
                model.set("name", false);
            },
            err =>
                err.message == "invalid string for name: false"
        );

        assert.throws(
            () => {
                model.set("name", true);
            },
            err =>
                err.message == "invalid string for name: true"
        );

        assert.throws(
            () => {
                model.set("name", -1 / 0);
            },
            err =>
                err.message == "invalid string for name: -Infinity"
        );

        assert.throws(
            () => {
                model.set("name", 1 / 0);
            },
            err =>
                err.message == "invalid string for name: Infinity"
        );

        assert.throws(
            () => {
                model.set("name", NaN);
            },
            err =>
                err.message == "invalid string for name: NaN"
        );

        assert.throws(
            () => {
                model.set("name", /x/);
            },
            err =>
                err.message == "invalid string for name: /x/"
        );

        assert.throws(
            () => {
                model.set("name", [0]);
            },
            err =>
                err.message == "invalid string for name: [0]"
        );

        assert.strictEqual( model.data.name, "nice" );
    });

    it("prepare boolean", () => {
        class SomeModel extends Model {
            static structure() {
                return {
                    some: {
                        type: "boolean",
                        default: 0
                    }
                };
            }
        }
        let model;

        model = new SomeModel();
        assert.strictEqual( model.data.some, false );

        model = new SomeModel({
            some: 1
        });
        assert.strictEqual( model.data.some, true );
        
        model.set("some", false);
        assert.strictEqual( model.data.some, false );

        model.set("some", null);
        assert.strictEqual( model.data.some, null );

        model.set("some", true);
        assert.strictEqual( model.data.some, true );

        
        assert.throws(
            () => {
                model.set("some", {});
            },
            err =>
                err.message == "invalid boolean for some: {}"
        );

        assert.throws(
            () => {
                model.set("some", {some: 1});
            },
            err =>
                err.message == "invalid boolean for some: {\"some\":1}"
        );

        assert.throws(
            () => {
                model.set("some", -1 / 0);
            },
            err =>
                err.message == "invalid boolean for some: -Infinity"
        );

        assert.throws(
            () => {
                model.set("some", 1 / 0);
            },
            err =>
                err.message == "invalid boolean for some: Infinity"
        );

        assert.throws(
            () => {
                model.set("some", NaN);
            },
            err =>
                err.message == "invalid boolean for some: NaN"
        );

        assert.throws(
            () => {
                model.set("some", /x/);
            },
            err =>
                err.message == "invalid boolean for some: /x/"
        );

        assert.throws(
            () => {
                model.set("some", "wrong");
            },
            err =>
                err.message == "invalid boolean for some: \"wrong\""
        );

        assert.throws(
            () => {
                model.set("some", [0]);
            },
            err =>
                err.message == "invalid boolean for some: [0]"
        );

        assert.strictEqual( model.data.some, true );
    });

    it("prepare trim", () => {
        class SomeModel extends Model {
            static structure() {
                return {
                    name: {
                        type: "string",
                        default: " bob ",
                        trim: true
                    }
                };
            }
        }

        let model = new SomeModel();
        assert.strictEqual( model.data.name, "bob" );

        model.set("name", " word ");
        assert.strictEqual( model.data.name, "word" );
    });

    it("prepare emptyAsNull", () => {
        class SomeModel extends Model {
            static structure() {
                return {
                    name: {
                        type: "string",
                        default: "",
                        emptyAsNull: true
                    }
                };
            }
        }

        let model = new SomeModel();
        assert.strictEqual( model.data.name, null );

        model.set("name", "word");
        assert.strictEqual( model.data.name, "word" );

        model.set("name", "");
        assert.strictEqual( model.data.name, null );
    });

    it("prepare nullAsEmpty", () => {
        class SomeModel extends Model {
            static structure() {
                return {
                    name: {
                        type: "string",
                        nullAsEmpty: true
                    }
                };
            }
        }

        let model = new SomeModel();
        assert.strictEqual( model.data.name, "" );

        model.set("name", "word");
        assert.strictEqual( model.data.name, "word" );

        model.set("name", null);
        assert.strictEqual( model.data.name, "" );
    });

    it("prepare trim and emptyAsNull", () => {
        class SomeModel extends Model {
            static structure() {
                return {
                    name: {
                        type: "string",
                        default: " ",
                        trim: true,
                        emptyAsNull: true
                    }
                };
            }
        }

        let model = new SomeModel();
        assert.strictEqual( model.data.name, null );

        model.set("name", " word ");
        assert.strictEqual( model.data.name, "word" );

        model.set("name", "   ");
        assert.strictEqual( model.data.name, null );
    });

    it("prepare lower", () => {
        class SomeModel extends Model {
            static structure() {
                return {
                    name: {
                        type: "string",
                        default: "BOB",
                        lower: true
                    }
                };
            }
        }

        let model = new SomeModel();
        assert.strictEqual( model.data.name, "bob" );

        model.set("name", "WORD");
        assert.strictEqual( model.data.name, "word" );
    });

    it("prepare upper", () => {
        class SomeModel extends Model {
            static structure() {
                return {
                    name: {
                        type: "string",
                        default: "bob",
                        upper: true
                    }
                };
            }
        }

        let model = new SomeModel();
        assert.strictEqual( model.data.name, "BOB" );

        model.set("name", "word");
        assert.strictEqual( model.data.name, "WORD" );
    });

    it("prepare lower and trim", () => {
        class SomeModel extends Model {
            static structure() {
                return {
                    name: {
                        type: "string",
                        default: " Bob ",
                        lower: true,
                        trim: true
                    }
                };
            }
        }

        let model = new SomeModel();
        assert.strictEqual( model.data.name, "bob" );

        model.set("name", "WORD ");
        assert.strictEqual( model.data.name, "word" );
    });

    it("prepare round", () => {
        class SomeModel extends Model {
            static structure() {
                return {
                    money: {
                        type: "number",
                        default: 1.1111,
                        round: 2
                    }
                };
            }
        }

        let model = new SomeModel();
        assert.strictEqual( model.data.money, 1.11 );

        model.set("money", 1.999);
        assert.strictEqual( model.data.money, 2 );
    });

    it("prepare floor", () => {
        class SomeModel extends Model {
            static structure() {
                return {
                    money: {
                        type: "number",
                        default: 1.1111,
                        floor: 2
                    }
                };
            }
        }

        let model = new SomeModel();
        assert.strictEqual( model.data.money, 1.11 );

        model.set("money", 1.999);
        assert.strictEqual( model.data.money, 1.99 );
    });

    it("prepare ceil", () => {
        class SomeModel extends Model {
            static structure() {
                return {
                    money: {
                        type: "number",
                        default: 1.1111,
                        ceil: 2
                    }
                };
            }
        }

        let model = new SomeModel();
        assert.strictEqual( model.data.money, 1.12 );

        model.set("money", 1.599);
        assert.strictEqual( model.data.money, 1.6 );
    });

    it("prepare zeroAsNull", () => {
        class SomeModel extends Model {
            static structure() {
                return {
                    money: {
                        type: "number",
                        default: 0,
                        round: 0,
                        zeroAsNull: true
                    }
                };
            }
        }

        let model = new SomeModel();
        assert.strictEqual( model.data.money, null );

        model.set("money", 1.1111);
        assert.strictEqual( model.data.money, 1 );

        model.set("money", 0.0001);
        assert.strictEqual( model.data.money, null );
    });

    it("prepare nullAsZero", () => {
        class SomeModel extends Model {
            static structure() {
                return {
                    money: {
                        type: "number",
                        nullAsZero: true
                    }
                };
            }
        }

        let model = new SomeModel();
        assert.strictEqual( model.data.money, 0 );

        model.set("money", 1);
        assert.strictEqual( model.data.money, 1 );

        model.set("money", null);
        assert.strictEqual( model.data.money, 0 );
    });

    it("custom prepare field", () => {
        class SomeModel extends Model {
            static structure() {
                return {
                    money: {
                        type: "number",
                        default: 1,
                        prepare: value =>
                            value * 2
                    }
                };
            }
        }

        let model = new SomeModel();
        assert.strictEqual( model.data.money, 2 );

        model.set("money", 12);
        assert.strictEqual( model.data.money, 24 );

        model.set("money", null);
        assert.strictEqual( model.data.money, null );
    });

    it("custom prepare field and standard prepares (round, trim, emptyAsNull)", () => {
        class SomeModel extends Model {
            static structure() {
                return {
                    name: {
                        type: "string",
                        default: "  ",
                        trim: true,
                        emptyAsNull: true,
                        prepare: value =>
                            value[0].toUpperCase() + 
                                value.slice(1).toLowerCase()
                    },
                    age: {
                        type: "number",
                        default: 0,
                        zeroAsNull: true,
                        prepare: value =>
                            +(value).toFixed(0)
                    }
                };
            }
        }

        let model = new SomeModel();
        assert.strictEqual( model.data.name, null );
        assert.strictEqual( model.data.age, null );

        model = new SomeModel({
            name: " wOrd ",
            age: 1.1111
        });
        assert.strictEqual( model.data.name, "Word" );
        assert.strictEqual( model.data.age, 1 );
    });

    it("custom prepare data", () => {
        function upFirstLetter(name) {
            return (
                name[0].toUpperCase() + 
                    name.slice(1).toLowerCase()
            );
        }

        class SomeModel extends Model {
            static structure() {
                return {
                    firstName: {
                        type: "string",
                        trim: true,
                        emptyAsNull: true,
                        prepare: name =>
                            upFirstLetter( name )
                    },
                    lastName: {
                        type: "string",
                        trim: true,
                        emptyAsNull: true,
                        prepare: name =>
                            upFirstLetter( name )
                    },
                    fullName: {
                        type: "string",
                        trim: true,
                        emptyAsNull: true
                    }
                };
            }

            prepare(data) {
                // data.firstName can be null
                let firstName = data.firstName || "";
                // data.lastName can be null
                let lastName = data.lastName || "";

                data.fullName = `${ firstName } ${lastName}`;
            }
        }

        let model = new SomeModel();
        assert.strictEqual( model.data.firstName, null );
        assert.strictEqual( model.data.lastName, null );
        assert.strictEqual( model.data.fullName, null );

        model = new SomeModel({
            firstName: "bob"
        });
        assert.strictEqual( model.data.firstName, "Bob" );
        assert.strictEqual( model.data.lastName, null );
        assert.strictEqual( model.data.fullName, "Bob" );
        
        model.set({
            lastName: "  taylor"
        });
        assert.strictEqual( model.data.firstName, "Bob" );
        assert.strictEqual( model.data.lastName, "Taylor" );
        assert.strictEqual( model.data.fullName, "Bob Taylor" );
    });


    it("prepare falseAsNull", () => {
        class SomeModel extends Model {
            static structure() {
                return {
                    some: {
                        type: "boolean",
                        default: false,
                        falseAsNull: true
                    }
                };
            }
        }

        let model = new SomeModel();
        assert.strictEqual( model.data.some, null );

        model.set("some", false);
        assert.strictEqual( model.data.some, null );

        model.set("some", true);
        assert.strictEqual( model.data.some, true );

        model.set("some", 0);
        assert.strictEqual( model.data.some, null );

        model.set("some", 1);
        assert.strictEqual( model.data.some, true );
    });

    it("prepare nullAsFalse", () => {
        class SomeModel extends Model {
            static structure() {
                return {
                    some: {
                        type: "boolean",
                        nullAsFalse: true
                    }
                };
            }
        }

        let model = new SomeModel();
        assert.strictEqual( model.data.some, false );

        model.set("some", true);
        assert.strictEqual( model.data.some, true );

        model.set("some", null);
        assert.strictEqual( model.data.some, false );
    });



    it("prepare date", () => {
        // Date.parse trimming ms
        let now = Date.parse(
            new Date().toString()
        );
        let nowDate = new Date( now );

        class SomeModel extends Model {
            static structure() {
                return {
                    bornDate: {
                        type: "date",
                        default: now
                    }
                };
            }
        }
        let model;

        model = new SomeModel();
        assert.strictEqual( +model.data.bornDate, now );
        assert.ok( model.data.bornDate instanceof Date );

        model = new SomeModel({
            bornDate: nowDate
        });
        assert.strictEqual( +model.data.bornDate, now );
        assert.ok( model.data.bornDate instanceof Date );
        
        model.set("bornDate", now);
        assert.strictEqual( +model.data.bornDate, now );
        assert.ok( model.data.bornDate instanceof Date );

        model.set("bornDate", null);
        assert.strictEqual( model.data.bornDate, null );

        model.set("bornDate", nowDate.toString());
        assert.strictEqual( +model.data.bornDate, now );
        assert.ok( model.data.bornDate instanceof Date );

        model.set("bornDate", null);
        assert.strictEqual( model.data.bornDate, null );

        model.set("bornDate", nowDate.toISOString());
        assert.strictEqual( +model.data.bornDate, now );
        assert.ok( model.data.bornDate instanceof Date );

        assert.throws(
            () => {
                model.set("bornDate", "wrong");
            },
            err =>
                err.message == "invalid date for bornDate: \"wrong\""
        );

        assert.throws(
            () => {
                model.set("bornDate", {});
            },
            err =>
                err.message == "invalid date for bornDate: {}"
        );

        assert.throws(
            () => {
                model.set("bornDate", {bornDate: 1});
            },
            err =>
                err.message == "invalid date for bornDate: {\"bornDate\":1}"
        );

        assert.throws(
            () => {
                model.set("bornDate", false);
            },
            err =>
                err.message == "invalid date for bornDate: false"
        );

        assert.throws(
            () => {
                model.set("bornDate", true);
            },
            err =>
                err.message == "invalid date for bornDate: true"
        );

        assert.throws(
            () => {
                model.set("bornDate", -1 / 0);
            },
            err =>
                err.message == "invalid date for bornDate: -Infinity"
        );

        assert.throws(
            () => {
                model.set("bornDate", 1 / 0);
            },
            err =>
                err.message == "invalid date for bornDate: Infinity"
        );

        assert.throws(
            () => {
                model.set("bornDate", NaN);
            },
            err =>
                err.message == "invalid date for bornDate: NaN"
        );

        assert.throws(
            () => {
                model.set("bornDate", /x/);
            },
            err =>
                err.message == "invalid date for bornDate: /x/"
        );

        assert.throws(
            () => {
                model.set("bornDate", [0]);
            },
            err =>
                err.message == "invalid date for bornDate: [0]"
        );

        assert.strictEqual( +model.data.bornDate, now );
        assert.ok( model.data.bornDate instanceof Date );
    });

    it("redefine standard prepare number", () => {
        let originalPrepare = Model.prepareNumber;
        let callArgs = false;

        Model.prepareNumber = function(description, key, value) {
            callArgs = [description, key, value];
            return originalPrepare(description, key, value);
        };

        class SomeModel extends Model {
            static structure() {
                return {
                    age: "number"
                };
            }
        }

        let model = new SomeModel({
            age: "10"
        });

        assert.strictEqual( model.data.age, 10 );
        assert.deepEqual( callArgs, [
            { type: "number" }, 
            "age", "10"
        ]);

        Model.prepareNumber = originalPrepare;
    });

    it("redefine standard prepare string", () => {
        let originalPrepare = Model.prepareString;
        let callArgs = false;

        Model.prepareString = function(description, key, value) {
            callArgs = [description, key, value];
            return originalPrepare(description, key, value);
        };

        class SomeModel extends Model {
            static structure() {
                return {
                    name: "string"
                };
            }
        }

        let model = new SomeModel({
            name: 0
        });

        assert.strictEqual( model.data.name, "0" );
        assert.deepEqual( callArgs, [
            { type: "string" },
            "name", 0
        ]);

        Model.prepareString = originalPrepare;
    });

    it("redefine standard prepare boolean", () => {
        let originalPrepare = Model.prepareBoolean;
        let callArgs = false;

        Model.prepareBoolean = function(description, key, value) {
            callArgs = [description, key, value];
            return originalPrepare(description, key, value);
        };

        class SomeModel extends Model {
            static structure() {
                return {
                    some: "boolean"
                };
            }
        }

        let model = new SomeModel({
            some: 0
        });

        assert.strictEqual( model.data.some, false );
        assert.deepEqual( callArgs, [
            { type: "boolean" },
            "some", 0
        ]);

        Model.prepareBoolean = originalPrepare;
    });


    it("redefine standard prepare date", () => {
        let originalPrepare = Model.prepareDate;
        let callArgs = false;

        Model.prepareDate = function(description, key, value) {
            callArgs = [description, key, value];
            return originalPrepare(description, key, value);
        };

        class SomeModel extends Model {
            static structure() {
                return {
                    bornDate: "date"
                };
            }
        }

        let now = Date.now();
        let model = new SomeModel({
            bornDate: now
        });

        assert.strictEqual( +model.data.bornDate, now );
        assert.ok( model.data.bornDate instanceof Date );
        assert.deepEqual( callArgs, [
            { type: "date" },
            "bornDate", now
        ]);

        Model.prepareDate = originalPrepare;
    });
    
    
});
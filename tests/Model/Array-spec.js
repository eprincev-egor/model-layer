"use strict";

const Model = require("../../lib/Model");
const assert = require("assert");

describe("Model array property", () => {
    
    it("array of numbers", () => {
        class CompanyModel extends Model {
            static structure() {
                return {
                    name: "string",
                    managersIds: ["number"]
                };
            }
        }

        assert.throws(
            () => {
                new CompanyModel({
                    managersIds: false
                });
            }, 
            err => 
                err.message ==  "invalid array[number] for managersIds: false"
        );
        

        assert.throws(
            () => {
                new CompanyModel({
                    managersIds: true
                });
            }, 
            err => 
                err.message ==  "invalid array[number] for managersIds: true"
        );
        

        assert.throws(
            () => {
                new CompanyModel({
                    managersIds: {}
                });
            }, 
            err => 
                err.message ==  "invalid array[number] for managersIds: {}"
        );
        

        assert.throws(
            () => {
                new CompanyModel({
                    managersIds: "1,2"
                });
            }, 
            err => 
                err.message ==  "invalid array[number] for managersIds: \"1,2\""
        );
        

        assert.throws(
            () => {
                new CompanyModel({
                    managersIds: NaN
                });
            }, 
            err => 
                err.message ==  "invalid array[number] for managersIds: NaN"
        );
        

        assert.throws(
            () => {
                new CompanyModel({
                    managersIds: /x/
                });
            }, 
            err => 
                err.message ==  "invalid array[number] for managersIds: /x/"
        );
        

        assert.throws(
            () => {
                new CompanyModel({
                    managersIds: Infinity
                });
            }, 
            err => 
                err.message ==  "invalid array[number] for managersIds: Infinity"
        );
        

        assert.throws(
            () => {
                new CompanyModel({
                    managersIds: -Infinity
                });
            }, 
            err =>
                err.message == "invalid array[number] for managersIds: -Infinity"
        );
        

        assert.throws(
            () => {
                new CompanyModel({
                    managersIds: 0
                });
            }, 
            err => 
                err.message ==  "invalid array[number] for managersIds: 0"
        );
        


        assert.throws(
            () => {
                new CompanyModel({
                    managersIds: [false]
                });
            }, 
            err => 
                err.message == "invalid array[number] for managersIds: [false],\n invalid number for 0: false"
        );
        

        assert.throws(
            () => {
                new CompanyModel({
                    managersIds: ["1", "wrong"]
                });
            }, 
            err => 
                err.message == "invalid array[number] for managersIds: [\"1\",\"wrong\"],\n invalid number for 1: \"wrong\""
        );
        


        let outsideArr = ["1", 2];
        let companyModel = new CompanyModel({
            managersIds: outsideArr
        });

        let managersIds = companyModel.get("managersIds");

        assert.deepEqual( managersIds, [1, 2] );
        assert.strictEqual( managersIds[0], 1 );

        assert.ok( outsideArr != managersIds );


        // array should be frozen
        assert.throws(
            () => {
                managersIds[0] = 10;
            },
            err =>
                /Cannot assign to read only property/.test(err.message)
        );
        

        assert.strictEqual( managersIds[0], 1 );
    });

    
    it("emptyAsNull", () => {
        class SomeModel extends Model {
            static structure() {
                return {
                    colors: {
                        type: ["string"],
                        default: [],
                        emptyAsNull: true
                    }
                };
            }
        }

        let model = new SomeModel();
        assert.strictEqual( model.data.colors, null );

        model.set("colors", ["red"]);
        assert.deepEqual( model.data.colors, ["red"] );

        model.set("colors", []);
        assert.strictEqual( model.data.colors, null );
    });

    it("nullAsEmpty", () => {
        class SomeModel extends Model {
            static structure() {
                return {
                    colors: {
                        type: ["string"],
                        nullAsEmpty: true
                    }
                };
            }
        }

        let model = new SomeModel();
        assert.deepEqual( model.data.colors, [] );

        model.set("colors", ["red"]);
        assert.deepEqual( model.data.colors, ["red"] );

        model.set("colors", null);
        assert.deepEqual( model.data.colors, [] );
    });


    it("array[boolean]", () => {
        class SomeModel extends Model {
            static structure() {
                return {
                    answers: ["boolean"]
                };
            }
        }

        assert.throws(
            () => {
                new SomeModel({
                    answers: [1, 0, false, true, "wrong"]
                });
            }, 
            err => 
                err.message == "invalid array[boolean] for answers: [1,0,false,true,\"wrong\"],\n invalid boolean for 4: \"wrong\""
        );
        

        let model = new SomeModel({
            answers: [1, true]
        });

        let answers = model.data.answers;
        assert.deepEqual( answers, [true, true] );

        assert.strictEqual( answers[0], true );
        assert.strictEqual( answers[1], true );
    });

    it("array[date]", () => {
        class SomeModel extends Model {
            static structure() {
                return {
                    pays: ["date"]
                };
            }
        }

        assert.throws(
            () => {
                new SomeModel({
                    pays: ["wrong"]
                });
            }, 
            err => 
                err.message == "invalid array[date] for pays: [\"wrong\"],\n invalid date for 0: \"wrong\""
        );
        

        let now = Date.now();
        let model = new SomeModel({
            pays: [now]
        });

        let pays = model.data.pays;

        assert.strictEqual( +pays[0], now );
        assert.ok( pays[0] instanceof Date );
    });

    it("array[ChildModel]", () => {
        class UserModel extends Model {
            static structure() {
                return {
                    name: {
                        type: "string",
                        trim: true
                    }
                };
            }
        }

        class CompanyModel extends Model {
            static structure() {
                return {
                    managers: [UserModel]
                };
            }
        }

        assert.throws(
            () => {
                new CompanyModel({
                    managers: [false]
                });
            }, 
            err => 
                err.message == "invalid array[UserModel] for managers: [false],\n invalid UserModel for 0: false"
        );
        

        let companyModel = new CompanyModel({
            managers: [{
                name: " Bob "
            }]
        });

        let managers = companyModel.data.managers;
        assert.ok( managers[0] instanceof UserModel );
        assert.equal( managers[0].get("name"), "Bob" );
    });

    it("array[string]", () => {
        class SomeModel extends Model {
            static structure() {
                return {
                    colors: [{
                        type: "string",
                        upper: true
                    }],
                    names: {
                        type: "array",
                        element: {
                            type: "string",
                            trim: true
                        }
                    }
                };
            }
        }

        assert.throws(
            () => {
                new SomeModel({
                    names: [false]
                });
            }, 
            err => 
                err.message == "invalid array[string] for names: [false],\n invalid string for 0: false"
        );
        

        let model = new SomeModel({
            colors: ["red"],
            names: [" Bob "]
        });

        assert.deepEqual(model.data, {
            colors: ["RED"],
            names: ["Bob"]
        });
    });

    it("unique primitive", () => {
        class CompanyModel extends Model {
            static structure() {
                return {
                    managersIds: {
                        type: "array",
                        element: "number",
                        unique: true
                    }
                };
            }
        }

        assert.throws(
            () => {
                new CompanyModel({
                    managersIds: [1, 2, 1]
                });
            }, 
            err => 
                err.message == "managersIds is not unique: [1,2,1]"
        );
        

        let companyModel = new CompanyModel({
            managersIds: [1, 2]
        });

        assert.throws(
            () => {
                companyModel.set("managersIds", [2, 2]);

            
        
            }, 
            err => 
                err.message == "managersIds is not unique: [2,2]"
        );
        

        assert.deepEqual(companyModel.data.managersIds, [1, 2]);
        
        // in unique validation   null != null
        companyModel.set("managersIds", [null, undefined, null]);
        assert.deepEqual(companyModel.data.managersIds, [null, null, null]);
    });

    it("unique ChildModel", () => {
        class UserModel extends Model {
            static structure() {
                return {
                    name: "string"
                };
            }
        }

        class CompanyModel extends Model {
            static structure() {
                return {
                    managers: {
                        type: "array",
                        element: UserModel,
                        unique: true
                    }
                };
            }
        }

        let userModel1 = new UserModel({
            name: "test"
        });

        assert.throws(
            () => {
                new CompanyModel({
                    managers: [userModel1, userModel1]
                });
            }, 
            err => 
                err.message == "managers is not unique: [{\"name\":\"test\"},{\"name\":\"test\"}]"
        );
        

        let userModel2 = new UserModel({
            name: "test"
        }); 

        let companyModel = new CompanyModel({
            managers: [userModel1, userModel2]
        });

        let managers = companyModel.data.managers;
        assert.ok( managers[0] == userModel1 );
        assert.ok( managers[1] == userModel2 );

        assert.throws(
            () => {
                companyModel.set("managers", [userModel2, userModel2]);
            }, 
            err => 
                err.message == "managers is not unique: [{\"name\":\"test\"},{\"name\":\"test\"}]"
        );
        

        managers = companyModel.data.managers;
        assert.ok( managers[0] == userModel1 );
        assert.ok( managers[1] == userModel2 );
    });

    it("sort", () => {
        class CompanyModel extends Model {
            static structure() {
                return {
                    managersIds: {
                        type: "array",
                        element: "number",
                        sort: true
                    }
                };
            }
        }

        let companyModel = new CompanyModel({
            managersIds: ["30", 2, -10]
        });

        assert.deepEqual(companyModel.data.managersIds, [-10, 2, 30]);
    });

    it("sort by custom comparator", () => {
        class SomeModel extends Model {
            static structure() {
                return {
                    names: {
                        type: "array",
                        element: "string",
                        // sort by second letter
                        sort: (a, b) =>
                            +a[1] > +b[1] ?
                                1 :
                                -1
                    }
                };
            }
        }

        let model = new SomeModel({
            names: ["a3", "b2", "c1"]
        });

        assert.deepEqual(model.data.names, ["c1", "b2", "a3"]);
    });

    it("matrix", () => {
        class SomeModel extends Model {
            static structure() {
                return {
                    matrix: [["number"]]
                };
            }
        }

        let model = new SomeModel({
            matrix: [
                [1, 2, 3],
                [4, 5, 6],
                [7, 8, 9]
            ]
        });

        assert.deepEqual(model.data.matrix, [
            [1, 2, 3],
            [4, 5, 6],
            [7, 8, 9]
        ]);
    });

});
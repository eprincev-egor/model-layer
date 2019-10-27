

const {Model} = require("../../lib/index");
const assert = require("assert");
const {eol} = require("../../lib/utils");

describe("ArrayType", () => {
    
    it("array of numbers", () => {
        class CompanyModel extends Model {
            static data() {
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
                err.message == `invalid array[number] for managersIds: [false],${eol} invalid number for 0: false`
        );
        

        assert.throws(
            () => {
                new CompanyModel({
                    managersIds: ["1", "wrong"]
                });
            }, 
            err => 
                err.message == `invalid array[number] for managersIds: ["1","wrong"],${eol} invalid number for 1: "wrong"`
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
            static data() {
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
            static data() {
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
            static data() {
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
                err.message == `invalid array[boolean] for answers: [1,0,false,true,"wrong"],${eol} invalid boolean for 4: "wrong"`
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
            static data() {
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
                err.message == `invalid array[date] for pays: ["wrong"],${eol} invalid date for 0: "wrong"`
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
            static data() {
                return {
                    name: {
                        type: "string",
                        trim: true
                    }
                };
            }
        }

        class CompanyModel extends Model {
            static data() {
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
                err.message == `invalid array[UserModel] for managers: [false],${eol} invalid UserModel for 0: false`
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
            static data() {
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
                err.message == `invalid array[string] for names: [false],${eol} invalid string for 0: false`
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

    it("array[object]", () => {
        class SomeModel extends Model {
            static data() {
                return {
                    users: ["object"]
                };
            }
        }

        assert.throws(
            () => {
                new SomeModel({
                    users: [{id: 1}, false]
                });
            }, 
            err => 
                err.message == `invalid array[object] for users: [{"id":1},false],${eol} invalid object for 1: false`
        );
        

        let model = new SomeModel({
            users: [{id: 1}]
        });

        let users = model.data.users;
        assert.deepEqual( users, [{id: 1}] );
    });

    it("unique primitive", () => {
        class CompanyModel extends Model {
            static data() {
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
            static data() {
                return {
                    name: "string"
                };
            }
        }

        class CompanyModel extends Model {
            static data() {
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
            static data() {
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
            static data() {
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
            names: ["a3", "d4", "b2", "c1"]
        });

        assert.deepEqual(model.data.names, ["c1", "b2", "a3", "d4"]);
    });

    it("matrix", () => {
        class SomeModel extends Model {
            static data() {
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

    
    it("model.toJSON with array of models", () => {
        class TaskModel extends Model {
            static data() {
                return {
                    name: "string"
                };
            }
        }

        class UserModel extends Model {
            static data() {
                return {
                    name: "string",
                    tasks: [TaskModel]
                };
            }
        }

        let userModel = new UserModel({
            name: "Jack",
            tasks: [
                {name: "task 1"},
                {name: "task 2"}
            ]
        });

        assert.deepEqual(
            userModel.toJSON(),
            {
                name: "Jack",
                tasks: [
                    {name: "task 1"},
                    {name: "task 2"}
                ]
            }
        );
    });

    it("model.clone with array", () => {
        class SomeModel extends Model {
            static data() {
                return {
                    ids: ["number"]
                };
            }
        }

        let model = new SomeModel({
            ids: [1, 2, 3]
        });

        assert.deepEqual(model.data, {
            ids: [1, 2, 3]
        });

        let clone = model.clone();

        assert.ok( clone instanceof SomeModel );
        assert.ok( clone != model );
        assert.ok( clone.data.ids != model.data.ids );

        assert.deepEqual(clone.data, {
            ids: [1, 2, 3]
        });

        // change clone model
        clone.set({
            ids: [3, 4]
        });

        assert.deepEqual(model.data, {
            ids: [1, 2, 3]
        });

        assert.deepEqual(clone.data, {
            ids: [3, 4]
        });

        // change original model
        model.set({
            ids: [8]
        });

        assert.deepEqual(model.data, {
            ids: [8]
        });

        assert.deepEqual(clone.data, {
            ids: [3, 4]
        });
    });

    it("test base validate as prior validation", () => {
        let testArr1 = [1];
        let testArr2 = [2];

        class SomeModel extends Model {
            static data() {
                return {
                    ids: {
                        type: ["number"],
                        unique: true,
                        enum: [testArr1, testArr2]
                    }
                };
            }
        }

        assert.throws(
            () => {
                new SomeModel({
                    ids: [3, 3]
                });
            }, 
            err => 
                err.message ==  "invalid ids: [3,3]"
        );
        
    });

    it("test array of any values", () => {
        class SomeModel extends Model {
            static data() {
                return {
                    arr: []
                };
            }
        }

        let model = new SomeModel({
            arr: [1, "nice"]
        });

        assert.deepEqual(model.data, {
            arr: [1, "nice"]
        });
    });

    it("equal arrays", () => {
        let pairs = [
            [null, null, true],
            [null, [], false],
            [[], [], true],
            [[1,2], [1,2], true],
            [[2,1], [1,2], false],
            [[1], [1,2], false]
        ];

        pairs.forEach(pair => {
            class TestModel extends Model {
                static data() {
                    return {
                        arr: ["number"]
                    };
                }
            }

            let model1 = new TestModel({
                arr: pair[0]
            });

            let model2 = new TestModel({
                arr: pair[1]
            });

            assert.strictEqual(
                model1.equal( model2 ),
                pair[2],
                pair
            );

            assert.strictEqual(
                model2.equal( model1 ),
                pair[2],
                pair
            );
        });
    });

    it("equal circular arrays", () => {
        let circular1 = [];
        circular1[0] = circular1;

        let circular2 = [];
        circular2[0] = circular2;

        let circular3 = [];
        circular3[0] = circular3;
        circular3[1] = [];

        let circular4 = [circular2, circular2];

        let pairs = [
            [circular1, circular1, true],
            [circular1, circular2, true],
            [circular2, circular2, true],
            [circular1, circular3, false],
            [circular2, circular3, false],
            [circular2, circular4, false],
            [circular4, circular4, true]
        ];

        pairs.forEach(pair => {
            class TestModel extends Model {
                static data() {
                    return {
                        arr: [[]]
                    };
                }
            }

            let model1 = new TestModel({
                arr: pair[0]
            });

            let model2 = new TestModel({
                arr: pair[1]
            });

            assert.strictEqual(
                model1.equal( model2 ),
                pair[2],
                pair
            );

            assert.strictEqual(
                model2.equal( model1 ),
                pair[2],
                pair
            );
        });
    });

    
    // when in type defined BaseModel, and in data we have ChildModel (extends BaseModel), 
    // then clone should be instance of ChildModel
    it("clone array of models, should return array of instance of Child", () => {

        class FirstLevel extends Model {}

        class SecondLevel extends FirstLevel {
            static data() {
                return {
                    level: {
                        type: "number",
                        default: 2
                    }
                };
            }
        }

        class MainModel extends Model {
            static data() {
                return {
                    arr: [FirstLevel]
                };
            }
        }

        let second = new SecondLevel();
        let main = new MainModel({
            arr: [second]
        });

        assert.deepEqual(
            main.toJSON(),
            {
                arr: [{
                    level: 2
                }]
            }
        );

        let clone = main.clone();

        assert.ok( clone.get("arr")[0] instanceof SecondLevel );

    });

});
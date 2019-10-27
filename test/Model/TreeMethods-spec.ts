

const {Model} = require("../../lib/index");
const assert = require("assert");

describe("TreeMethods, walk by children or parents", () => {
    
    it("BinaryTree", () => {
        class BinaryTreeModel extends Model {
            static data() {
                return {
                    left: BinaryTreeModel,
                    right: BinaryTreeModel,
                    id: "number",
                    name: "string"
                };
            }

            findName(id) {
                if ( id == this.get("id") ) {
                    return this.get("name");
                }

                if ( id > this.get("id") ) {
                    let right = this.get("right");
                    if ( right ) {
                        return right.findName(id);
                    }
                }
                else {
                    let left = this.get("left");
                    if ( left ) {
                        return left.findName(id);
                    }
                }

                return null;
            }
        }
        
        let binaryTreeModel = new BinaryTreeModel({
            id: 4,
            name: "Bob",
            left: {
                id: 2,
                name: "Jack",
                left: {
                    name: "Oscar",
                    id: 1
                },
                right: {
                    name: "Leo",
                    id: 3
                }
            },
            right: {
                id: 5,
                name: "Harry",
                right: {
                    name: "Oliver",
                    id: 7
                }
            }
        });

        assert.strictEqual( binaryTreeModel.findName(1), "Oscar" );
        assert.strictEqual( binaryTreeModel.findName(2), "Jack" );
        assert.strictEqual( binaryTreeModel.findName(3), "Leo" );
        assert.strictEqual( binaryTreeModel.findName(4), "Bob" );
        assert.strictEqual( binaryTreeModel.findName(5), "Harry" );
        assert.strictEqual( binaryTreeModel.findName(6), null );
        assert.strictEqual( binaryTreeModel.findName(7), "Oliver" );
        assert.strictEqual( binaryTreeModel.findName(8), null );

        // test native method walk
        let nameById = {};
        nameById[ binaryTreeModel.get("id") ] = binaryTreeModel.get("name");

        binaryTreeModel.walk((model) => {
            let id = model.get("id");
            let name = model.get("name");

            nameById[ id ] = name;
        });

        assert.deepEqual({
            1: "Oscar",
            2: "Jack",
            3: "Leo",
            4: "Bob",
            5: "Harry",
            7: "Oliver"
        }, nameById);



        let counter = 0;
        binaryTreeModel.walk((model, walker) => {
            counter++;
            walker.exit();
        });

        assert.equal(counter, 1);

        let ids = [];
        binaryTreeModel.walk((model, walker) => {
            ids.push(
                model.get("id")
            );

            if ( model.get("id") == 5 ) {
                walker.continue();
            }
        });
        ids.sort();

        assert.deepEqual(ids, [1, 2, 3, 5]);
    });

    it("walker.skip(), skip one element", () => {
        class SomeModel extends Model {
            static data() {
                return {
                    a: SomeModel,
                    b: SomeModel,
                    c: SomeModel,

                    value: "string"
                };
            }
        }

        let model = new SomeModel({
            a: {
                a: {
                    value: "a.a"
                },
                value: "a"
            },
            b: {
                b: {
                    value: "b.b"
                },
                value: "b"
            },
            c: {
                c: {
                    value: "c.c"
                },
                value: "c"
            }
        });

        let values = [];
        model.walk((model, walker) => {
            let value = model.get("value");

            values.push( value );

            if ( value == "b" ) {
                walker.continue();
            }
        });

        values.sort();
        assert.deepEqual(values, [
            "a",
            "a.a",
            "b",
            "c",
            "c.c"
        ]);
    });

    it("findChild", () => {
        class SomeModel extends Model {
            static data() {
                return {
                    child: SomeModel,
                    level: "number"
                };
            }
        }

        let model = new SomeModel({
            level: 0,
            child: {
                level: 1,
                child: {
                    level: 2,
                    child: {
                        level: 3
                    }
                }
            }
        });

        let counter = 0;
        let lvl2model = model.findChild(model => {
            counter++;
    
            return model.get("level") == 2;
        });
    
        assert.equal( counter, 2 );
        assert.ok( lvl2model );
        assert.equal( lvl2model.get("level"), 2 );
    
    });

    it("filterChildren", () => {
        class SomeModel extends Model {
            static data() {
                return {
                    child: SomeModel,
                    level: "number"
                };
            }
        }

        let model = new SomeModel({
            level: 0,
            child: {
                level: 1,
                child: {
                    level: 2,
                    child: {
                        level: 3,
                        child: {
                            level: 4
                        }
                    }
                }
            }
        });

        let models = model.filterChildren(model =>
            model.get("level") % 2  == 0
        );
    
        assert.equal( models.length, 2 );
        assert.equal( models[0].get("level"), 2 );
        assert.equal( models[1].get("level"), 4 );
    
    });


    it("findParent", () => {
        class SomeModel extends Model {
            static data() {
                return {
                    child: SomeModel,
                    level: "number"
                };
            }
        }

        let model = new SomeModel({
            level: 0,
            child: {
                level: 1,
                child: {
                    level: 2,
                    child: {
                        level: 3,
                        child: {
                            level: 4
                        }
                    }
                }
            }
        });

        let lastModel = model.findChild(model =>
            model.get("level") == 4
        );
    
        assert.equal( lastModel.get("level"), 4 );
        
        let counter = 0;
        let lvl1 = lastModel.findParent(model => {
            counter++;

            return model.get("level") == 1;
        });

        assert.ok( lvl1 );
        assert.equal( lvl1.get("level"), 1 );
        assert.equal( counter, 3 );

    });


    it("filterParents", () => {
        class SomeModel extends Model {
            static data() {
                return {
                    child: SomeModel,
                    level: "number"
                };
            }
        }

        let model = new SomeModel({
            level: 0,
            child: {
                level: 1,
                child: {
                    level: 2,
                    child: {
                        level: 3,
                        child: {
                            level: 4
                        }
                    }
                }
            }
        });

        let lastModel = model.findChild(model =>
            model.get("level") == 4
        );

        let models = lastModel.filterParents(model =>
            model.get("level") % 2  == 1
        );
    
        assert.equal( models.length, 2 );
        assert.equal( models[0].get("level"), 3 );
        assert.equal( models[1].get("level"), 1 );
    
    });

    it("findParentInstance", () => {
        class CModel extends Model {
            static data() {
                return {
                    name: "string"
                };
            }
        }
        class BModel extends Model {
            static data() {
                return {
                    name: "string",
                    child: CModel
                };
            }
        }
        class AModel extends Model {
            static data() {
                return {
                    name: "string",
                    child: BModel
                };
            }
        }

        let model = new AModel({
            name: "a",
            child: {
                name: "b",
                child: {
                    name: "c"
                }
            }
        });

        let cModel = model.findChild(model =>
            model instanceof CModel
        );

        let aModel = cModel.findParentInstance(AModel);
        let bModel = cModel.findParentInstance(BModel);
    
        assert.equal( aModel.get("name"), "a" );
        assert.equal( bModel.get("name"), "b" );
        assert.equal( cModel.get("name"), "c" );
    });



    it("walk by array", () => {
        class JobModel extends Model {
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
                    job: JobModel
                };
            }
        }

        class CompanyModel extends Model {
            static data() {
                return {
                    name: "string",
                    managers: [UserModel]
                };
            }
        }

        class OrderModel extends Model {
            static data() {
                return {
                    client: CompanyModel,
                    partner: CompanyModel
                };
            }
        }

        let partnerCompanyModel = new CompanyModel({
            name: "World Company"
        });

        let orderModel = new OrderModel({
            client: {
                name: "Red Company",
                managers: [
                    {
                        name: "Oliver",
                        job: {
                            name: "Manager"
                        }
                    },
                    {
                        name: "Bob",
                        job: {
                            name: "Director"
                        }
                    }
                ]
            },
            partner: partnerCompanyModel
        });

        let jobModel = orderModel.findChild(model =>
            model instanceof JobModel &&
            model.get("name") == "Director"
        );
        assert.equal( jobModel.get("name"), "Director" );

        let walkByArray = false;
        orderModel.walk(model => {
            if ( model instanceof JobModel ) {
                walkByArray = true;
            }
        });
        assert.equal(walkByArray, true);


        let filterChildrenByArray = false;
        orderModel.filterChildren(model => {
            if ( model instanceof JobModel ) {
                filterChildrenByArray = true;
            }
        });
        assert.equal(filterChildrenByArray, true);
    });


    it("walk by any key and any value", () => {

        class TreeModel extends Model {
            static data() {
                return {
                    "*": "*"
                };
            }
        }

        let lvl4 = new TreeModel({
            lvl: 4
        });

        let lvl3 = new TreeModel({
            lvl: 3,
            children: [lvl4]
        });
        let lvl2 = new TreeModel({
            lvl: 2,
            child: lvl3
        });
        let lvl1 = new TreeModel({
            lvl: 1,
            child: lvl2
        });

        let tmp = [];
        lvl1.walk(model => {
            tmp.push( model.get("lvl") );
        });

        assert.deepEqual( tmp, [2, 3, 4] );
    });

    it("circular walk", () => {
        class TreeModel extends Model {
            static data() {
                return {
                    name: "string",
                    child: TreeModel
                };
            }
        }

        let root = new TreeModel({
            name: "root"
        });
        let child = new TreeModel({
            name: "child",
            child: root
        });
        root.set({
            child
        });

        let tmp = [];
        root.walk(model => {
            let name = model.get("name");
            tmp.push( name );
        });

        assert.deepEqual(tmp, [
            "child",
            "root"
        ]);
    });

    it("circular findParent", () => {
        class TreeModel extends Model {
            static data() {
                return {
                    name: "string",
                    child: TreeModel
                };
            }
        }

        let root = new TreeModel({
            name: "root"
        });
        let child = new TreeModel({
            name: "child",
            child: root
        });
        root.set({
            child
        });

        let tmp = [];
        root.findParent(parentModel => {
            let name = parentModel.get("name");
            tmp.push( name );
        });

        assert.deepEqual(tmp, [
            "child",
            "root"
        ]);
    });
    
});
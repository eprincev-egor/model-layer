
import {Model, Types} from "../../lib/index";
import assert from "assert";

describe("TreeMethods, walk by children or parents", () => {
    
    it("BinaryTree", () => {
        class BinaryTreeModel extends Model<BinaryTreeModel> {
            structure() {
                return {
                    left: BinaryTreeModel,
                    right: BinaryTreeModel,
                    id: Types.Number,
                    name: Types.String
                };
            }

            findName(id): string {
                if ( id === this.get("id") ) {
                    return this.get("name");
                }

                if ( id > this.get("id") ) {
                    const right = this.get("right") as BinaryTreeModel;
                    if ( right ) {
                        return right.findName(id);
                    }
                }
                else {
                    const left = this.get("left") as BinaryTreeModel;
                    if ( left ) {
                        return left.findName(id);
                    }
                }

                return null;
            }
        }
        
        const binaryTreeModel = new BinaryTreeModel({
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
        const nameById = {};
        nameById[ binaryTreeModel.get("id") ] = binaryTreeModel.get("name");

        binaryTreeModel.walk((model: BinaryTreeModel) => {
            const id = model.get("id");
            const name = model.get("name");

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

        const ids = [];
        binaryTreeModel.walk((model: BinaryTreeModel, walker) => {
            ids.push(
                model.get("id")
            );

            if ( model.get("id") === 5 ) {
                walker.continue();
            }
        });
        ids.sort();

        assert.deepEqual(ids, [1, 2, 3, 5]);
    });

    it("walker.skip(), skip one element", () => {

        class SomeModel extends Model<SomeModel> {
            structure() {
                return {
                    a: SomeModel,
                    b: SomeModel,
                    c: SomeModel,

                    value: Types.String
                };
            }
        }

        const model = new SomeModel({
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

        const values = [];
        model.walk((childModel: SomeModel, walker) => {
            const value = childModel.get("value");

            values.push( value );

            if ( value === "b" ) {
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

        class SomeModel extends Model<SomeModel> {
            structure() {
                return {
                    child: SomeModel,
                    level: Types.Number
                };
            }
        }

        const model = new SomeModel({
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
        const lvl2model = model.findChild((childModel: SomeModel) => {
            counter++;
    
            return childModel.get("level") === 2;
        }) as SomeModel;
    
        assert.equal( counter, 2 );
        assert.ok( lvl2model );
        assert.equal( lvl2model.get("level"), 2 );
    
    });

    it("filterChildren", () => {

        class SomeModel extends Model<SomeModel> {
            structure() {
                return {
                    child: SomeModel,
                    level: Types.Number
                };
            }
        }

        const model = new SomeModel({
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

        const models = model.filterChildren((childModel: SomeModel) =>
            childModel.get("level") % 2  === 0
        ) as SomeModel[];
    
        assert.equal( models.length, 2 );
        assert.equal( models[0].get("level"), 2 );
        assert.equal( models[1].get("level"), 4 );
    
    });


    it("findParent", () => {

        class SomeModel extends Model<SomeModel> {
            structure() {
                return {
                    child: SomeModel,
                    level: Types.Number
                };
            }
        }

        const model = new SomeModel({
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

        const lastModel = model.findChild((childModel: SomeModel) =>
            childModel.get("level") === 4
        ) as SomeModel;
    
        assert.equal( lastModel.get("level"), 4 );
        
        let counter = 0;
        const lvl1 = lastModel.findParent((childModel: SomeModel) => {
            counter++;

            return childModel.get("level") === 1;
        }) as SomeModel;

        assert.ok( lvl1 );
        assert.equal( lvl1.get("level"), 1 );
        assert.equal( counter, 3 );

    });


    it("filterParents", () => {

        class SomeModel extends Model<SomeModel> {
            structure() {
                return {
                    child: SomeModel,
                    level: Types.Number
                };
            }
        }

        const model = new SomeModel({
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

        const lastModel = model.findChild((childModel: SomeModel) =>
            childModel.get("level") === 4
        ) as SomeModel;

        const models = lastModel.filterParents((childModel: SomeModel) =>
            childModel.get("level") % 2  === 1
        ) as SomeModel[];
    
        assert.equal( models.length, 2 );
        assert.equal( models[0].get("level"), 3 );
        assert.equal( models[1].get("level"), 1 );
    
    });

    it("findParentInstance", () => {

        class CModel extends Model<CModel> {
            structure() {
                return {
                    name: Types.String
                };
            }
        }

        class BModel extends Model<BModel> {
            structure() {
                return {
                    name: Types.String,
                    child: CModel
                };
            }
        }

        class AModel extends Model<AModel> {
            structure() {
                return {
                    name: Types.String,
                    child: BModel
                };
            }
        }

        const model = new AModel({
            name: "a",
            child: {
                name: "b",
                child: {
                    name: "c"
                }
            }
        });

        const cModel = model.findChild((childModel) =>
            childModel instanceof CModel
        ) as CModel;

        const aModel = cModel.findParentInstance(AModel);
        const bModel = cModel.findParentInstance(BModel);
    
        assert.equal( aModel.get("name"), "a" );
        assert.equal( bModel.get("name"), "b" );
        assert.equal( cModel.get("name"), "c" );
    });



    it("walk by array", () => {
    
        class JobModel extends Model<JobModel> {
            structure() {
                return {
                    name: Types.String
                };
            }
        }
        class UserModel extends Model<UserModel> {
            structure() {
                return {
                    name: Types.String,
                    job: JobModel
                };
            }
        }

        class CompanyModel extends Model<CompanyModel> {
            structure() {
                return {
                    name: Types.String,
                    managers: Types.Array({
                        element: UserModel
                    })
                };
            }
        }

        class OrderModel extends Model<OrderModel> {
            structure() {
                return {
                    client: CompanyModel,
                    partner: CompanyModel
                };
            }
        }

        const partnerCompanyModel = new CompanyModel({
            name: "World Company"
        });

        const orderModel = new OrderModel({
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

        const jobModel = orderModel.findChild((childModel) =>
            childModel instanceof JobModel &&
            childModel.get("name") === "Director"
        ) as JobModel;
        assert.equal( jobModel.get("name"), "Director" );

        let walkByArray = false;
        orderModel.walk((childModel) => {
            if ( childModel instanceof JobModel ) {
                walkByArray = true;
            }
        });
        assert.equal(walkByArray, true);


        let filterChildrenByArray = false;
        orderModel.filterChildren((childModel) => {
            if ( childModel instanceof JobModel ) {
                filterChildrenByArray = true;
                return true;
            }
        });
        assert.equal(filterChildrenByArray, true);
    });

    it("filterChildrenByInstance", () => {

        class FileModel extends Model<FileModel> {
            structure() {
                return {
                    name: Types.String
                };
            }
        }

        class FolderModel extends Model<FolderModel> {
            structure() {
                return {
                    name: Types.String,
                    files: Types.Array({
                        element: FileModel
                    }),
                    folders: Types.Array({
                        element: FolderModel
                    })
                };
            }
        }

        const rootFolder = new FolderModel({
            name: "root",
            files: [
                {name: "root-a"},
                {name: "root-b"}
            ],
            folders: [
                {
                    name: "home",
                    files: [
                        {name: "home-a"},
                        {name: "home-b"}
                    ]
                }
            ]
        });

        const files = rootFolder.filterChildrenByInstance(FileModel);
        const filesNames = files.map((file) => file.get("name"));

        assert.deepStrictEqual(filesNames, [
            "root-a", "root-b", 
            "home-a", "home-b"
        ]);
    });



    it("walk by array", () => {
    
        class JobModel extends Model<JobModel> {
            structure() {
                return {
                    name: Types.String
                };
            }
        }
        class UserModel extends Model<UserModel> {
            structure() {
                return {
                    name: Types.String,
                    job: JobModel
                };
            }
        }

        class CompanyModel extends Model<CompanyModel> {
            structure() {
                return {
                    name: Types.String,
                    managers: Types.Array({
                        element: UserModel
                    })
                };
            }
        }

        class OrderModel extends Model<OrderModel> {
            structure() {
                return {
                    client: CompanyModel,
                    partner: CompanyModel
                };
            }
        }

        const partnerCompanyModel = new CompanyModel({
            name: "World Company"
        });

        const orderModel = new OrderModel({
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

        const jobModel = orderModel.findChild((childModel) =>
            childModel instanceof JobModel &&
            childModel.get("name") === "Director"
        ) as JobModel;
        assert.equal( jobModel.get("name"), "Director" );

        let walkByArray = false;
        orderModel.walk((childModel) => {
            if ( childModel instanceof JobModel ) {
                walkByArray = true;
            }
        });
        assert.equal(walkByArray, true);


        let filterChildrenByArray = false;
        orderModel.filterChildren((childModel) => {
            if ( childModel instanceof JobModel ) {
                filterChildrenByArray = true;
                return true;
            }
        });
        assert.equal(filterChildrenByArray, true);
    });


    it("walk by any key and any value", () => {

        class TreeModel extends Model<TreeModel> {
            structure() {
                return {
                    "*": Types.Any
                };
            }
        }

        const lvl4 = new TreeModel({
            lvl: 4
        });

        const lvl3 = new TreeModel({
            lvl: 3,
            children: [lvl4]
        });
        const lvl2 = new TreeModel({
            lvl: 2,
            child: lvl3
        });
        const lvl1 = new TreeModel({
            lvl: 1,
            child: lvl2
        });

        const tmp = [];
        lvl1.walk((model: TreeModel) => {
            tmp.push( model.get("lvl") );
        });

        assert.deepEqual( tmp, [2, 3, 4] );
    });

    it("circular walk", () => {

        class TreeModel extends Model<TreeModel> {
            structure() {
                return {
                    name: Types.String,
                    child: TreeModel
                };
            }
        }

        const root = new TreeModel({
            name: "root"
        });
        const child = new TreeModel({
            name: "child",
            child: root
        });
        root.set({
            child
        });

        const tmp = [];
        root.walk((model: TreeModel) => {
            const name = model.get("name");
            tmp.push( name );
        });

        assert.deepEqual(tmp, [
            "child",
            "root"
        ]);
    });

    it("circular findParent", () => {

        class TreeModel extends Model<TreeModel> {
            structure() {
                return {
                    name: Types.String,
                    child: TreeModel
                };
            }
        }

        const root = new TreeModel({
            name: "root"
        });
        const child = new TreeModel({
            name: "child",
            child: root
        });
        root.set({
            child
        });

        const tmp = [];
        root.findParent((parentModel: TreeModel) => {
            const name = parentModel.get("name");
            tmp.push( name );
            return false;
        });

        assert.deepEqual(tmp, [
            "child",
            "root"
        ]);
    });
    
});

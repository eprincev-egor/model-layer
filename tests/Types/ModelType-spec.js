"use strict";

const {Model} = require("../../lib/index");
const assert = require("assert");
const {invalidValuesAsString, eol} = require("../../lib/utils");

describe("ModelType", () => {
    
    it("child model", () => {
        class UserModel extends Model {
            static structure() {
                return {
                    name: {
                        type: "string",
                        trim: true,
                        emptyAsNull: true,
                        required: true
                    },
                    phone: {
                        type: "string",
                        validate: /^\+7 \(\d\d\d\) \d\d\d-\d\d-\d\d$/
                    },
                    email: {
                        type: "string",
                        required: true,
                        validate: /^[\w.-]+@[\w.-]+\.\w+$/i
                    },
                    age: {
                        type: "number",
                        required: true,
                        validate: age =>
                            age > 0
                    }
                };
            }
        }

        class RegistrationModel extends Model {
            static structure() {
                return {
                    user: {
                        type: UserModel,
                        required: true
                    },
                    date: {
                        type: "date",
                        required: true
                    }
                };
            }
        }

        assert.throws(
            () => {
                new RegistrationModel({
                    date: Date.now()
                });
            }, 
            err =>
                err.message == "required user"
        );

        assert.throws(
            () => {
                new RegistrationModel({
                    date: Date.now(),
                    user: null
                });
            }, 
            err =>
                err.message == "required user"
        );

        assert.throws(
            () => {
                new RegistrationModel({
                    date: Date.now(),
                    user: []
                });
            }, 
            err =>
                err.message == "invalid UserModel for user: []"
        );

        assert.throws(
            () => {
                new RegistrationModel({
                    date: Date.now(),
                    user: false
                });
            }, 
            err =>
                err.message == "invalid UserModel for user: false"
        );

        assert.throws(
            () => {
                new RegistrationModel({
                    date: Date.now(),
                    user: NaN
                });
            }, 
            err =>
                err.message == "invalid UserModel for user: NaN"
        );

        assert.throws(
            () => {
                new RegistrationModel({
                    date: Date.now(),
                    user: /x/
                });
            }, 
            err =>
                err.message == "invalid UserModel for user: /x/"
        );


        assert.throws(
            () => {
                new RegistrationModel({
                    date: Date.now(),
                    user: {
                        name: "10",
                        age: 101
                    }
                });
            },
            err =>
                err.message == `invalid UserModel for user: {"name":"10","age":101,"email":null},${eol} required email`
        );





        let now = Date.now();
        let registrationModel = new RegistrationModel({
            date: now,
            user: {
                name: "Bob ",
                age: "99",
                email: "x@x.x"
            }
        });

        assert.strictEqual( +registrationModel.data.date, now );
        assert.ok( registrationModel.data.date instanceof Date );

        let user = registrationModel.data.user;
        assert.strictEqual( user.data.name, "Bob" );
        assert.strictEqual( user.data.age, 99 );
        assert.strictEqual( user.data.email, "x@x.x" );
        assert.strictEqual( user.data.phone, null );
    });

    
    it("model.toJSON with custom models", () => {
        class CarModel extends Model {
            static structure() {
                return {
                    id: "number",
                    color: "string"
                };
            }
        }

        class UserModel extends Model {
            static structure() {
                return {
                    name: "string",
                    car: CarModel
                };
            }
        }

        let userModel = new UserModel({
            name: "Jack",
            car: {
                id: "1",
                color: "red"
            }
        });

        assert.deepEqual(
            userModel.toJSON(),
            {
                name: "Jack",
                car: {
                    id: 1,
                    color: "red"
                }
            }
        );
    });
    

    it("equal models", () => {
        class SomeModel extends Model {
            static structure() {
                return {
                    prop: "number"
                };
            }
        }

        let model1 = new SomeModel({
            prop: 1
        });
        let model2 = new SomeModel({
            prop: 1
        });
        let model3 = new SomeModel({
            prop: 3
        });

        let pairs = [
            [null, null, true],
            [null, model1, false],
            [null, model2, false],
            [null, model3, false],
            [model1, model1, true],
            [model1, model2, true],
            [model1, model3, false],
            [model2, model3, false]
        ];

        pairs.forEach(pair => {
            class TestModel extends Model {
                static structure() {
                    return {
                        model: SomeModel
                    };
                }
            }

            let model1 = new TestModel({
                model: pair[0]
            });

            let model2 = new TestModel({
                model: pair[1]
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

    it("equal circular models", () => {
        class SomeModel extends Model {
            static structure() {
                return {
                    name: "string",
                    self: SomeModel
                };
            }
        }

        let circular1 = new SomeModel();
        circular1.set("self", circular1);

        let circular2 = new SomeModel();
        circular2.set("self", circular2);

        let circular3 = new SomeModel({name: "nice"});
        circular3.set("self", circular3);

        let pairs = [
            [circular1, circular1, true],
            [circular1, circular2, true],
            [circular2, circular2, true],
            [circular1, circular3, false],
            [circular2, circular3, false]
        ];

        pairs.forEach((pair, i) => {
            class TestModel extends Model {
                static structure() {
                    return {
                        model: SomeModel
                    };
                }
            }

            let model1 = new TestModel({
                model: pair[0]
            });

            let model2 = new TestModel({
                model: pair[1]
            });

            assert.strictEqual(
                model1.equal( model2 ),
                pair[2],
                i + ": " + invalidValuesAsString(pair)
            );

            assert.strictEqual(
                model2.equal( model1 ),
                pair[2],
                i + ": " + invalidValuesAsString(pair)
            );
        });
    });

    it("BaseModel.or(ChildModel1)", () => {
        class BaseModel extends Model {
            static structure() {
                return {
                    modelName: "string"
                };
            }
        }

        class ChildModel extends BaseModel {
            static structure() {
                return {
                    ...super.structure(),
                    isChild: {
                        type: "boolean",
                        default: true
                    }
                };
            }
        }

        class MainModel extends Model {
            static structure() {
                return {
                    child: BaseModel.or( ChildModel )
                };
            }
        }

        let main = new MainModel({
            child: {
                modelName: "base"
            }
        });

        assert.deepEqual(
            main.toJSON(),
            {
                child: {
                    modelName: "base"
                }
            }
        );

        main.set("child", new ChildModel());

        assert.deepEqual(
            main.toJSON(),
            {
                child: {
                    modelName: null,
                    isChild: true
                }
            }
        );
    });

    it("BaseModel.or(ChildModel) ChildModel should be inherited from BaseModel", () => {
        
        class BaseModel extends Model {}
        class ChildModel extends Model {}

        assert.throws(
            () => {
                BaseModel.or( ChildModel );
            }, 
            err =>
                err.message == "ChildModel should be inherited from BaseModel"
        );
        
    });

    it("BaseModel.or() expected children Models", () => {
        class BaseModel extends Model {}

        assert.throws(
            () => {
                BaseModel.or();
            }, 
            err =>
                err.message == "expected children Models"
        );
        
    });


    it("BaseModel.or(ChildModel1, ChildModel2, ...)", () => {

        class Product extends Model {
            static structure() {
                return {
                    type: "string",
                    price: "number"
                };
            }
        }

        class DressProduct extends Product {
            static structure() {
                return {
                    ...super.structure(),

                    size: "number"
                };
            }
        }

        class FoodProduct extends Product {
            static structure() {
                return {
                    ...super.structure(),

                    color: "string"
                };
            }
        }

        class Cart extends Model {
            static structure() {
                return {
                    products: {
                        type: "array",
                        element: {
                            type: Product.or( DressProduct, FoodProduct ),
                            constructor: data => {
                                if ( data.type == "dress" ) {
                                    return DressProduct;
                                }

                                if ( data.type == "car" ) {
                                    return FoodProduct;
                                }
                            }
                        }
                    }
                };
            }
        }

        let cart = new Cart({
            products: [
                {type: "car", price: 10000, color: "red"},
                {type: "dress", price: 100, size: 34}
            ]
        });

        assert.deepEqual(
            cart.toJSON(),
            {
                products: [
                    {type: "car", price: 10000, color: "red"},
                    {type: "dress", price: 100, size: 34}
                ]
            }
        );
    });

});
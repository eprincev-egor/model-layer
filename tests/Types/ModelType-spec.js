"use strict";

const {Model} = require("../../lib/index");
const assert = require("assert");

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
                err.message == "invalid UserModel for user: {\"name\":\"10\",\"age\":101,\"email\":null},\n required email"
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
	
});
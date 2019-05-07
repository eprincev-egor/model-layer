"use strict";

const Model = require("./Model");
const Collection = require("./Collection");

// register types
require("./type/AnyType");
require("./type/ArrayType");
require("./type/BooleanType");
require("./type/CustomClassType");
require("./type/DateType");
require("./type/ModelType");
require("./type/NumberType");
require("./type/ObjectType");
require("./type/StringType");

module.exports = {
    Model,
    Collection
};
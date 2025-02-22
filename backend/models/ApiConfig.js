const { DataTypes } = require("sequelize");
const sequelize = require("../database");

const ApiConfig = sequelize.define("ApiConfig", {
  operation: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  parameters: {
    type: DataTypes.JSON,
    allowNull: true,
  },
  endpoint: {
    type: DataTypes.STRING,
    allowNull: false,
  },
});

module.exports = ApiConfig;
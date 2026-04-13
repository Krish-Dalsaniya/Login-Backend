const { DataTypes } = require('sequelize');
const sequelize = require('../config/db'); // Use the shared connection

const User = sequelize.define(
  'User',
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    firstName: { type: DataTypes.STRING, allowNull: false },
    middleName: { type: DataTypes.STRING, allowNull: false },
    lastName: { type: DataTypes.STRING, allowNull: false },
    email: {
      type: DataTypes.STRING,
      unique: true,
      allowNull: false,
      validate: { isEmail: true }
    },
    password: { type: DataTypes.STRING, allowNull: false },
    role: {
      type: DataTypes.ENUM('attendant', 'shopmanager', 'accountant', 'manager'),
      defaultValue: 'attendant'
    }
  },
  {
    // --- Options Object ---
    freezeTableName: true, // Now it correctly targets the 'User' table name
    tableName: 'Users'
  }
);

module.exports = User;

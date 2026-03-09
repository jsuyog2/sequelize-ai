/**
 * @file role.model.js
 * @description This file defines the Sequelize model for the Role entity.
 *
 * The Role model is used to represent user roles within the application. It includes attributes for the role name and an optional description.
 *
 * The attributes of the Role model are as follows:
 *
 * - `roleName`: A string indicating the name of the role (e.g., admin, user). This field is required and must be unique.
 * - `description`: A string providing a description of the role. This field is optional.
 *
 * @module models/role
 */

module.exports = (sequelize, Sequelize) => {
  const Role = sequelize.define(
    "Roles",
    {
      // Define the attributes for the Role model
      roleName: {
        type: Sequelize.STRING,
        allowNull: false, // Role name is required
        unique: true, // Ensures that role names are unique
        aiDescription: "Name of role",
      },
      description: {
        type: Sequelize.STRING,
        allowNull: true, // Description is optional
      },
    },
    {
      tableName: "Roles", // The table name will be 'users_table_name'
    },
  );

  return Role;
};

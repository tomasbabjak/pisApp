"use strict";

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use("Schema");

class UserSchema extends Schema {
  up() {
    this.create("users", (table) => {
      table.increments();
      table.string("nickname");
      table.string("email", 254).notNullable().unique();
      table.string("password", 60).notNullable();
      table.integer("user_type").unsigned();
      table.string("type");
      table.timestamps();
    });
  }

  down() {
    this.drop("users");
  }
}

module.exports = UserSchema;

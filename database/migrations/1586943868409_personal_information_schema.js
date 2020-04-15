"use strict";

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use("Schema");

class PersonalInformationSchema extends Schema {
  up() {
    this.create("personal_informations", (table) => {
      table.increments();
      table.string("fname");
      table.string("lname");
      table.string("email");
      table.string("phone");
      table.string("address");
      table.timestamps();
    });
  }

  down() {
    this.drop("personal_informations");
  }
}

module.exports = PersonalInformationSchema;

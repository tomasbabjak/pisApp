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
      table.string("company");
      table.string("phone");
      table.string("kraj");
      table.string("street");
      table.string("number");
      table.string("city");
      table.string("zip");
      table.timestamps();
    });
  }

  down() {
    this.drop("personal_informations");
  }
}

module.exports = PersonalInformationSchema;

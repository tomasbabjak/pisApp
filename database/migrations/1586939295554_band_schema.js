"use strict";

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use("Schema");

class BandSchema extends Schema {
  up() {
    this.create("bands", (table) => {
      table.increments();
      table.string("name");
      table.datetime("origin_year");
      table.json("genres");
      table.string("web_page");
      table.json("albums");
      table.text("informations");
      table.json("posters");
      table.timestamps();
    });
  }

  down() {
    this.drop("bands");
  }
}

module.exports = BandSchema;

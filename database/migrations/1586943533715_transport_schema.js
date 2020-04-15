"use strict";

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use("Schema");

class TransportSchema extends Schema {
  up() {
    this.create("transports", (table) => {
      table.increments();
      table.string("type");
      table.decimal("price");
      table.timestamps();
    });
  }

  down() {
    this.drop("transports");
  }
}

module.exports = TransportSchema;

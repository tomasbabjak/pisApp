"use strict";

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use("Schema");

class ForeignCurrencySchema extends Schema {
  up() {
    this.create("foreign_currencies", (table) => {
      table.increments();
      table.string("currency");
      table.decimal("prev_price");
      table.decimal("price");
      table.timestamps();
    });
  }

  down() {
    this.drop("foreign_currencies");
  }
}

module.exports = ForeignCurrencySchema;

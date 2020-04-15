"use strict";

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use("Schema");

class SeatSchema extends Schema {
  up() {
    this.create("seats", (table) => {
      table.increments();
      table.string("category");
      table.string("sector");
      table.decimal("price");
      table.string("number");
      table.string("row");
      table.integer("sale_id").unsigned();
      table.foreign("sale_id").references("id").inTable("sales");
      table.integer("discount_id").unsigned().nullable();
      table.foreign("discount_id").references("id").inTable("discounts");
      table.timestamps();
    });
  }

  down() {
    this.drop("seats");
  }
}

module.exports = SeatSchema;

"use strict";

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use("Schema");

class DiscountSchema extends Schema {
  up() {
    this.create("discounts", (table) => {
      table.increments();
      table.string("name");
      table.boolean("percentual");
      table.decimal("amount");
      table.integer("ticket_type_id").unsigned().nullable();
      table.foreign("ticket_type_id").references("id").inTable("ticket_types");
      table.timestamps();
    });
  }

  down() {
    this.drop("discounts");
  }
}

module.exports = DiscountSchema;

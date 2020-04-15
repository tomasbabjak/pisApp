"use strict";

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use("Schema");

class TicketTypeSchema extends Schema {
  up() {
    this.create("ticket_types", (table) => {
      table.increments();
      table.string("category");
      table.string("sector");
      table.decimal("price");
      table.integer("available");
      table.json("array_seats");
      table.integer("event_id").unsigned();
      table.foreign("event_id").references("id").inTable("events");
      table.integer("discount");
      table.timestamps();
    });
  }

  down() {
    this.drop("ticket_types");
  }
}

module.exports = TicketTypeSchema;

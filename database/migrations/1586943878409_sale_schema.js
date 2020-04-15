"use strict";

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use("Schema");

class SaleSchema extends Schema {
  up() {
    this.create("sales", (table) => {
      table.increments();
      table.integer("zakaznik_id").unsigned();
      table.integer("event_id").unsigned();
      table.foreign("event_id").references("id").inTable("events");
      table.integer("ticket_count");
      table.decimal("ticket_price");
      table.decimal("transport_price");
      table.integer("personal_id").unsigned();
      table
        .foreign("personal_id")
        .references("id")
        .inTable("personal_informations");
      table.boolean("new_cutomer");
      table.integer("payment_id").unsigned();
      table.foreign("payment_id").references("id").inTable("payments");
      table.integer("transport_id").unsigned();
      table.foreign("transport_id").references("id").inTable("transports");
      table.integer("f_currency_id").unsigned();
      table
        .foreign("f_currency_id")
        .references("id")
        .inTable("foreign_currencies");
      table.string("state");
      table.timestamps();
    });
  }

  down() {
    this.drop("sales");
  }
}

module.exports = SaleSchema;

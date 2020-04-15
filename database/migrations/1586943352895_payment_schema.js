"use strict";

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use("Schema");

class PaymentSchema extends Schema {
  up() {
    this.create("payments", (table) => {
      table.increments();
      table.string("type");
      table.decimal("price");
      table.timestamps();
    });
  }

  down() {
    this.drop("payments");
  }
}

module.exports = PaymentSchema;

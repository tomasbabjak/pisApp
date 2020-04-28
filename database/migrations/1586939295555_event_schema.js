"use strict";

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use("Schema");

class EventSchema extends Schema {
  up() {
    this.create("events", (table) => {
      table.increments();
      table.integer("usporiadatel").references("id").inTable("users");
      table.text("title");
      table.string("type");
      table.json("genres");
      table.datetime("date");
      table.text("place");
      table.boolean("paid");
      table.string("state");
      table.timestamps();
    });
  }

  down() {
    this.drop("events");
  }
}

module.exports = EventSchema;

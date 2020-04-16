"use strict";

/** @type {typeof import('@adonisjs/lucid/src/Lucid/Model')} */
const Model = use("Model");

class Event extends Model {
  sales() {
    return this.hasMany("App/Models/Sale");
  }
  ticketTypes() {
    return this.hasMany("App/Models/TicketType");
  }
}

module.exports = Event;
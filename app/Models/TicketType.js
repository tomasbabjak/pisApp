"use strict";

/** @type {typeof import('@adonisjs/lucid/src/Lucid/Model')} */
const Model = use("Model");

class TicketType extends Model {
  event() {
    this.belongsTo("App/Models/Event");
  }
}

module.exports = TicketType;

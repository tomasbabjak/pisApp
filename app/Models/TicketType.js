"use strict";

/** @type {typeof import('@adonisjs/lucid/src/Lucid/Model')} */
const Model = use("Model");

class TicketType extends Model {
  event() {
    return this.belongsTo("App/Models/Event");
  }

  discounts() {
    return this.hasMany("App/Models/Discount");
  }
}

module.exports = TicketType;

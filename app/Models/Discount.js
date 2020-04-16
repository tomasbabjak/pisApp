"use strict";

/** @type {typeof import('@adonisjs/lucid/src/Lucid/Model')} */
const Model = use("Model");

class Discount extends Model {
  seat() {
    return this.hasOne("App/Models/Seat");
  }
  ticket() {
    return this.belongsTo("App/Models/TicketType");
  }
}

module.exports = Discount;

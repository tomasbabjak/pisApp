"use strict";

/** @type {typeof import('@adonisjs/lucid/src/Lucid/Model')} */
const Model = use("Model");

class Seat extends Model {
  sale() {
    return this.belongsTo("App/Models/Sale");
  }
}

module.exports = Seat;

"use strict";

/** @type {typeof import('@adonisjs/lucid/src/Lucid/Model')} */
const Model = use("Model");

class Transport extends Model {
  sale() {
    return this.hasOne("App/Models/Sale");
  }
}

module.exports = Transport;

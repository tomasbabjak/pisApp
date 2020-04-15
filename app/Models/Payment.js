"use strict";

/** @type {typeof import('@adonisjs/lucid/src/Lucid/Model')} */
const Model = use("Model");

class Payment extends Model {
  sale() {
    return this.hasOne("App/Models/Sale");
  }
}

module.exports = Payment;

"use strict";

/** @type {typeof import('@adonisjs/lucid/src/Lucid/Model')} */
const Model = use("Model");

class Sale extends Model {
  seat() {
    return this.hasMany("App/Models/Seat");
  }

  event() {
    return this.belongsTo("App/Models/Event");
  }

  payment() {
    return this.belongsTo("App/Models/Payment");
  }

  transport() {
    return this.belongsTo("App/Models/Transport");
  }

  personal() {
    return this.belongsTo("App/Models/PersonalInformation");
  }

  fCurrency() {
    return this.belongsTo("App/Models/ForeignCurrency");
  }
}

module.exports = Sale;

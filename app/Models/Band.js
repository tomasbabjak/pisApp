"use strict";

/** @type {typeof import('@adonisjs/lucid/src/Lucid/Model')} */
const Model = use("Model");

class Band extends Model {
  sale() {
    return this.hasMany("App/Models/Event");
  }
}

module.exports = Band;

"use strict";

/*
|--------------------------------------------------------------------------
| DatabaseSeeder
|--------------------------------------------------------------------------
|
| Make use of the Factory instance to seed database with dummy data or
| make use of Lucid models directly.
|
*/

/** @type {import('@adonisjs/lucid/src/Factory')} */
const Factory = use("Factory");
const Payment = use("App/Models/Payment");
const Transport = use("App/Models/Transport");
class DatabaseSeeder {
  async run() {
    Payment.create({
      type: "Card",
      price: 0,
    });
    Payment.create({
      type: "Bank Transfer",
      price: 1,
    });
    Payment.create({
      type: "Paypall",
      price: 0.5,
    });
    Transport.create({
      type: "Email",
      price: 0,
    });
    Transport.create({
      type: "Post",
      price: null,
    });
  }
}

module.exports = DatabaseSeeder;

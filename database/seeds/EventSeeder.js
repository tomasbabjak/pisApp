"use strict";

/*
|--------------------------------------------------------------------------
| EventSeeder
|--------------------------------------------------------------------------
|
| Make use of the Factory instance to seed database with dummy data or
| make use of Lucid models directly.
|
*/

/** @type {import('@adonisjs/lucid/src/Factory')} */
const Factory = use("Factory");
const Database = use("Database");

class EventSeeder {
  async run() {
    const event = await Factory.model("App/Models/Event").create();
    const ticketarray = await Factory.model("App/Models/TicketType").createMany(
      10
    );
    console.log(event.id);

    for await (let ticket of ticketarray) {
      ticket.event_id = event.id;
      await ticket.save();
    }
  }
}

module.exports = EventSeeder;

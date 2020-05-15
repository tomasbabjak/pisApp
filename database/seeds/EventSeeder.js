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
const Event = use("App/Models/Event");

class EventSeeder {
  async run() {
    const band = await Factory.model("App/Models/Band").create();
    const event = new Event();
    event.title = "The Lonely Corona Tour";
    event.type = "concert";
    event.usporiadatel = 1;
    event.genres = JSON.stringify(["All"]);
    event.date = new Date("04/20/2021/16:20:00");
    event.place = "Nakatomi Plaza, Los Angeles";
    event.paid = true;
    event.state = "inprogress";
    await event.save();
    const ticketarray = await Factory.model("App/Models/TicketType").createMany(
      10
    );
    console.log(event.id);

    for await (let ticket of ticketarray) {
      const discount = await Factory.model("App/Models/Discount").create();
      discount.ticket_type_id = ticket.id;
      await discount.save();
      ticket.event_id = event.id;
      await ticket.save();
    }
    for await (let item of new Array(5)) {
      const event = await Factory.model("App/Models/Event").create();
      const ticketarray = await Factory.model(
        "App/Models/TicketType"
      ).createMany(10);
      console.log(event.id);

      for await (let ticket of ticketarray) {
        const discount = await Factory.model("App/Models/Discount").create();
        discount.ticket_type_id = ticket.id;
        await discount.save();
        ticket.event_id = event.id;
        await ticket.save();
      }
    }
  }
}

module.exports = EventSeeder;

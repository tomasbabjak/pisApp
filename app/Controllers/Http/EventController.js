"use strict";

const Event = use("App/Models/Event");

const Database = use("Database");

class EventController {
  async show({ view, request, response, params }) {
    const event_id = params.id;

    const eve = await Event.find(event_id);
    console.log(eve);
    const tickets = await eve.ticketTypes().fetch();
    console.log(tickets);

    //return eve;

    return view.render("order.selectticket", {
      event: eve.toJSON(),
      tickets: tickets.toJSON(),
      array6: [...Array(6)],
    });
  }
}

module.exports = EventController;

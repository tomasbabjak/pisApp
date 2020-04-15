"use strict";

const Event = use("App/Models/Event");

const TicketType = use("App/Models/TicketType");

const Database = use("Database");

class SaleController {
  async index({ view, request, response, params }) {
    const query = request.only(["ticketid"]);
    //console.log(ticket_id);
    const ticket = await TicketType.find(query.ticketid);
    return ticket;
  }
}

module.exports = SaleController;

"use strict";

const Event = use("App/Models/Event");
const Seat = use("App/Models/Seat");
const Discount = use("App/Models/Discount");

const TicketType = use("App/Models/TicketType");

const Database = use("Database");

class SaleController {
  async index({ view, request, session, response }) {
    if (!session.get("seats")) {
      const query = request.only(["ticketid", "ticket_quantity"]);
      const ticket = await TicketType.find(query.ticketid);
      const eve = await Event.find(ticket.event_id);
      const disc = await ticket.discounts().fetch();

      let seats = [];
      for (let i = 0; i < query["ticket_quantity"]; i++) {
        const newseat = new Seat();
        newseat.category = ticket.category;
        newseat.sector = ticket.sector;
        newseat.price = ticket.price;
        newseat.tempID = i;
        newseat.discountName = "No Discount";
        seats.push(newseat);
      }

      //console.log(seats);

      session.put("seats", seats);
      session.put("ticket", ticket.toJSON());
      session.put("event", eve.toJSON());

      return view.render("order.firststep", {
        seats: seats,
        discounts: disc.toJSON(),
        event: eve.toJSON(),
        quantity: seats.length,
        sector: ticket.sector,
        category: ticket.category,
        total_price: 200,
      });
    } else {
      const seats = session.get("seats");
      const ticket = session.get("ticket");
      const eve = session.get("event");

      const query = request.only(["discount", "seat_num"]);

      let modseat = seats[query.seat_num];

      console.log(ticket.id);

      const disc = await Discount.query()
        .where("ticket_type_id", ticket.id)
        .fetch();

      if (query.discount && query.discount != "null") {
        const discount = await Discount.find(query.discount);

        modseat.discount_id = discount.id;
        modseat.discountName = discount.name;
        if (discount.percentual) {
          modseat.price = ((1 - discount.amount / 100) * ticket.price).toFixed(
            2
          );
        } else {
          modseat.price = ticket.price - discount.amount;
        }
      } else {
        modseat.price = ticket.price;
        modseat.discountName = "No Discount";
      }

      const totalPrice = await seats.reduce((acc, curr) => {
        return acc + +curr.price;
      }, 0);

      return view.render("order.firststep", {
        seats: seats,
        discounts: disc.toJSON(),
        event: eve,
        quantity: seats.length,
        sector: ticket.sector,
        category: ticket.category,
        total_price: totalPrice.toFixed(2),
      });
    }
  }
}

module.exports = SaleController;

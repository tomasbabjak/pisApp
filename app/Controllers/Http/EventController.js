"use strict";

const Event = use("App/Models/Event");

const Database = use("Database");

const dateOptions = {
  weekday: "long",
  year: "numeric",
  month: "long",
  day: "numeric",
  hour: "numeric",
  minute: "numeric",
};

function getLocalDate(date) {
  return new Date(date).toLocaleDateString("en-EN", dateOptions);
}

class EventController {
  async show({ view, request, response, params }) {
    const event_id = params.id;

    const { sort, quantity, category, min_price, max_price } = request.all();

    const eve = await Event.find(event_id);
    let tickets = await eve.ticketTypes().fetch();
    tickets = tickets.toJSON();
    tickets = tickets.filter((x) => x.available > 0);

    let categories = [...new Set(tickets.map((x) => x.category))];

    let prices = tickets.map((x) => x.price);

    let min = Math.min.apply(Math, prices);
    let max = Math.max.apply(Math, prices);

    let ttt = eve.ticketTypes().where("available", ">", 0);

    if (quantity > 1) {
      ttt = ttt.where("available", ">", quantity - 1);
    }

    if (category && category !== "0") {
      ttt = ttt.where("category", category);
    }

    if (min_price && min_price != min) {
      ttt = ttt.where("price", ">", min_price);
    }

    if (max_price && max_price != max) {
      ttt = ttt.where("price", "<", max_price);
    }

    if (sort && sort === "low") {
      ttt = ttt.orderBy("price", "asc");
    } else if (sort && sort === "high") {
      ttt = ttt.orderBy("price", "desc");
    }

    ttt = await ttt.fetch();

    console.log(ttt);

    //return eve;

    return view.render("order.selectticket", {
      event: eve.toJSON(),
      date: getLocalDate(eve.date),
      tickets: ttt.toJSON(),
      array6: [...Array(6)],
      categories: categories,
      minPrice: min,
      maxPrice: max,
    });
  }
}

module.exports = EventController;

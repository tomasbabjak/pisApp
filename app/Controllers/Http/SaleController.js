"use strict";

const Event = use("App/Models/Event");
const Seat = use("App/Models/Seat");
const Discount = use("App/Models/Discount");
const User = use("App/Models/User");
const PersonalInformation = use("App/Models/PersonalInformation");
const request = require("request");
const parser = require("xml2js").parseStringPromise;
const soapRequest = require("easy-soap-request");

const TicketType = use("App/Models/TicketType");

const Database = use("Database");

async function getRegions() {
  const xmlData =
    '<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:typ="http://pis.predmety.fiit.stuba.sk/pis/students/team084region/types">\n   <soapenv:Header/>\n   <soapenv:Body>\n      <typ:getAll/>\n   </soapenv:Body>\n</soapenv:Envelope>';

  const { response } = await soapRequest({
    url: "http://pis.predmety.fiit.stuba.sk/pis/ws/Students/Team084region",
    xml: xmlData,
    headers: {
      "Content-Type": "application/xml",
    },
  });
  const { body } = response;

  return parser(body)
    .then((data) => {
      let parsedData = JSON.parse(JSON.stringify(data));
      let regions =
        parsedData["SOAP-ENV:Envelope"]["SOAP-ENV:Body"][0][
          "ns1:getAllResponse"
        ][0]["regions"][0]["region"];
      //console.log(JSON.parse(JSON.stringify(regions)));
      regions = regions.map((item) => item.name[0]);
      return regions;
    })
    .catch((err) => console.log(err));

  // return parser(body, (err, result) => {
  //   let data = JSON.parse(JSON.stringify(result));
  //   let regions =
  //     data["SOAP-ENV:Envelope"]["SOAP-ENV:Body"][0]["ns1:getAllResponse"][0][
  //       "regions"
  //     ][0]["region"];

  //   //console.log(JSON.parse(JSON.stringify(regions)));

  //   regions = regions.map((item) => item.name[0]);
  //   return regions;
  // });
}

class SaleController {
  async index({ view, request, session, response }) {
    const query = request.only([
      "ticketid",
      "ticket_quantity",
      "discount",
      "seat_num",
    ]);

    if (!session.get("seats") || !query.seat_num) {
      //const query = request.only(["ticketid", "ticket_quantity"]);
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

      //const query = request.only(["discount", "seat_num"]);

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

  async user({ view, request, response, session }) {
    const seats = session.get("seats");
    const ticket = session.get("ticket");
    const eve = session.get("event");

    if (!seats) {
      response.status(405).send("Error 405 Select seats first");
    } else {
      // return seats;

      const totalPrice = await seats
        .reduce((acc, curr) => {
          return acc + +curr.price;
        }, 0)
        .toFixed(2);

      return view.render("order.secstep", {
        event: eve,
        quantity: seats.length,
        sector: ticket.sector,
        category: ticket.category,
        total_price: totalPrice,
      });
    }
  }

  async loginCreate({ view, request, response, session, auth }) {
    const { email, password, newOrCreate } = request.all();

    console.log(newOrCreate, email, password);

    if (newOrCreate == 2) {
      console.log(2);
      try {
        const user = await auth.attempt(email, password);
        response.redirect("back");
        return user;
      } catch (err) {
        console.log(err);
        return err;
      }
    } else if (newOrCreate == 1) {
      const user = new User();
      user.email = email;
      user.password = password;
      session.put("newUser", user.toJSON());

      return response.route("orderPersonal");
    }
  }

  async personaldata({ view, request, response, session, auth }) {
    const seats = session.get("seats");
    const ticket = session.get("ticket");
    const eve = session.get("event");
    const newUser = session.get("newUser");

    if (!seats || (!auth.user && !newUser) || !newUser) {
      response.status(405).send("Error 405 Select seats first");
    } else {
      const regions = await getRegions();

      console.log(regions);

      const totalPrice = await seats
        .reduce((acc, curr) => {
          return acc + +curr.price;
        }, 0)
        .toFixed(2);

      return view.render("order.thstep", {
        event: eve,
        quantity: seats.length,
        regions: regions,
        sector: ticket.sector,
        category: ticket.category,
        total_price: totalPrice,
      });
    }
  }

  async billing({ auth, view, request, response, session }) {
    const {
      fname,
      lname,
      company,
      phone,
      street,
      number,
      city,
      kraj,
      zip,
    } = request.all();

    const userEmail = auth.user
      ? auth.user.email
      : session.get("newUser").email;
    console.log(userEmail);

    const personal = new PersonalInformation();
    personal.fname = fname;
    personal.lname = lname;
    personal.enail = userEmail;
    personal.company = company;
    personal.phone = phone;
    personal.kraj = kraj;
    personal.street = street;
    personal.number = number;
    personal.city = city;
    personal.zip = zip;

    session.put("personal", personal.toJSON());

    return response.route("transportPay");
  }

  async getTransportPay({ auth, view, request, response, session }) {
    const seats = session.get("seats");
    const ticket = session.get("ticket");
    const eve = session.get("event");
    const newUser = session.get("newUser");
    const personal = session.get("personal");
    console.log(seats, auth.user, newUser, personal);

    if (!seats || (!auth.user && !newUser) || !personal) {
      response.status(405).send("Error 405 Select seats first");
    } else {
      const totalPrice = await seats
        .reduce((acc, curr) => {
          return acc + +curr.price;
        }, 0)
        .toFixed(2);

      return view.render("order.quatrostep", {
        event: eve,
        quantity: seats.length,
        sector: ticket.sector,
        category: ticket.category,
        total_price: totalPrice,
      });
    }
  }
}

module.exports = SaleController;

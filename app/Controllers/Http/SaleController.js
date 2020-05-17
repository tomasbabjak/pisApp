"use strict";
const { validate } = use("Validator");
const Event = use("App/Models/Event");
const Sale = use("App/Models/Sale");
const Seat = use("App/Models/Seat");
const Customer = use("App/Models/Customer");
const Discount = use("App/Models/Discount");
const User = use("App/Models/User");
const PersonalInformation = use("App/Models/PersonalInformation");
const Payment = use("App/Models/Payment");
const Transport = use("App/Models/Transport");
const parser = require("xml2js").parseStringPromise;
const soapRequest = require("easy-soap-request");

const TicketType = use("App/Models/TicketType");

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
}

async function getPostPrice(zip) {
  const distance = await getDistance(zip); // zistene, ze nefunguje korektne
  console.log(+distance / 100);
  const xmlData = `<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:typ="http://pis.predmety.fiit.stuba.sk/pis/transportservices/post/types">
  <soapenv:Header/>
  <soapenv:Body>
     <typ:priceForPackageDelivery>
        <distance>${+distance / 100}</distance>
        <weight>1</weight>
        <width>0.22</width>
        <height>0.11</height>
        <depth>0.22</depth>
        <max_days>1</max_days>
     </typ:priceForPackageDelivery>
  </soapenv:Body>
</soapenv:Envelope>`;

  const { response } = await soapRequest({
    url: "http://pis.predmety.fiit.stuba.sk/pis/ws/TransportServices/Post",
    xml: xmlData,
    headers: {
      "Content-Type": "application/xml",
    },
  });
  const { body } = response;

  return parser(body)
    .then((data) => {
      let parsedData = JSON.parse(JSON.stringify(data));
      let price =
        parsedData["SOAP-ENV:Envelope"]["SOAP-ENV:Body"][0][
          "ns1:priceForPackageDeliveryResponse"
        ][0]["price"][0];
      return (parseFloat(price) * 10).toFixed(2);
    })
    .catch((err) => console.log(err));
}

async function getDistance(zip) {
  const xmlData = `<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:typ="http://pis.predmety.fiit.stuba.sk/pis/geoservices/locations/types">
  <soapenv:Header/>
  <soapenv:Body>
     <typ:distanceByZIP>
        <zip_from>07501</zip_from>
        <zip_to>${zip}</zip_to>
     </typ:distanceByZIP>
  </soapenv:Body>
</soapenv:Envelope>`;

  const { response } = await soapRequest({
    url: "http://pis.predmety.fiit.stuba.sk/pis/ws/GeoServices/Locations",
    xml: xmlData,
    headers: {
      "Content-Type": "application/xml",
    },
  });
  const { body } = response;

  return parser(body)
    .then((data) => {
      let parsedData = JSON.parse(JSON.stringify(data));
      let distance =
        parsedData["SOAP-ENV:Envelope"]["SOAP-ENV:Body"][0][
          "ns1:distanceByZIPResponse"
        ][0]["distance"][0];
      return distance;
    })
    .catch((err) => console.log(err));
}

async function getFCurrency(curr, amount) {
  const xmlData = `<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:typ="http://pis.predmety.fiit.stuba.sk/pis/currencyconvertor/types">
  <soapenv:Header/>
  <soapenv:Body>
     <typ:convert>
        <currency_from>eur</currency_from>
        <currency_to>${curr}</currency_to>
        <amount>${amount}</amount>
        <precision>2</precision>
     </typ:convert>
  </soapenv:Body>
</soapenv:Envelope>`;

  const { response } = await soapRequest({
    url: "http://pis.predmety.fiit.stuba.sk/pis/ws/CurrencyConvertor",
    xml: xmlData,
    headers: {
      "Content-Type": "application/xml",
    },
  });
  const { body } = response;

  return parser(body)
    .then((data) => {
      let parsedData = JSON.parse(JSON.stringify(data));
      let price =
        parsedData["SOAP-ENV:Envelope"]["SOAP-ENV:Body"][0][
          "ns1:convertResponse"
        ][0]["value"][0];
      return price;
    })
    .catch((err) => console.log(err));
}

async function sendEmail(email, name, id) {
  const xmlData = `<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:typ="http://pis.predmety.fiit.stuba.sk/pis/notificationservices/email/types">
  <soapenv:Header/>
  <soapenv:Body>
     <typ:notify>
        <team_id>084</team_id>
        <password>QLL9TL</password>
        <address>${email}</address>
        <subject>Hudobny portal - listky</subject>
        <message>Važený zákazník, ${name}, vasu objednávku sme zaevidovali do systému pod číslo ${id}. V prídape problémov alebo pochybností nás neváhajte kontaktovať.</message>
     </typ:notify>
  </soapenv:Body>
</soapenv:Envelope>`;

  const { response } = await soapRequest({
    url: "http://pis.predmety.fiit.stuba.sk/pis/ws/NotificationServices/Email",
    xml: xmlData,
    headers: {
      "Content-Type": "application/xml",
    },
  });
  const { body } = response;
}

class SaleController {
  async index({ view, request, session, response }) {
    const query = request.only([
      "ticketid",
      "ticket_quantity",
      "discount",
      "seat_num",
    ]);

    if (!session.get("cart") || !query.seat_num) {
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

      // session.put("seats", seats);
      // session.put("ticket", ticket.toJSON());
      // session.put("event", eve.toJSON());

      session.put("cart", {
        seats: seats,
        ticket: ticket.toJSON(),
        event: eve.toJSON(),
      });

      const totalPrice = await seats.reduce((acc, curr) => {
        return acc + +curr.price;
      }, 0);

      return response.route("getCart");
    } else {
      const cart = session.get("cart");
      const seats = cart.seats;
      const ticket = cart.ticket;
      const eve = cart.event;

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
        modseat.discount_id = null;
      }

      // session.put("seats", seats);

      session.put("cart", {
        seats: seats,
        ticket: ticket,
        event: eve,
      });

      const totalPrice = await seats.reduce((acc, curr) => {
        return acc + +curr.price;
      }, 0);

      return response.route("getCart");
    }
  }

  async cart({ view, request, response, session }) {
    const cart = session.get("cart");

    if (!cart) {
      return view.render("order.emptycart");
    } else {
      const seats = cart.seats;
      const ticket = cart.ticket;
      const eve = cart.event;

      const disc = await Discount.query()
        .where("ticket_type_id", ticket.id)
        .fetch();

      const totalPrice = await seats.reduce((acc, curr) => {
        return acc + +curr.price;
      }, 0);

      return view.render("order.firststep", {
        seats: seats,
        discounts: disc.toJSON(),
        event: eve,
        date: getLocalDate(eve.date),
        quantity: seats.length,
        sector: ticket.sector,
        category: ticket.category,
        total_price: totalPrice.toFixed(2),
      });
    }
  }

  async emptyCart({ response, session }) {
    session.forget("cart");
    return response.route("getCart");
  }

  async user({ auth, view, request, response, session }) {
    if (auth.user) {
      return response.route("orderPersonal");
    }

    const cart = session.get("cart");
    const seats = cart.seats;
    const ticket = cart.ticket;
    const eve = cart.event;

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
        date: getLocalDate(eve.date),
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
        session.withErrors({ login: "Wrong password or name" }).flashAll();
        return response.route("orderUser");
      }
    } else if (newOrCreate == 1) {
      const exist = await User.findBy("email", email);

      if (!!exist) {
        session.withErrors({ exist: "User exist" }).flashAll();
        return response.route("orderUser");
      } else {
        const user = new User();
        user.email = email;
        user.password = password;
        session.put("newUser", user.toJSON());

        return response.route("orderPersonal");
      }
    }
  }

  async personaldata({ view, request, response, session, auth }) {
    const cart = session.get("cart");
    const seats = cart.seats;
    const ticket = cart.ticket;
    const eve = cart.event;
    const newUser = session.get("newUser");

    if (!seats || (!auth.user && !newUser)) {
      response.status(405).send("Error 405 Select seats first");
    } else {
      const regions = await getRegions();

      console.log(regions);

      let custom;
      if (!newUser) {
        if (auth.user.type === "Customer") {
          custom = await Customer.find(auth.user.user_type);
        }
      }

      const totalPrice = await seats
        .reduce((acc, curr) => {
          return acc + +curr.price;
        }, 0)
        .toFixed(2);

      return view.render("order.thstep", {
        event: eve,
        date: getLocalDate(eve.date),
        customer: custom,
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

    const rules = {
      fname: "required|max:40|min:2",
      lname: "required|max:40|min:2",
      company: "string|max:255|min:3",
      street: "required",
      number: "required",
      city: "required",
      kraj: "required",
      zip: "required",
    };

    const validation = await validate(request.all(), rules);

    if (validation.fails()) {
      session.withErrors(validation.messages()).flashAll();
      return response.redirect("back");
    }

    const userEmail = auth.user
      ? auth.user.email
      : session.get("newUser").email;
    console.log(userEmail);

    const personal = new PersonalInformation();
    personal.fname = fname;
    personal.lname = lname;
    personal.email = userEmail;
    personal.company = company;
    personal.phone = phone;
    personal.kraj = kraj;
    personal.street = street;
    personal.number = number;
    personal.city = city;
    personal.zip = zip;

    const cart = session.get("cart");
    const seats = cart.seats;
    const ticket = cart.ticket;
    const eve = cart.event;

    session.put("cart", {
      seats: seats,
      ticket: ticket,
      event: eve,
      personal: personal.toJSON(),
    });

    //session.put("personal", personal.toJSON());

    return response.route("transportPay");
  }

  async getTransportPay({ auth, view, request, response, session }) {
    const cart = session.get("cart");

    const seats = cart.seats;
    const ticket = cart.ticket;
    const eve = cart.event;
    const personal = cart.personal;
    const newUser = session.get("newUser");

    if (!seats || (!auth.user && !newUser) || !personal) {
      response.status(405).send("Error 405 Select seats first");
    } else {
      const payments = await Payment.all();

      let transports = await Transport.all();

      const transpo = transports.toJSON();

      transports = transpo.filter((x) => x.type !== "Post");
      let post = transpo.filter((x) => x.type === "Post");
      if (post) {
        let postPrice = await getPostPrice(personal.zip);
        console.log("PostPrice", postPrice);
        transports.push({
          id: post.pop().id,
          type: "Post",
          price: 2.5 + +postPrice,
        });
        session.put("postPrice", postPrice);
      }

      console.log("tranport", transports);

      const totalPrice = await seats
        .reduce((acc, curr) => {
          return acc + +curr.price;
        }, 0)
        .toFixed(2);

      return view.render("order.quatrostep", {
        event: eve,
        date: getLocalDate(eve.date),
        transports: transports,
        payments: payments.toJSON(),
        quantity: seats.length,
        sector: ticket.sector,
        category: ticket.category,
        total_price: totalPrice,
      });
    }
  }

  async postTransportPay({ auth, view, request, response, session }) {
    const { pay, transport } = request.all();

    session.put("delivery", {
      payment: pay,
      transport: Array.isArray(transport) ? transport : [transport],
    });

    return response.route("controll");
  }

  async getControll({ auth, view, request, response, session }) {
    const cart = session.get("cart");
    const seats = cart.seats;
    const ticket = cart.ticket;
    const eve = cart.event;
    const personal = cart.personal;
    const newUser = session.get("newUser");
    const delivery = session.get("delivery");
    const postPrice = session.get("postPrice");

    if (!seats || (!auth.user && !newUser) || !personal || !delivery) {
      response.status(405).send("Error 405 Select seats first");
    } else {
      let transports = await Transport.query()
        .whereIn("id", delivery.transport)
        .fetch();

      transports = transports.toJSON();

      let transport = transports.reduce((acc, curr) => {
        if (curr.type != "Post") {
          acc.push(curr);
        } else if (curr.type === "Post") {
          acc.push({
            type: "Post",
            price: postPrice,
          });
        }
        return acc;
      }, new Array());

      const payment = await Payment.find(delivery.payment);

      let aditionPrice =
        +payment.price +
        transport.reduce((acc, curr) => {
          console.log(curr.price);
          return acc + +curr.price;
        }, 0);

      let totalPrice = await seats
        .reduce((acc, curr) => {
          return acc + +curr.price;
        }, 0)
        .toFixed(2);

      totalPrice = parseFloat(totalPrice) + parseFloat(aditionPrice);

      const { currency } = request.all();

      let fPrice = null;
      if (currency) {
        fPrice = await getFCurrency(currency, totalPrice);
      }

      return view.render("order.final", {
        event: eve,
        date: getLocalDate(eve.date),
        personal: personal,
        transport: transport,
        payment: payment.toJSON(),
        quantity: seats.length,
        sector: ticket.sector,
        category: ticket.category,
        addPrice: aditionPrice.toFixed(2),
        total_price: totalPrice.toFixed(2),
        foreignPrice: {
          type: currency,
          price: fPrice,
        },
      });
    }
  }

  async postControll({ auth, view, request, response, session }) {
    const cart = session.pull("cart");
    const seats = cart.seats;
    const ticket = cart.ticket;
    const eve = cart.event;
    const personal = cart.personal;
    const newUser = session.pull("newUser");
    const delivery = session.pull("delivery");
    const postPrice = session.pull("postPrice");

    let ticektPrice = await seats
      .reduce((acc, curr) => {
        return acc + +curr.price;
      }, 0)
      .toFixed(2);

    let mailId = await Transport.findBy("type", "Email");

    console.log("Email", mailId.id);

    let transportid = delivery.transport.filter((x) => x != mailId.id);

    let user;
    if (newUser) {
      const customer = new Customer();
      customer.fname = personal.fname;
      customer.lname = personal.lname;
      await customer.save();

      user = await User.findOrCreate({
        email: newUser.email,
        password: newUser.password,
        nickname: personal.lname,
        type: "Customer",
        user_type: customer.id,
      });
    } else {
      user = await auth.user;
    }

    let newpersonal = await PersonalInformation.create(personal);

    let newsale = await Sale.create({
      zakaznik_id: user.id,
      event_id: eve.id,
      ticket_count: seats.length,
      ticket_price: ticektPrice,
      transport_price: transportid.length ? postPrice : null,
      personal_id: newpersonal.id,
      payment_id: delivery.payment,
      transport_id: transportid.length ? transportid.pop() : null,
      state: "placed",
    });

    for await (const item of seats) {
      Seat.create({
        category: item.category,
        sector: item.sector,
        price: item.price,
        sale_id: newsale.id,
        discount_id: item.discount_id,
      });
    }

    let seatsIds = seats.map((x) => x.id);

    sendEmail(user.email, user ? `${user.nickname}` : "", newsale.id);

    session.put("success", {
      saleId: newsale.id,
      username: user ? `${user.nickname}` : "",
    });

    const tickets = await TicketType.find(ticket.id);
    tickets.available = tickets.available - seats.length;
    tickets.save();

    response.route("success");
  }
}

module.exports = SaleController;

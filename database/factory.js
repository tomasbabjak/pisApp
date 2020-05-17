"use strict";

/*
|--------------------------------------------------------------------------
| Factory
|--------------------------------------------------------------------------
|
| Factories are used to define blueprints for database tables or Lucid
| models. Later you can use these blueprints to seed your database
| with dummy data.
|
*/

/** @type {import('@adonisjs/lucid/src/Factory')} */
const Factory = use("Factory");

Factory.blueprint("App/Models/Band", (faker) => {
  return {
    name: "The Lonely Island",
    origin_year: new Date("2001-01-01"),
    genres: JSON.stringify(["Rock", "Pop"]),
    web_page: "http://www.thelonelyisland.com/",
    informations:
      "The Lonely Island is an American comedy trio, formed by Akiva Schaffer, Andy Samberg, and Jorma Taccone in Berkeley, California in 2001. The three first met in junior high, and went on to write and feature in the American TV program Saturday Night Live (SNL). ",
  };
});

Factory.blueprint("App/Models/Event", (faker) => {
  return {
    title: faker.sentence({ words: 3 }),
    type: "concert",
    usporiadatel: 1,
    genres: JSON.stringify(["Rock", "Pop"]),
    date: faker.date(),
    place: faker.address(),
    country: faker.pickone(['Slovakia']),
    city: faker.pickone(['Bratislava', 'Košice']),
    paid: faker.bool(),
    state: faker.pickone(["finished", "inprogress"]),
  };
});

Factory.blueprint("App/Models/TicketType", (faker) => {
  return {
    category: faker.pickone(["VIP", "basic", "floor", "standing"]),
    sector:
      faker.pickone(["A", "B", "C", "D", "E"]) +
      faker.pickone(["1", "2", "3", "4", "5"]),
    price: faker.integer({ min: 5, max: 300 }),
    available: faker.integer({ min: 2, max: 20 }),
    // array_seats: JSON.stringify(
    //   faker.pickset(
    //     [1, 2, 3, 4, 5, 6, 45, 6, 7, 8, 9],
    //     faker.integer({ min: 1, max: 11 })
    //   )
    // ),
    discount: null,
    event_id: null,
  };
});

Factory.blueprint("App/Models/Discount", (faker) => {
  return {
    name: "ZTP",
    percentual: true,
    amount: 10,
    ticket_type_id: null,
  };
});

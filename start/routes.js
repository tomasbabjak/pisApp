"use strict";

/*
|--------------------------------------------------------------------------
| Routes
|--------------------------------------------------------------------------
|
| Http routes are entry points to your web application. You can create
| routes for different URL's and bind Controller actions to them.
|
| A complete guide on routing is available here.
| http://adonisjs.com/docs/4.1/routing
|
*/

/** @type {typeof import('@adonisjs/framework/src/Route/Manager')} */
const Route = use("Route");

Route.on("/").render("welcome");
Route.get("users", "UserController.index");
Route.post("/register", "UserController.store")
  .middleware("guest")
  .as("user.register");

Route.get("/login", ({ view }) => {
  return view.render("auth.login");
}).middleware("guest");

Route.get("/register", ({ view }) => {
  return view.render("auth.register");
}).middleware("guest");

Route.post("login", "UserController.login")
  .middleware("guest")
  .as("user.login");

Route.post("/checkout/cart", "SaleController.index").as("orderProfile");
Route.get("/checkout/user", "SaleController.user").as("orderUser");
Route.post("/checkout/user", "SaleController.loginCreate").as(
  "orderloginCreate"
);
Route.get("/checkout/informations", "SaleController.personaldata").as(
  "orderPersonal"
);
Route.post("/checkout/informations", "SaleController.billing").as(
  "orderBilling"
);

Route.get("/checkout/transportPay", "SaleController.getTransportPay").as(
  "transportPay"
);

Route.get("/events/:id", "EventController.show").as("eventsProfile");

Route.get("users/:id", "UserController.show").middleware("auth");

Route.get("/checkout", ({ view }) => {
  return view.render("order.firststep");
});

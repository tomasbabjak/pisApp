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

Route.get("/logout", "UserController.logout");

Route.post("/checkout/cart", "SaleController.index").as("orderProfile");
Route.get("/checkout/cart", "SaleController.cart").as("getCart");
Route.post("/checkout/emptycart", "SaleController.emptyCart").as("emptyCart");
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

Route.post("/checkout/transportPay", "SaleController.postTransportPay").as(
  "transportPay"
);

Route.get("/checkout/controll", "SaleController.getControll").as("controll");

Route.post("/checkout/controll", "SaleController.postControll").as(
  "placeOrder"
);

Route.get("/checkout/final", ({ view, session }) => {
  let params = session.pull("success");
  return view.render("order.conf", {
    username: params.username,
    saleId: params.saleId,
  });
}).as("success");

Route.get("/events/:id", "EventController.show").as("eventsProfile");
Route.get("/search", "SearchController.show").as("search");
Route.post("/search", "SearchController.update").as("update");

Route.get("users/:id", "UserController.show").middleware("auth");

Route.get("/checkout", ({ view }) => {
  return view.render("order.firststep");
});

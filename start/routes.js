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
Route.post("/register", "UserController.store").middleware('guest')
.as('user.register');

Route.get("/login", ({ view }) => {
  return view.render("auth.login");
}).middleware("guest");

Route.get("/register", ({ view }) => {
  return view.render("auth.register");
}).middleware("guest");

Route.post("login", "UserController.login")
  .middleware("guest")
  .as("user.login");

Route.get("users/:id", "UserController.show").middleware("auth");

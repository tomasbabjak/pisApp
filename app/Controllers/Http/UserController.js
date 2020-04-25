"use strict";

const User = use("App/Models/User");

const Database = use("Database");

class UserController {
  async index({ view }) {
    const users = await User.all();

    return view.render("users.index", { users: users.toJSON() });
  }

  async login({ auth, request, response, view }) {
    console.log("asdas");
    const { email, password } = request.all();
    try {
      await auth.attempt(email, password);

      response.redirect(`/users/${auth.user.id}`);

      return "Logged in successfully";
    } catch (err) {
      return view.render("auth.login", { error: "Neplatne meno alebo heslo" });
    }
  }

  async store({ auth, request, response }) {
    try {
      const data = request.only(["fname", "lname", "email", "password"]);
      const userExists = await User.findBy("email", data.email);
      if (userExists) {
        return response
          .status(400)
          .send({ message: { error: "User already registered" } });
      }
      const user = await User.create(data);

      // const userId = await Database
      //   .table('users')
      //   .insert({
      //     fname: data.fname,
      //     lname: data.lname,
      //     email: data.email,
      //     password: data.password
      //   });

      await auth.attempt(data.email, data.password);

      response.redirect(`/users/${auth.user.id}`);

      return user;
    } catch (err) {
      return response.status(err.status).send(err);
    }
  }

  show({ auth, params }) {
    if (auth.user.id !== Number(params.id)) {
      return "You cannot see someone else's profile";
    }
    return auth.user;
  }

  async logout({ auth, response }) {
    await auth.logout();
    response.redirect("back");
  }
}

module.exports = UserController;

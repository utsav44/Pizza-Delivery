const User = require("../models/user");
const Admin = require("../models/admin");
const localStrategy = require("passport-local").Strategy;
const bcrypt = require("bcrypt");

function init(passport) {
  //   passport.use(User.createStrategy());

  //   passport.serializeUser(User.serializeUser());

  //   passport.deserializeUser(User.deserializeUser());

  passport.use(
    "user-local",
    new localStrategy({ usernameField: "email" }, async function (
      email,
      password,
      done
    ) {
      const user = await User.findOne({ email: email });
      if (!user) {
        return done(null, false, { message: "no user with this email" });
      }
      bcrypt
        .compare(password, user.password)
        .then(function (match) {
          if (match) {
            return done(null, user, { message: "Logged in successfully" });
          }
          return done(null, false, { message: "Wrong username or password" });
        })
        .catch(function (err) {
          return done(null, false, { message: "something went wrong" });
        });
    })
  );
  passport.use(
    "admin-local",
    new localStrategy({ usernameField: "email" }, async function (
      email,
      password,
      done
    ) {
      const user = await Admin.findOne({ email: email });
      if (!user) {
        return done(null, false, { message: "no user with this email" });
      }
      bcrypt
        .compare(password, user.password)
        .then(function (match) {
          if (match) {
            return done(null, user, { message: "Logged in successfully" });
          }
          return done(null, false, { message: "Wrong username or password" });
        })
        .catch(function (err) {
          return done(null, false, { message: "something went wrong" });
        });
    })
  );

  passport.serializeUser(function (user, done) {
    done(null, { _id: user._id, role: user.role });
  });

  passport.deserializeUser(function (id, done) {
    if (id.role === "customer") {
      User.findById(id, function (err, user) {
        done(err, user);
      });
    }
    else if(id.role==="admin")
    {
        Admin.findById(id,function(err,user)
        {
            done(err,user);
        })
    }
  });
}

module.exports = init;

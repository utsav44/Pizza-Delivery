const passport = require("passport");
const User = require("../../models/user");
const Admin = require("../../models/admin");
const bcrypt = require("bcrypt");
const client = require("twilio")(process.env.ACCOUNTSID, process.env.AUTHTOKEN);
const getOtp = require("../../config/getOTP");

function authController() {
  return {
    getOtp(req, res) {
      res.render("auth/getotp", { type: "register" });
    },

    generateOTP(req, res) {
      console.log(req.body);
      const { role, numberForOTP } = req.body;
      if (!numberForOTP) {
        req.flash("error", "All Fields are required");
        req.flash("numberForOTP", numberForOTP);
        return res.redirect("/getOtp");
      }
      if (role === "customer") {
        User.findOne({ phone: numberForOTP }, function (err, foundUser) {
          if (foundUser) {
            req.flash("error", "Number already exist");
            return res.redirect("/getOtp");
          }
        });
        // getOtp(req,res,numberForOTP);
        client.verify
          .services(process.env.SERVICEID)
          .verifications.create({
            to: `+91${numberForOTP}`,
            channel: "sms",
          })
          .then(function (data) {
            console.log(data);
            if (data.status === "pending") {
              res.render("auth/insertOTP", {
                type: "register",
                number: numberForOTP,
                role: role,
                error: "",
              });
            } else {
              req.flash("error", "Something went wrong");
              return res.redirect("/getOtp");
            }
          });
      } else {
        Admin.findOne({ ownernumber: numberForOTP }, function (err, foundUser) {
          if (foundUser) {
            req.flash("error", "Number already exist");
            return res.redirect("/getOtp");
          }
        });
        // getOtp(req,res,numberForOTP);
        client.verify
          .services(process.env.SERVICEID)
          .verifications.create({
            to: `+91${numberForOTP}`,
            channel: "sms",
          })
          .then(function (data) {
            console.log(data);
            if (data.status === "pending") {
              res.render("auth/insertOTP", {
                type: "register",
                number: numberForOTP,
                role: role,
                error: "",
              });
            } else {
              req.flash("error", "Something went wrong");
              return res.redirect("/getOtp");
            }
          });
      }
    },

    validateOTP(req, res) {
      console.log(req.body);
      const role = req.body.role;
      const numberForOTP = req.body.numberForOTP;
      const OTP = req.body.OTP;
      client.verify
        .services(process.env.SERVICEID)
        .verificationChecks.create({
          to: `+91${numberForOTP}`,
          code: OTP,
        })
        .then(function (data) {
          console.log(data);
          if (data.status === "approved") {
            return res.render("auth/register", {
              number: numberForOTP,
              role: role,
            });
          } else {
            return res.render("auth/insertOTP", {
              type: "register",
              number: numberForOTP,
              role: role,
              error: "Invalid OTP",
            });
          }
        });

      // res.redirect("/register");
    },

    login(req, res) {
      res.render("auth/login");
    },

    postUserLogin(req, res, next) {
      const { email, password } = req.body;
      if (!email || !password) {
        req.flash("error", "All Fields are required");
        req.flash("email", email);
        return res.redirect("/login");
      }
      passport.authenticate("user-local", function (err, user, info) {
        if (err) {
          req.flash("error", info.message);
          return next(err);
        }
        if (!user) {
          req.flash("error", info.message);
          return res.redirect("/login");
        }
        req.logIn(user, function (err) {
          if (err) {
            req.flash("error", info.message);
            return next(err);
          }

          return res.redirect("/");
        });
      })(req, res, next);
    },

    postAdminLogin(req, res, next) {
      const { email, password } = req.body;
      if (!email || !password) {
        req.flash("error", "All Fields are required");
        req.flash("email", email);
        return res.redirect("/login");
      }
      passport.authenticate("admin-local", function (err, user, info) {
        if (err) {
          req.flash("error", info.message);
          return next(err);
        }
        if (!user) {
          req.flash("error", info.message);
          return res.redirect("/login");
        }
        req.logIn(user, function (err) {
          if (err) {
            req.flash("error", info.message);
            return next(err);
          }

          return res.redirect("/");
        });
      })(req, res, next);
    },

    async postuserRegister(req, res) {
      console.log(req.body);
      const { name, email, phone, password } = req.body;

      //validation error
      if (!name || !email || !password || !phone) {
        req.flash("error", "All Fields are required");
        req.flash("name", name);
        req.flash("email", email);
        req.flash("phone", phone);
        return res.render("auth/register", {
          number: phone,
          role: req.body.role,
        });
      }

      //check if email is already register

      User.findOne({ email: email }, function (err, foundUser) {
        if (foundUser) {
          req.flash("error", "Email already exist");
          req.flash("name", name);
          req.flash("email", email);
          req.flash("phone", phone);
          return res.render("auth/register", {
            number: phone,
            role: req.body.role,
          });
        }
      });

      const hashedPassword = await bcrypt.hash(password, 10);

      const newUser = new User({
        name: name,
        email: email,
        phone: phone,
        password: hashedPassword,
      });

      newUser
        .save()
        .then(function (newUser) {
          passport.authenticate("user-local")(req, res, function () {
            return res.redirect("/");
          });
          // return res.redirect("/");
        })
        .catch(function (err) {
          req.flash("error", "something went wrong");
          return res.render("auth/register", {
            number: phone,
            role: req.body.role,
          });
        });

      //   User.register(newUser, password, function (err, user) {
      //     if (err) {
      //       // req.flash("error", "Email already exist");
      //       // req.flash("name", name);
      //       // req.flash("email", email);
      //       console.log(err);
      //       return res.redirect("/register");
      //     } else {
      //       // passport.authenticate("local", function(err, user, info) {

      //       //     console.log(user);
      //       //     if (err) return next(err);
      //       //     // if (!user) return res.redirect('/login');

      //       //     req.logIn(user, function(err) {
      //       //         if (err)  return next(err);
      //       //         return res.redirect("/");
      //       //     });

      //       // })(req, res, next);

      //       passport.authenticate("local")(req, res, function () {
      //         res.redirect("/");
      //       });
      //     }
      //   });

      console.log(req.body);
    },
    async postadminRegister(req, res) {
      console.log(req.body);
      const {
        resturentname,
        resturentaddress,
        resturentnumber,
        ownernumber,
        ownername,
        owneremail,
        adminpassword,
      } = req.body;
      // validation error
      if (
        !resturentname ||
        !owneremail ||
        !adminpassword ||
        !resturentaddress ||
        !resturentnumber ||
        !ownernumber ||
        !ownername
      ) {
        req.flash("error", "All Fields are required");
        req.flash("name", resturentname);
        req.flash("email", owneremail);
        req.flash("address", resturentaddress);
        req.flash("resturentnumber", resturentnumber);
        req.flash("ownernumber", ownernumber);
        req.flash("ownername", ownername);

        return res.render("auth/register", {
          number: ownernumber,
          role: req.body.role,
        });
      }

      //check if email is already register

      Admin.findOne({ email: owneremail }, function (err, foundUser) {
        if (foundUser) {
          req.flash("error", "Email already exist");
          req.flash("name", resturentname);
          req.flash("email", owneremail);
          req.flash("address", resturentaddress);
          req.flash("resturentnumber", resturentnumber);
          req.flash("ownernumber", ownernumber);
          req.flash("ownername", ownername);
          return res.render("auth/register", {
            number: ownernumber,
            role: req.body.role,
          });
        }
      });

      const hashedPassword = await bcrypt.hash(adminpassword, 10);

      const newUser = new Admin({
        resturentname: resturentname,
        email: owneremail,
        resturentaddress: resturentaddress,
        resturentnumber: resturentnumber,
        ownernumber: ownernumber,
        ownername: ownername,
        role: req.body.role,
        password: hashedPassword,
      });

      newUser
        .save()
        .then(function (newUser) {
          // passport.authenticate("admin-local")(req, res, function () {
          //   return res.redirect("/");
          // });
          req.login(newUser, function (err) {
            if (!err) {
              return res.redirect("/");
            } else {
              console.log(err);
            }
          });
        })
        .catch(function (err) {
          req.flash("error", "something went wrong");
          return res.render("auth/register", {
            number: ownernumber,
            role: req.body.role,
          });
        });

      //   User.register(newUser, password, function (err, user) {
      //     if (err) {
      //       // req.flash("error", "Email already exist");
      //       // req.flash("name", name);
      //       // req.flash("email", email);
      //       console.log(err);
      //       return res.redirect("/register");
      //     } else {
      //       // passport.authenticate("local", function(err, user, info) {

      //       //     console.log(user);
      //       //     if (err) return next(err);
      //       //     // if (!user) return res.redirect('/login');

      //       //     req.logIn(user, function(err) {
      //       //         if (err)  return next(err);
      //       //         return res.redirect("/");
      //       //     });

      //       // })(req, res, next);

      //       passport.authenticate("local")(req, res, function () {
      //         res.redirect("/");
      //       });
      //     }
      //   });
    },

    logout(req, res) {
      req.logout();
      return res.redirect("/login");
    },
  };
}

module.exports = authController;

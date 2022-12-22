const User = require("../../models/user");
const Admin = require("../../models/admin");
const bcrypt = require("bcrypt");
const client = require("twilio")(process.env.ACCOUNTSID, process.env.AUTHTOKEN);

function passwordController() {
  return {
    updatePassGetOTP(req, res) {
      res.render("auth/getotp", { type: "forgetPass" });
    },
    updatePassGenerateOTP(req, res) {
      console.log(req.body);
      const { role, numberForOTP } = req.body;
      if (!numberForOTP) {
        req.flash("error", "All Fields are required");
        req.flash("numberForOTP", numberForOTP);
        return res.redirect("/updatePassGetOTP");
      }
      if (role === "customer") {
        User.findOne({ phone: numberForOTP }, function (err, foundUser) {
          if (!foundUser) {
            req.flash("error", "User not exist");
            return res.redirect("/updatePassGetOTP");
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
                type: "forgetPass",
                number: numberForOTP,
                role: role,
                error: "",
              });
            } else {
              req.flash("error", "Something went wrong");
              return res.redirect("/updatePassGetOTP");
            }
          });
      } else {
        Admin.findOne({ ownernumber: numberForOTP }, function (err, foundUser) {
          if (!foundUser) {
            req.flash("error", "User not exist");
            return res.redirect("/updatePassGetOTP");
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
                type: "forgetPass",
                number: numberForOTP,
                role: role,
                error: "",
              });
            } else {
              req.flash("error", "Something went wrong");
              return res.redirect("/updatePassGetOTP");
            }
          });
      }
    },
    updatePassValidateOTP(req, res) {
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
            return res.render("auth/updatePass", {
              number: numberForOTP,
              role: role,
            });
          } else {
            return res.render("auth/insertOTP", {
              type: "forgetPass",
              number: numberForOTP,
              role: role,
              error: "Invalid OTP",
            });
          }
        });
    },
    async setNewPass(req, res) {
      console.log(req.body);
      const { numberForOTP, role, updatepassword, reEnteredpassword } =
        req.body;
      if (!updatepassword || !reEnteredpassword) {
        req.flash("error", "All Fields are required");
        return res.render("auth/updatePass", {
          number: numberForOTP,
          role: role,
        });
      }
      if (updatepassword !== reEnteredpassword) {
        req.flash("error", "Password must be matched");
        return res.render("auth/updatePass", {
          number: numberForOTP,
          role: role,
        });
      }
      const hashedPassword = await bcrypt.hash(updatepassword, 10);
      if (role === "customer") {
        User.updateOne(
          { phone: numberForOTP },
          { password: hashedPassword },
          function (err, updatedUser) {
            if (err) {
              req.flash("error", "something went wrong");
              return res.redirect("/updatePassGetOTP");
            } else {
              console.log(updatedUser);
              console.log("password updated");
              return res.render("successMes");
            }
          }
        );
      } else {
        Admin.updateOne(
          { ownernumber: numberForOTP },
          { password: hashedPassword },
          function (err, updatedUser) {
            if (err) {
              req.flash("error", "something went wrong");
              return res.redirect("/updatePassGetOTP");
            } else {
              console.log(updatedUser);
              console.log("password updated");
              return res.render("successMes");
            }
          }
        );
      }
    },
  };
}

module.exports = passwordController;

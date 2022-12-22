const mongoose = require("mongoose");
const passportLocalMongoose = require("passport-local-mongoose");

const Schema = mongoose.Schema;

const adminSchema = new Schema(
  {
    resturentname: {
      type: String,
      required: false,
    },
    email: {
      type: String,
      required: false,
      unique: true,
    },
    password: {
      type: String,
      required: false,
    },
    role: {
      type: String,
      default: "admin",
    },
    resturentnumber: {
      type: String,
      required: false,
    },
    ownernumber: {
      type: String,
      required: false,
      unique: true,
    },
    ownername: {
      type: String,
      required: false,
    },
    resturentaddress: {
      type: String,
      required: false,
    },
  },
  { timestamps: true }
);

adminSchema.plugin(passportLocalMongoose);

const Admin = mongoose.model("Admin", adminSchema);

module.exports = Admin;

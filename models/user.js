const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const userSchema = new Schema(
  {
    username: {
      type: String,
      require: true,
    },
    password: {
      type: String,
      require: true,
    },
    email: {
      type: String,
      require: true,
    },
    role: {
      type: String,
      enum: ["admin", "designer", "buyer"],
      default: "buyer",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Users", userSchema);

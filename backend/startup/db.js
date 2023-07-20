const mongoose = require("mongoose");

module.exports = (url) => {
  mongoose.set("strictQuery", false);

  mongoose
    .connect(url)
    .then((start) => console.log("mongodb connected..."))
};

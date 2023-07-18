const mongoose = require("mongoose");

const DB = process.env.DATA_BASE;

mongoose
  .connect(DB, {
    useUnifiedTopology: true,
    useNewUrlParser: true,
  })
  .then(() => console.log("Data Base Connection Completed"))
  .catch((error) => {
    console.log(error);
  });

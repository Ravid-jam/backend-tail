const mongoose = require("mongoose");
const uri = process.env.MONGO_URL;
mongoose.connect(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const db = mongoose.connection;

db.once("open", () => {
  console.log("mongodb connection successful");
});

db.on("error", (error) => console.error(error));

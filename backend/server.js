const app = require("./app");
const cloudinary = require('cloudinary').v2;

// handle uncaught exception
process.on("uncaughtException", (err) => {
    console.log('Error :', err.message); 
    console.log("Shutting down the server due to uncaught exception.");

    process.exit(1);
});

if(process.env.NODE_ENV !== "production"){
  require("dotenv").config({ path: "backend/config/config.env" });
}

//config

require("./startup/db")(process.env.DB_URL);

cloudinary.config({
  cloud_name: "dob6twalk",
  api_key: "182636668726517",
  api_secret: "oGtTsTCnO3pSRxAKdqFY7SnsVG8"
});

const server = app.listen(process.env.PORT, () => {
  console.log(`server listen on http://localhost:${process.env.PORT}`);
});

//unhandled promise rejection
process.on("unhandledRejection", (ex) => {
  console.log("Error :", ex.message);
  console.log("Shutting down the server due to unhandled promise rejection.");

  server.close(() => {
    process.exit(1);
  });
});

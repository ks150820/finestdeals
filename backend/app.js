const express = require('express');
const cors = require('cors');
const product = require('./routes/productRoute');
const user = require('./routes/userRoute');
const order = require("./routes/orderRoute");
const payment = require("./routes/paymentRoute");
const errorMiddleware = require('./middleware/error');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const fileUpload = require('express-fileupload');
const app = express();
const path = require('path');

app.use(cookieParser());
app.use(cors({
    credentials: true,
    origin: "http://localhost:3000",
}));
app.use(bodyParser.urlencoded({extended: true, limit: '50mb'}));
app.use(fileUpload());

//config
if(process.env.NODE_ENV !== "production"){
    require("dotenv").config({ path: "backend/config/config.env" });
  }

app.use(express.json({limit: '50mb'}));

app.use('/api/v1', product);
app.use('/api/v1',  user);
app.use('/api/v1',  order);
app.use('/api/v1', payment)

app.use(express.static(path.join(__dirname, '../frontend/build')));

app.get('/', function (req, res) {
    res.sendFile(path.join(__dirname, '../frontend/build', 'index.html'));
  });

app.use(errorMiddleware);

module.exports = app;
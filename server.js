// import bins from './public/bins.json' with {type: json}
require('dotenv').config();
const bins = require("./public/bins.json");
const express = require("express");
const http = require("http");
const socketIo = require("socket.io");
const path = require("path");
const cors = require("cors");
const axios = require('axios')

// initialize the app
const app = express();

// create a server
const server = http.createServer(app);

// initialize socket io on the server
const io = socketIo(server);

// serving static files
app.use(express.static(path.join(__dirname, "public")));

// cors
const options = {};
app.use(cors());
// handling connection events
io.on("connection", (socket) => {
  console.log("a new user has connected!");

  // handling incoming messages as long as the client is connected
  socket.on("message", (msg) => {
    console.log(`Bin id: ${msg} `);
  });

  // // listining for bin Id from the client
  socket.on("binID", (id) => {
    console.log(`BindId from frontend Client: ${id}`);

    // for sending templates 
    var data = JSON.stringify({
      to: `${process.env.TEST_NUMBER}`, //remove the GT and LT signs
      phoneId: `${process.env.ZIXFLOW_PHONEID}`,
      templateName: "welcome_message",
      language: "en",
      variables: {
        test: "",
      },
      submissionStatus: true,
    });

    var config = {
      method: "post",
      url: "https://api.zixflow.com/api/v1/campaign/whatsapp/send",
      headers: {
        Authorization: `Bearer ${process.env.ZIXFLOW_API_KEY}`,
        "Content-Type": "application/json",
      },
      data: data,
    };

    
    axios(config)
      .then(function (response) {
        console.log(JSON.stringify(response.data));
      })
      .catch(function (error) {
        console.log(error);
      });

    // bins.Dimapur.forEach((driver) => {
    //   if (id === driver[2]) {
    //     var text = `Notice from SGDMS\nName: ${driver[4]}\nBinid:${driver[2]}\nLocation: ${driver[1]}GoogleLink : ${driver[6]}`;
    //     let bodyObject = JSON.parse(options.body);
    //     bodyObject.text.body = text;
    //     options.body = JSON.stringify(bodyObject);
    //   }
    // });

    // for direct messages
      // fetch(
      //   "https://api.zixflow.com/api/v1/campaign/whatsapp/message/send",
      //   options
      // )
      // .then((response) => response.json())
      // .then((response) => console.log(response))
      // .catch((err) => console.error(err));

    // console.log(bins.Dimapur)
  });

  // handling disconnects
  socket.on("disconnect", () => {
    console.log("The user has disconnected!!");
  });
});

// setting basic routes
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "./public/index.html"));
});

app.get("/bins", (req, res) => {
  res.sendFile(path.join(__dirname, "public/bins.html"));
});

//starting the server
const PORT = 8000;
server.listen(PORT, () => {
  console.log(`express server running on PORT ${PORT}`);
});

"use strict";

const express = require("express");
const bodyParser = require("body-parser"); // obsługuje żądania dostępne pod req.body
const request = require("request");
const app = express();

app.set("port", process.env.PORT || 8000);

app.use(bodyParser.urlencoded({ extended: false })); //Przegląda jedynie żądania które w nagłówku mają Content-Type
app.use(bodyParser.json()); //Analizuje plik Json i wyświetla tylko żądania

// Home
app.get("/", function(req, res) {
  res.send("Messenger API V2!");
});

// Start the server
app.listen(app.get("port"), function() {
  console.log("running on port", app.get("port"));
});

//Konfiguracja Webhook'a
app.get("/webhook/", function(req, res) {
  if (req.query["hub.verify_token"] === "goodboy") {
    res.send(req.query["hub.challenge"]);
  }
  res.send("Wrong token!");
});

//Facebook token
const token =
  "EAAGC7uMkDHUBAFt08ZCIZBZC5ZBwIjSLZCyGHbQDPZCMIrKw97F63SrI9DWrkQuMj8J9R7koXIJjk8OfDQA8fli7aK5O7ppwSQjZBv3wtKy7CuQOZAzz5ZC35EhRzskT3IRTRqbXPZBpsmnLYZCTDLCAGy5ALs6bGDyiZAx5124ZC0AUg3nYSCtu0H9ow9QMAcfx3O3MZD";

// Odpowiedź webhook'a
app.post("/webhook/", function(req, res) {
  let messaging_events = req.body.entry[0].messaging;
  for (let i = 0; i < messaging_events.length; i++) {
    let event = req.body.entry[0].messaging[i];
    let sender = event.sender.id;
    if (event.message && event.message.text) {
      let text = event.message.text;
      if (text === "Generic") {
        sendGenericMessage(sender);
        continue;
      } else if (text === "Get Started") {
        sendTextMessage(sender, "W czym mogę pomóc?");
      } else {
        sendTextMessage(sender, "Ja też " + text.substring(0, 200) + " 😂😂😂");
      }
    }
    // if (event.postback) {
    //   let text = JSON.stringify(event.postback);
    //   sendTextMessage(sender, "W czym mogę pomóc?");
    //   continue;
    // }
  }
  res.sendStatus(200);
});

// Funkcja wysyłania wiadomości
function sendTextMessage(sender, text) {
  let messageData = { text: text };
  request(
    {
      url: "https://graph.facebook.com/v2.6/me/messages",
      qs: { access_token: token },
      method: "POST",
      json: {
        recipient: { id: sender },
        message: messageData
      }
    },
    function(error, response, body) {
      if (error) {
        console.log("Error sending messages: ", error);
      } else if (response.body.error) {
        console.log("Error: ", response.body.error);
      }
    }
  );
}

//Wysyłanie wiadomości typu generic (szablon ogólny)
function sendGenericMessage(sender) {
  let messageData = {
    attachment: {
      type: "template",
      payload: {
        template_type: "generic",
        elements: [
          {
            title: "Kawa",
            subtitle: "Element #1 ",
            image_url: "http://www.coffeedesk.pl/blog/wp-content/uploads/2016/12/instant.jpg",
            buttons: [
              {
                type: "web_url",
                url: "https://www.messenger.com",
                title: "Kup teraz!"
              }
            ]
          },
          {
            title: "Kawa zbożowa",
            subtitle: "Najczęściej wybierana przez community",
            image_url: "http://www.odzywianie.info.pl/img/stories/arts/_665x/kawa-zbozowa-wlasciwosci-rodzaje-i-wplyw-na-zdrowie.jpg",
            buttons: [
                {
                    type: "web_url",
                    url: "https://www.messenger.com",
                    title: "NO TO MOZE teraz?!"
                }
            ]
          },
          {
            title: "Monsterek",
            subtitle: "A może monsterek zamiast kawy?!",
            image_url: "https://www.mercedesamgf1.com/wp-content/uploads/sites/3/2016/05/monsterenergy1600x969onwhitepng682x414q85crop-smartmask-0203px200203pxpng-682x414.png",
            buttons: [
                {
                    type: "web_url",
                    url: "https://www.messenger.com",
                    title: "BIOREEE!"
                }
            ]
          }
        ]
      }
    }
  };
  request(
    {
      url: "https://graph.facebook.com/v2.6/me/messages",
      qs: { access_token: token },
      method: "POST",
      json: {
        recipient: { id: sender },
        message: messageData
      }
    },
    function(error, response, body) {
      if (error) {
        console.log("Error sending messages: ", error);
      } else if (response.body.error) {
        console.log("Error: ", response.body.error);
      }
    }
  );
}

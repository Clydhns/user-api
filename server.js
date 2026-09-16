const express = require("express");

const app = express();

const PORT = process.env.PORT || 3000;

const users = [
  {
    LastName: "Sadudaquil",
    FirstName: "Clyde Hans",
    Email: "clydehans6@gmail.com",
    Password: "123456"
  },
  {
    LastName: "Fuck",
    FirstName: "BBM",
    Email: "BBM@Corruption.com",
    Password: "coke"
  },
  {
    LastName: "Flood",
    FirstName: "Control",
    Email: "FloodControl@Ph.com",
    Password: "asa na?"
  }
];

app.get("/", (req, res) => {
  res.send("User API is running!");
});

app.get("/users", (req, res) => {
  res.json(users);
});

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running on port ${PORT}`);
});
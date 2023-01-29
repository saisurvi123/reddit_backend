const express = require("express");
const connectToMongo = require("./db");
const cors=require('cors');
const dotenv=require('dotenv')
const app = express();
// const host='0.0.0.0';
dotenv.config();
app.use(cors());
connectToMongo();
// const port = 5000;
const port = process.env.PORT || 5000;

app.use(express.json());
app.get("/", (req, res) => {
  res.send("Hello World!");
});

// available routes in a modular way
// routes for authentication



app.use("/api/auth", require("./routes/auth"));
app.use("/api/subgreddit", require("./routes/subgreddit"));

app.listen(port,() => {
  console.log(`server running at ${port} port`);
});

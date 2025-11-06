const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const path = require("path");
const { swaggerUi, specs } = require("./swagger/swagger");
const app = express();
const port = 5500;
const userRoutes = require("./routes/user");
require("dotenv").config();
// console.log(process.env)
app.use(express.json());
app.use(cors());

app.use(
  "/assets/images",
  express.static(path.join(__dirname, "assets/images"))
);

const db = mongoose.connect(process.env.MongoDB)
db.then(() => console.log("MongoDB connected"))
db.catch(err => console.log(err));

// const db = mongoose.connection;
// db.on("error", console.error.bind(console, "MongoDB connect error:"));
// db.once("open", () => {
//   console.log("connected to MongoDB");
// });

app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.get("/api", (req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});


app.use("/api/users", userRoutes);

// Swagger documentation
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs, {
  explorer: true,
  customCss: '.swagger-ui .topbar { display: none }',
  customSiteTitle: "Node API Documentation"
}));

app.listen(process.env.PORT || 4500, () => {
  console.log(`app listening on port ${port}`);
  console.log(`Swagger documentation available at: http://localhost:${process.env.PORT || 4500}/api-docs`);
});

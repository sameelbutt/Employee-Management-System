const express = require("express");
const cors = require("cors");
const authRoutes = require("./routes/authRout");
const userRoutes = require("./routes/userRout");
const createleaveRoutes = require("./routes/applyleaveRout");
const departmentRoutes = require("./routes/departmentRoutes");
const positionRoutes = require("./routes/positionRoutes");
const onboardingRoutes = require("./routes/onboardingRout");
const app = express();

app.use(cors());

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/leave", createleaveRoutes);
app.use("/api/departments", departmentRoutes);
app.use("/api/positions", positionRoutes);
app.use("/api/onboard", onboardingRoutes);

app.get("/", (req, res) => {
  res.json({ message: "Welcome to HRMS API" });
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    message: "Something broke!",
    error: process.env.NODE_ENV === "development" ? err.message : {},
  });
});

module.exports = app;

const express = require("express");
const router = express.Router();

router.get("/", async (req, res, next) => {
  res.send(req.query);
});

router.post("/", async (req, res, next) => {
  res.send(req.body);
});

module.exports = router;

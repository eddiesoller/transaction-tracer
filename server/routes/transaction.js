const express = require("express");
const transactionRoutes = express.Router();
const dbo = require("../db/conn");
const ObjectId = require("mongodb").ObjectId;

transactionRoutes.route("/transaction").get(function (req, res) {
  let db_connect = dbo.getDb();
  const query = {};
  if (req.query.startDate || req.query.endDate) {
    query.date = {};
    if (req.query.startDate) {
      query.date.$gte = req.query.startDate;
    }
    if (req.query.endDate) {
      query.date.$lte = req.query.endDate;
    }
  }
  if (req.query.team) {
    query.team = req.query.team;
  }
  if (req.query.player) {
    query.$or = [
      { acquired: req.query.player },
      { relinquished: req.query.player },
    ];
  }
  const options = { sort: { date: 1 } };
  db_connect
    .collection("transactions")
    .find(query, options)
    .toArray(function (err, result) {
      if (err) throw err;
      res.json(result);
    });
});

transactionRoutes.route("/transaction/:id").get(function (req, res) {
  let db_connect = dbo.getDb();
  let query = { _id: ObjectId(req.params.id) };
  db_connect.collection("transactions").findOne(query, function (err, result) {
    if (err) throw err;
    res.json(result);
  });
});

module.exports = transactionRoutes;

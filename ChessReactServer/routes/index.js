const express = require("express");
const router = express.Router();

// router.get("/", (req, res) => {
//   res.sendFile(__dirname + '/index.html');
// });

router.get('/', function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "X-Requested-With");
  next()
});
module.exports = router;


// server.listen(port);
console.log('Connected index js routerfolder');
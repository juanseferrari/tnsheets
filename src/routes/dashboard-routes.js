var express = require('express');
var router = express.Router();

const mainController = require('../controllers/es/main-controller');
const generalMid = require('../middlewares/general-mid');

// Dashboard home -> reuse account page as dashboard landing
router.get('/', generalMid, (req, res, next) => {
  const google_user = res.locals.google_user;
  const connections = res.locals.connections || [];
  if ((google_user && google_user.google_user_id) || connections.length > 0) {
    return mainController.account(req, res, next);
  }
  return res.redirect('https://www.sheetscentral.com/');
});

module.exports = router;



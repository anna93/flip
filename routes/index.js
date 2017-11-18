var express = require('express');
var router = express.Router();
var db = require('../database/postgres');

router.post('/addBill', function(req, res, next) {
  let params = req.body;
  Promise.all([
    // get all users in this group
    db.query('select * from "user" u join group_user gu on u.id = gu.u_id where gu.g_id = $1',[
      params.groupId
    ]),
    // insert bill data in the bill
    db.query('insert into bill(name, g_id, amount) values($1, $2, $3)', [
      params.name,
      params.groupId,
      params.amount
    ])
  ])
  .then(responses => {
    let allUsers = responses[0];
    // equally divide the amount in the number of group members;
    let shouldHavePaid = params.amount/(allUsers.length || 1);
    let updateValuesForUsers = allUsers.map(u => {
      // check if contributor exists? if does add positive balance against his name else negative
      let foundContributor = params.contributors.find(c => c.id == u.id);
      let paidValue = (foundContributor  && foundContributor.contribution) || 0;
      return db.query('update group_user set balance = balance+$1 where u_id = $2 and g_id = $3',[
        paidValue - shouldHavePaid,
        u.id,
        params.groupId
      ])
    })
    return Promise.all(updateValuesForUsers);
  })
  .then(dbRes => {
    res.json({success: true});
  })
  .catch(err => {
    console.warn('error in inserting bill', err);
    res.status(500)
  })
});

// gets group wise balance of a user
router.post('/getGroupWiseBalance', function(req, res, next) {
  let userId = req.body.userId;
  // db.query
});

// gets total balance of a user
router.post('/getTotalBalance', function(req, res, next) {
  dbs.query('select * from "user"')
  .then(dbRes => {
    res.send(dbRes)
  })
});

module.exports = router;

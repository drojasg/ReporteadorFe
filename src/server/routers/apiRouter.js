
var express = require('express'),
    router = express(),
    api = require('../controllers/apiController')
;

router.get('/', api.index);
router.get('/FRM/hash/:hash', api.getUserHash);
router.post('/AUTH/logout', api.postLogout);
router.get('/FRM/menu', api.getMenu);


module.exports = router;

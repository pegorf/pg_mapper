var express = require('express');
var router = express.Router();


/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

var coords_fiorino = {"coordinates":[-47.985,-21.132]};
var coords_strada =  {"coordinates":[-47.985,-21.132]};

/* GET the map page */
router.get('/map', function(req, res) {
  res.render('map', {
    title: "Mapa Ribeirania",
  });
}); //end of map render


// module.exports = function(_io) {
// 	return router;
// };



module.exports = router;

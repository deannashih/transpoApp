var express = require('express');
var router = express.Router();
var request = require('request');
var moment = require('moment');
var async = require('async');
var Location = require('../models/location')

router.get('/', function(req, res) {
  console.log("get req.body", req.body);
  Location.find({}, function(err, locations) {
    if (err) return res.status(400).send(err);
    console.log("get locations", locations);
    res.send(locations);
  })
});

router.post('/currentPosition', function(req, res) {
    console.log("req.body current position", req.body);
    var lat = req.body.lat;
    var long = req.body.long;
    request(`https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${long}&result_type=street_address&key=AIzaSyCAwroDQHkIDCAthjHtGDijl1BeuG-3mr4`, function(err, response, body) {


        if (err) return res.status(400).send(err);

        body = JSON.parse(body);
        var address = body.results[0].formatted_address.split(', ');
        var city = address[1];
        var state = address[2].split(' ');
        state = state[0];
        var country = address[3];


        country = country.toLowerCase().split('');
        country = country.splice(0, 2).join('').toLowerCase();
        state = state.toLowerCase();



        console.log("country", country);
        console.log("state", state);

        //new york -73.9968231;40.7351595
        //san francisco -122.4194;37.7749
        request(`http://${process.env.NAVITIA_ACCESS}@api.navitia.io/v1/coord/${long};${lat}/places_nearby?distance=16904&count=100&type[]=stop_area&filter=physical_mode.uri=physical_mode:Metro`, function(err, response2, body2) {
          if (err) {
            console.log("err body2", err);
            return res.status(400).send(err);
          }
          body2 = JSON.parse(body2);
          console.log("body 2", body2);

          var long2 = body2.places_nearby[0].stop_area.coord.lon;
          var lat2 = body2.places_nearby[0].stop_area.coord.lat;
          var nearestStation = body2.places_nearby[0].stop_area.name;
          var miles = parseInt(body2.places_nearby[0].distance) * 0.00062137;
          console.log("nearestStation", nearestStation);

          var dateTime = new Date();
          console.log("dateTimeBefore", dateTime);
          var localDateTimeOffset = dateTime.getTimezoneOffset();
          // var localDateTime =
          // console.log("localDateTime", localDateTime);
          var date = dateTime.toISOString().substring(0, 10);
          date = date.split('-').join('');
          var time = dateTime.toLocaleTimeString('en-US', {
            hour12: false
          });
          time = 'T' + time.split(':').join('').substring(0, 4);
          console.log("time", time);
          dateTime = date + time;

          request(`https://${process.env.NAVITIA_ACCESS}@api.navitia.io/v1/coverage/${country}-${state}/physical_modes/physical_mode:Metro/coords/${long2};${lat2}/stop_schedules/departures?from_datetime=${dateTime}&count=100`, function(err, response3, body3) {

            if (err) return res.status(400).send(err);

            body3 = JSON.parse(body3);
            console.log("body 3", body3);

            var departureObj = body3.departures.reduce(function(acc, departure) {
              var direction = departure.display_informations.direction;
              console.log("direction", direction);
              var timeStr = departure.stop_date_time.departure_date_time;

              time = moment(timeStr).format("MM/DD/YYYY, h:mm a");

              if (acc[direction]) {
                acc[direction].push(time);
              } else {
                acc[direction] = [time];
              }
              return acc;
            }, {})


            var location = {
              "lat": lat,
              "long": long,
              "city": city,
              "state": state.toUpperCase(),
              "nearestStation": nearestStation,
              "miles":miles
            }
            var result = [departureObj, location];
            console.log("departureObj", departureObj);
            console.log("result", result);
            res.send(result);
          })
        })




        //--

        // request(`https://${process.env.NAVITIA_ACCESS}@api.navitia.io/v1/coord/${long};${lat}/places_nearby?distance=10000&type[]=stop_area`, function(err, response2, body2) {
        //   if (err) return res.send(err);
        //
        //   body2 = JSON.parse(body2);
        //   console.log("body2", body2);
        //
        //   findMetro(0, body2.places_nearby);
        //
        //   function findMetro(i, arr){
        //     console.log("body2.places_nearby", body2.places_nearby.length);
        //     if (body2.places_nearby[i].stop_area==='undefined'){
        //       res.send("there are no nearby metros.")
        //     }
        //     var long = body2.places_nearby[i].stop_area.coord.lon;
        //     var lat = body2.places_nearby[i].stop_area.coord.lat;
        //     console.log("long", long);
        //     console.log("lat", lat);
        //
        //     var dateTime = new Date();
        //     var date = dateTime.toISOString().substring(0, 10);
        //     date = date.split('-').join('');
        //     var time = dateTime.toISOString().substring(10, 16).split(':').join('');
        //     dateTime = date + time;
        //
        //     request(`https://${process.env.NAVITIA_ACCESS}@api.navitia.io/v1/coverage/us-ca/physical_modes/physical_mode:Metro/coords/${long};${lat}/stop_schedules/departures?from_datetime=${dateTime}`, function(err, response3, body3){
        //       if (body3.indexOf('error') !== -1){
        //         findMetro(i+1, arr);
        //       } else {
        //         console.log("body3.departures", JSON.parse(body3));
        //         body3 = JSON.parse(body3);
        //         var departureObj = body3.departures.reduce(function(acc, departure) {
        //               var direction = departure.display_informations.direction;
        //               var timeStr = departure.stop_date_time.departure_date_time;
        //
        //               time = moment(timeStr).format("MM/DD/YYYY, h:mm a");
        //
        //               if (acc[direction]) {
        //                 acc[direction].push(time);
        //               } else {
        //                 acc[direction] = [time];
        //               }
        //               return acc;
        //               }, {})
        //               var location = {
        //                 "lat":lat,
        //                 "long":long,
        //                 "city":city,
        //                 "state":state.toUpperCase()
        //               }
        //               var result = [departureObj, location];
        //               console.log("result", result);
        //               res.send(result);
        //       }
        //     })
        //   } //end function findMetro
        //
        // })

      }) //end google api request
  }) //end post current location

router.post('/', function(req, res) {
  console.log("req.body", req.body);
  Location.create(req.body, function(err, newLocation) {
    if (err) return res.status(400).send(err);
    console.log("new Location", newLocation);
    Location.find({}, function(err, locations) {
      console.log("post find locations", locations);
      res.send(locations);
    })
  })
});

router.post('/:savedId', function(req, res) {
    console.log("req.params.id", req.params.savedId);
    console.log("req.body of saved id", req.body);

    var lat = req.body.lat;
    var long = req.body.long;
    request(`https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${long}&result_type=street_address&key=AIzaSyCAwroDQHkIDCAthjHtGDijl1BeuG-3mr4`, function(err, response, body) {
        if (err) return res.send(err);

        body = JSON.parse(body);
        var address = body.results[0].formatted_address.split(', ');
        var city = address[1];
        var state = address[2].split(' ');
        state = state[0];
        var country = address[3];


        country = country.toLowerCase().split('');
        country = country.splice(0, 2).join('');
        state = state.toLowerCase();

        request(`https://${process.env.NAVITIA_ACCESS}@api.navitia.io/v1/coord/${long};${lat}/stop_areas?distance=10000`, function(err, response2, body2) {
            if (err) return res.send(err);

            body2 = JSON.parse(body2);
            console.log("body2", body2);

            findMetro(0, body2.places_nearby);

            function findMetro(i, arr) {
              console.log("body2.places_nearby", body2.places_nearby.length);
              if (body2.places_nearby[i].stop_area === 'undefined') {
                res.send("there are no nearby metros.")
              }
              var long = body2.places_nearby[i].stop_area.coord.lon;
              var lat = body2.places_nearby[i].stop_area.coord.lat;
              console.log("long", long);
              console.log("lat", lat);

              var dateTime = new Date();
              var date = dateTime.toISOString().substring(0, 10);
              date = date.split('-').join('');
              var time = dateTime.toISOString().substring(10, 16).split(':').join('');
              dateTime = date + time;

              request(`https://${process.env.NAVITIA_ACCESS}@api.navitia.io/v1/coverage/us-ca/physical_modes/physical_mode:Metro/coords/${long};${lat}/stop_schedules/departures?from_datetime=${dateTime}`, function(err, response3, body3) {
                if (body3.indexOf('error') !== -1) {
                  findMetro(i + 1, arr);
                } else {
                  console.log("body3.departures", JSON.parse(body3));
                  body3 = JSON.parse(body3);
                  var departureObj = body3.departures.reduce(function(acc, departure) {
                    var direction = departure.display_informations.direction;
                    var timeStr = departure.stop_date_time.departure_date_time;

                    time = moment(timeStr).format("MM/DD/YYYY, h:mm a");

                    if (acc[direction]) {
                      acc[direction].push(time);
                    } else {
                      acc[direction] = [time];
                    }
                    return acc;
                  }, {})
                  var location = {
                    "lat": lat,
                    "long": long,
                    "city": city,
                    "state": state.toUpperCase()
                  }
                  var result = [departureObj, location];
                  console.log("result", result);
                  res.send(result);
                }
              })
            } //end function findMetro

          }) //end outer navitia request

      }) //end google api request


  }) //end post to saved id

router.post('/home', function(req, res) {
  Location.create(req.body, function(err, homeLocation) {
    if (err) return res.status(400).send(err);
    console.log("home Location", homeLocation);
    res.send(homeLocation);
  })
})

router.delete('/', function(req, res) {
  Location.remove({}, function(err, locations) {
    res.send();
  })
})

module.exports = router;

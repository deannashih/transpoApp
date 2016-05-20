angular.module('transpoApp.controllers', [])

.controller('FaveCtrl', function($scope, $cordovaGeolocation, HomeService, $state) {

  var options = {
    timeout: 5000,
    enableHighAccuracy: true
  };

  $cordovaGeolocation.getCurrentPosition(options).then(function(position) {

    var latLng = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);

    var mapOptions = {
      center: latLng,
      zoom: 15,
      mapTypeId: google.maps.MapTypeId.ROADMAP
    };

    $scope.map = new google.maps.Map(document.getElementById("map"), mapOptions);

    HomeService.getLocations()
      .then(function(locationsArr) {
        console.log("get res. data", locationsArr);
        $scope.locations = locationsArr;
          var infowindow = new google.maps.InfoWindow();

          for (var i = 0; i < $scope.locations.length; i++) {

            var marker = new google.maps.Marker({
                map: $scope.map,
                animation: google.maps.Animation.DROP,
                position: new google.maps.LatLng($scope.locations[i].lat, $scope.locations[i].long),
                title: $scope.locations[i]._id
              });
              console.log("marker.position", marker.position);
              google.maps.event.addListener(marker, 'click', function(){
                var selectedLocation = {
                  lat: this.position.lat(),
                  long: this.position.lng(),
                  id: this.title
                }
                console.log("savedLocation", selectedLocation);

                HomeService.passSavedLocation(selectedLocation)
                .then(function(res){
                  console.log("pass Saved location res", res.data);
                })

                  $state.go('tab.favorites-detail', {
                    'id':marker.title
                  })
                  // infowindow.setContent('<h3>' + this.title + '</h3>');
                  // infowindow.open(map, this);

              });

            }//end for loop

        });
      })


  })

.controller('HomeCtrl', function($scope, HomeService, $cordovaGeolocation, $http, API) {
  // With the new view caching in Ionic, Controllers are only called
  // when they are recreated or on app start, instead of every page change.
  // To listen for when this page is active (for example, to refresh data),
  // listen for the $ionicView.enter event:
  //
  //$scope.$on('$ionicView.enter', function(e) {
  //});

  var posOptions = {
    timeout: 10000,
    enableHighAccuracy: false
  };
  $scope.location = {};
  $cordovaGeolocation
    .getCurrentPosition(posOptions)
    .then(function(position) {
        var lat = position.coords.latitude
        var long = position.coords.longitude
        console.log("lat", lat);
        console.log("long", long);
        $scope.location.lat = lat;
        $scope.location.long = long;

        $scope.setAsHome = function(location) {
          console.log("location", location);
          HomeService.saveHomeLocation(location)
            .then(function(res) {
              console.log("post res", res.data)
            }, function(err) {

            })
        }

        //36.1699,-115.1398 las vegas
        //37.7749,-122.4194 san francisco
        console.log("$scope.user", $scope.user);
        $scope.locationLoaded = false;
        HomeService.sendCurrentLocation($scope.location)
        .then(function(res){
          $scope.locationLoaded = true;
          console.log("send current location res", res.data);
          $scope.location.departures = res.data[0];
          $scope.location.currentCity = `${res.data[1].city}, ${res.data[1].state}`;
          $scope.location.nearestStation = res.data[1].nearestStation;
          $scope.location.miles = res.data[1].miles.toFixed(2);
          $scope.quantity = 5;
          $scope.limited = true;
          $scope.seeMore = function(){
            $scope.limited = false;
            this.quantity = $scope.quantity;
            this.quantity = this.times.length;
          }
          $scope.hide = function(){
            $scope.limited = true;
            $scope.notLimited = true;
            this.quantity = 5;
          }
          console.log("$scope location departures", $scope.location.departures);
          $scope.saveLocation = function(location) {

            if ($scope.user){
              console.log("$scope.location", $scope.location);
              console.log("saveLocation location", location);
              HomeService.saveLocation(location)
              .then(function(res) {
                console.log("save location res", res.data);
                HomeService.getLocations()
                .then(function(locationsArr){
                  $scope.locations = locationsArr;
                  $state.go('tab.favorites');
                })

              })
            } else {
              alert('you must be logged in to save locations');
            }
        }


        }, function(err){

        })


    //     $http.get(`https://maps.googleapis.com/maps/api/geocode/json?latlng=37.7749,-122.4194&result_type=street_address&key=AIzaSyCAwroDQHkIDCAthjHtGDijl1BeuG-3mr4`)
    //       .then(function(res) {
    //         console.log("google api res", res.data);
    //
    //         var address = res.data.results[0].formatted_address.split(', ');
    //         console.log("address", address);
    //         var city = address[1];
    //         var state = address[2].split(' ');
    //         state = state[0];
    //         var country = address[3];
    //         console.log("state", state);
    //
    //         $scope.location.lat = res.data.results[0].geometry.location.lat;
    //         $scope.location.long = res.data.results[0].geometry.location.lng;
    //
    //         $scope.location.currentCity = `${city}, ${state}`;
    //
    //         country = country.toLowerCase().split('');
    //         console.log("country", country);
    //         country = country.splice(0, 2).join('');
    //         state = state.toLowerCase();
    //
    //
    //         $scope.saveLocation = function(location) {
    //           console.log("$scope.location", $scope.location);
    //           console.log("saveLocation location", location);
    //           HomeService.saveLocation(location)
    //             .then(function(res) {
    //               console.log("save location res", res.data);
    //               getAllLocations();
    //
    //             })
    //         }
    //
    //         $scope.error = false;
    //
    //         $http.get(`
    // https://api.navitia.io/v1/coverage/${country}-${state}/places?q=%20${city}`, {
    //             headers: {
    //               Authorization: 'Basic ' + btoa(token + ":" + pwd)
    //             }
    //           })
    //           .then(function(res) {
    //             console.log("navitia res", res.data);
    //             var stopArea;
    //             for (var i=0; i<res.data.places.length; i++){
    //               stopArea = res.data.places[i].id;
    //
    //             }
    //             console.log("stopArea", stopArea);
    //             var dateTime = new Date();
    //             var date = dateTime.toISOString().substring(0, 10);
    //             date = date.split('-').join('');
    //             console.log("date", date);
    //             var time = dateTime.toISOString().substring(10, 16).split(':').join('');
    //             console.log("time", time);
    //             dateTime = date + time;
    //             console.log("dateTime", dateTime);
    //
    //             $http.get(`https://api.navitia.io/v1/coverage/${country}-${state}/stop_areas/${stopArea}/physical_modes/`, {
    //                 headers: {
    //                   Authorization: 'Basic ' + btoa(token + ":" + pwd)
    //                 }
    //               })
    //               .then(function(res) {
    //                 console.log("physical modes res", res.data);
    //                 var physicalMode = res.data.physical_modes[0].id;
    //
    //
    //                 $http.get(`https://api.navitia.io/v1/coverage/${country}-${state}/stop_areas/${stopArea}/physical_modes/${physicalMode}/departures?from_datetime=${dateTime}`, {
    //                     headers: {
    //                       Authorization: 'Basic ' + btoa(token + ":" + pwd)
    //                     }
    //                   })
    //                   .then(function(res) {
    //                     console.log("stop area res.data", res.data);
    //
    //                     var result = res.data.departures.reduce(function(acc, departure) {
    //                       var direction = departure.display_informations.direction;
    //                       var time = departure.stop_date_time.departure_date_time;
    //
    //                       time = time.replace('T', '');
    //                       time = new Date(time.slice(0, 4), time.slice(4, 6), time.slice(6, 8), time.slice(8, 10), time.slice(10, 12)).toString();
    //
    //                       console.log("time", time);
    //
    //                       if (acc[direction]) {
    //                         acc[direction].push(time);
    //                       } else {
    //                         acc[direction] = [time];
    //                       }
    //                       return acc;
    //                     }, {})
    //                     console.log("result", result);
    //                     $scope.location.departures = result;
    //
    //                   })
    //               }, function(err) {
    //                 console.log("error!!! this region is not covered");
    //
    //               })
    //
    //
    //
    //
    //
    //
    //           }, function(err) {
    //             console.error("error!!! this region is not covered", err);
    //             $scope.error = true;
    //
    //           })
    //
    //       }, function(err) {
    //         // error
    //         console.error("error!!! this region is not covered", err);
    //       });
      },
      function(err) {

      });




})

.controller('FaveDetailCtrl', function($scope, $stateParams, Chats) {
  $scope.chat = Chats.get($stateParams.chatId);
})

.controller('AboutCtrl', function($scope) {
  $scope.settings = {
    enableFriends: true
  };
})
.controller('authCtrl', function($scope){
  console.log("authCtrl");
  console.log("$scope.user", $scope.user);
});

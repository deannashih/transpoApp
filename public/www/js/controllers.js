angular.module('transpoApp.controllers', [])

.controller('FaveCtrl', function($scope, $cordovaGeolocation, HomeService, $state) {

  $scope.locationLoaded = false;

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
              google.maps.event.addListener(marker, 'click', function(){
                var selectedLocation = {
                  lat: this.position.lat(),
                  long: this.position.lng(),
                  id: this.title
                }
                console.log("selectedLocation", selectedLocation);

                HomeService.passSavedLocation(selectedLocation)
                .then(function(returnedData){
                  $scope.locationLoaded = true;
                  $state.go('tab.favorites-detail', {
                    'id':selectedLocation.id
                  })
                })


              });

            }//end for loop

        });
      }) //end cordovaGeolocation


  })
  .controller('FaveDetailCtrl', function($scope, HomeService, $cordovaGeolocation, $http, API, $state){
    console.log("fave detail ctrl loaded");
    $scope.location = {};
    HomeService.getSavedLocation()
    .then(function(res){
      console.log("getSavedLocation res", res[0]);

      var newData = res[0];
      $scope.locationLoaded = true;
      $scope.location.departures = newData[0];
      $scope.location.currentCity = `${newData[1].city}, ${newData[1].state}`;
      $scope.location.nearestStation = newData[1].nearestStation;
      $scope.location.miles = newData[1].miles.toFixed(2);
    })


  })

.controller('HomeCtrl', function($scope, HomeService, $cordovaGeolocation, $http, API, $state) {
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
          console.log("$scope.location.departures", $scope.location.departures);
          $scope.location.currentCity = `${res.data[1].city}, ${res.data[1].state}`;
          $scope.location.nearestStation = res.data[1].nearestStation;
          $scope.location.miles = res.data[1].miles.toFixed(2);

          $scope.statuses = {};

          for (var line in $scope.location.departures){
              console.log("line", line);
              $scope.statuses[line] = {
                quantity:5,
                limited:true
              }
          }

          $scope.seeMore = function(route){
            $scope.statuses[route].limited = false;
            $scope.statuses[route].quantity = this.times.length;
          }
          $scope.hide = function(route){
            $scope.statuses[route].limited = true;
            $scope.statuses[route].quantity = 5;
          }
          console.log("$scope location departures", $scope.location.departures);
          $scope.saveLocation = function(location) {


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

        }


        }, function(err){

        })

      },
      function(err) {

      });




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

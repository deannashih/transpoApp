'use strict';
angular.module('transpoApp.services', [])

.service('HomeService', function($http, API, $q) {

  var deferred = $q.defer();

  this.data = [];

  this.getHomeLocation = function(){
    return $http.get(API.url + `locations`)
  }

  this.saveHomeLocation = function(location) {
    return $http.post(API.url + `locations/home`, location);
  }

  this.getLocations = function(){
    return $http.get(API.url + `locations`)
    .then (res => {
      console.log("service res", res.data);
      deferred.resolve(res.data);
      // this.data = res.data;
      return deferred.promise;
    }, function(err){
      deferred.reject(err);
      return deferred.promise;
    });
  }

  this.sendCurrentLocation = function(position){
    return $http.post(API.url + `locations/currentPosition`, position);
  }

  this.saveLocation = function(location) {
    return $http.post(API.url + `locations`, location);
  }

  this.passSavedLocation = function(marker){
    console.log("marker", marker);
    var savedId = marker.id;
    return $http.post(API.url + `locations/${savedId}`, marker)
  }

});

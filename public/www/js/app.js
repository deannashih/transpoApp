// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
// 'starter.services' is found in services.js
// 'starter.controllers' is found in controllers.js
angular.module('transpoApp', ['ionic', 'transpoApp.controllers', 'transpoApp.services', 'ngCordova'])
  .constant('API', {
    url: 'http://public-transportation-app.herokuapp.com/'
  })
  .run(function($ionicPlatform) {
    $ionicPlatform.ready(function() {
      // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
      // for form inputs)
      if (window.cordova && window.cordova.plugins && window.cordova.plugins.Keyboard) {
        cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
        cordova.plugins.Keyboard.disableScroll(true);

      }
      if (window.StatusBar) {
        // org.apache.cordova.statusbar required
        StatusBar.styleDefault();
      }
    });
  })
  .config(['$httpProvider', function($httpProvider) {
    $httpProvider.defaults.useXDomain = true;
    $httpProvider.interceptors.push(function() {
      return {
        request: function(config) {
          config.withCredentials = false;
          return config;
        }
      };
    })
    delete $httpProvider.defaults.headers.common['X-Requested-With'];
  }])
  .config(function($stateProvider, $urlRouterProvider) {

      // Ionic uses AngularUI Router which uses the concept of states
      // Learn more here: https://github.com/angular-ui/ui-router
      // Set up the various states which the app can be in.
      // Each state's controller can be found in controllers.js
      $stateProvider

      // setup an abstract state for the tabs directive
        .state('tab', {
        url: '/tab',
        abstract: true,
        templateUrl: 'templates/tabs.html'
      })

      // Each tab has its own nav history stack:

      .state('tab.home', {
        url: '/home',
        views: {
          'tab-home': {
            templateUrl: 'templates/home.html',
            controller: 'HomeCtrl'
          }
        }
      })

      .state('tab.favorites', {
          url: '/favorites',
          views: {
            'tab-favorites': {
              templateUrl: 'templates/favorites.html',
              controller: 'FaveCtrl'
            },
            sp: {
              authenticate: true
            }
          }
        })
        .state('tab.favorites-detail', {
          url: '/favorites/{id}',
          views: {
            'tab-favorites': {
              templateUrl: 'templates/favorites-detail.html',
              controller: 'FaveDetailCtrl'
            }
          }
        })
      .state('tab.about', {
        url: '/about',
        views: {
          'tab-about': {
            templateUrl: 'templates/about.html',
            controller: 'AboutCtrl'
          }
        }
      });
    // if none of the above states are matched, use this as the fallback
    $urlRouterProvider.otherwise('tab/home');

  });

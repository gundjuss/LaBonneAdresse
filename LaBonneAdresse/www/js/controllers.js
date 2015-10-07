angular.module('starter.controllers', [])

.controller('DashCtrl', function ($scope, $cordovaNetwork, $cordovaGeolocation, $cordovaDevice, $cordovaSocialSharing) {
    console.log("salope");
    $scope.checkConnection = function () {
        var isConnect = $cordovaNetwork.isOnline();
        if (isConnect == true) {
            alert('Vous avez bien une connection à internet');
        } else {
            alert("vous n'êtes pas connecté à internet");
        }
        document.addEventListener("deviceready", function () {

            var device = $cordovaDevice.getDevice();
            alert("device : " + device);

            var cordova = $cordovaDevice.getCordova();

            var model = $cordovaDevice.getModel();

            var platform = $cordovaDevice.getPlatform();

            var uuid = $cordovaDevice.getUUID();

            var version = $cordovaDevice.getVersion();

        }, false);
    }
    $scope.getMyPosition = function () {
        var posOptions = { timeout: 10000, enableHighAccuracy: false };
        $cordovaGeolocation
          .getCurrentPosition(posOptions)
          .then(function (position) {
              var lat = position.coords.latitude
              var long = position.coords.longitude
              alert("Vous êtes en :\nLatitude : " + lat + "\nLongitude : " + long);
          }, function (err) {
              alert("Une erreur a été rencontré lors de l'acquisition de votre position");
          });
    }
    $scope.shareMyIdea = function () {
        $cordovaSocialSharing
        .share('Ceci est un text', 'heureux', null, 'http://www.google.com') // Share via native share sheet
        .then(function (result) {
            console.log("Okay : " + result);
        }, function (err) {
            console.log("Erreur : " + err);
        });
    }
})

.controller('ChatsCtrl', function ($scope, Chats) {
    // With the new view caching in Ionic, Controllers are only called
    // when they are recreated or on app start, instead of every page change.
    // To listen for when this page is active (for example, to refresh data),
    // listen for the $ionicView.enter event:
    //
    //$scope.$on('$ionicView.enter', function(e) {
    //});

    $scope.chats = Chats.all();
    $scope.remove = function (chat) {
        Chats.remove(chat);
        navigator.vibration(3000);
    };
})

.controller('ChatDetailCtrl', function ($scope, $stateParams, Chats) {
    $scope.chat = Chats.get($stateParams.chatId);
})

.controller('AccountCtrl', function ($scope) {
    $scope.settings = {
        enableFriends: true
    };
});

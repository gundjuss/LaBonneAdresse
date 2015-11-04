angular.module('starter.controllers', [])

.controller('DashCtrl', function ($scope, $cordovaNetwork, $cordovaGeolocation, $cordovaDevice, $cordovaSocialSharing) {
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

.controller('AccountCtrl', function ($scope, $cordovaGeolocation) {
    $scope.settings = {
        enableFriends: true
    };
    $scope.testPlace = function () {
        var latGeo;
        var lngGeo;
        var posOptions = { timeout: 10000, enableHighAccuracy: false };
        document.getElementById("feedback").innerHTML = "<font color='blue'>Recherche de votre position...</font>";
        $cordovaGeolocation
             .getCurrentPosition(posOptions)
             .then(function (position) {
                 latGeo = position.coords.latitude;
                 lngGeo = position.coords.longitude;
                 document.getElementById("feedback").innerHTML = "<font color='green'>Position trouvée !</font>";
                 initMap(latGeo, lngGeo);
             }, function (err) {
                 alert("Une erreur a été rencontré lors de l'acquisition de votre position\nVeuillez Recommencez");
                 //console.log("Une erreur a été rencontré lors de l'acquisition de votre position");
             });

    }
});

function initMap(latGeo, lngGeo) {

    var pyrmont = { lat: latGeo, lng: lngGeo };

    map = new google.maps.Map(document.getElementById('map'), {
        center: pyrmont,
        zoom: 15
    });

    var marker = new google.maps.Marker({
        position: new google.maps.LatLng(latGeo, lngGeo),
        map: map,
        icon: "http://maps.google.com/mapfiles/ms/icons/blue-dot.png"
    });

    infowindow = new google.maps.InfoWindow();
    var service = new google.maps.places.PlacesService(map);
    service.nearbySearch({
        location: pyrmont,
        radius: 500,
        types: ['store']
    }, callback);
}

function callback(results, status) {
    if (status === google.maps.places.PlacesServiceStatus.OK) {
        var string = "";
        for (var i = 0; i < results.length; i++) {
            createMarker(results[i]);
            string += "<a class='item item-avatar' href='#'>" +
                      "<img src=" + results[i].icon + ">" +
                      "<h2>" + results[i].name + "</h2>" +
                      "<p>" + results[i].vicinity + "</p>";
            if (results[i].rating == undefined) {
                string += "<p><i>Note non renseignée</i></p>";
            } else {
                string += "<p>Note : " + results[i].rating + "/5 </p>";
            }
            string += "</a>";
        }
        document.getElementById("list").innerHTML = string;
    } else {
        alert("error callback");
    }
}

function createMarker(place) {
    var placeLoc = place.geometry.location;
    var marker = new google.maps.Marker({
        map: map,
        position: place.geometry.location
    });

    google.maps.event.addListener(marker, 'click', function () {
        infowindow.setContent(place.name);
        infowindow.open(map, this);
    });
}

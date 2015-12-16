angular.module('starter.controllers')

.controller('AccountCtrl', function ($scope, $cordovaGeolocation) {
    $scope.settings = {
        enableFriends: true
    };
    $scope.testPlace = function () {
        var latGeo1;
        var lngGeo;
        listPlace = "";
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
             });
    }
})

.controller('detailCtrl', function ($scope, $cordovaGeolocation, $stateParams) {
    var param1 = $stateParams.placeId;
    requestForMore(param1);
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

function callback(results, status, $scope) {
    if (status === google.maps.places.PlacesServiceStatus.OK) {
        var string = "";
        for (var i = 0; i < results.length; i++) {
            createMarker(results[i]);
            //string += "<a class='item item-avatar' href='tel:" + results[i].international_phone_number + "'>" +
            string += "<a class='item item-avatar' href='#/tab/place/" + results[i].place_id + "'>" +
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
        alert("error callback , status : " + status);
    }
}



function requestForMore(_idPlace) {
    var service = new google.maps.places.PlacesService(map);
    service.getDetails({
        placeId: _idPlace
    }, function (place, status) {
        if (status === google.maps.places.PlacesServiceStatus.OK) {
            putDataOnView(place);
        }
    });
}

function putDataOnView(_theData) {
    var theData = _theData;

    document.getElementById("nomEta").innerHTML = theData.name;

    /*theData.types.forEach(function (entry) {
        document.getElementById("types").innerHTML += entry + " ,";
    });*/

    document.getElementById("adress").innerHTML = theData.formatted_address;
    if (theData.international_phone_number != 'undefined') {
        document.getElementById("phone").innerHTML = "<a class='item item-avatar' href='tel:" + theData.international_phone_number + "'> Téléphone : " + theData.international_phone_number + "</a>";
    } else {
        alert("pas de num");
    }

    if (theData.photos != 'undefined') {
        var test = theData.photos[0].getUrl({ 'maxWidth': 500, 'maxHeight': 500 });
        document.getElementById("pictureEtat").innerHTML = "<img src='" + test + "'/>";
    } else {
        alert("b :" + theData.photos);
    }

    var pyrmont = theData.geometry.location;
    alert("location : " + theData.geometry.location);
    map = new google.maps.Map(document.getElementById('mapDetail'), {
        center: pyrmont,
        zoom: 15
    });

    var marker = new google.maps.Marker({
        position: pyrmont,
        map: map,
        icon: "http://maps.google.com/mapfiles/ms/icons/blue-dot.png"
    });
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
        requestForMore(place.place_id);
    });
}
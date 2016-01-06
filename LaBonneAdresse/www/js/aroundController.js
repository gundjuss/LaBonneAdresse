angular.module('starter.controllers')

.controller('AccountCtrl', function ($scope, $cordovaGeolocation, $cordovaSocialSharing) {
    $scope.settings = {
        enableFriends: true
    };
    $scope.testPlace = function () {
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

.controller('detailCtrl', function ($scope, $cordovaGeolocation, $stateParams, $cordovaSocialSharing, $cordovaSQLite) {
    var test = "";
    var param1 = $stateParams.placeId;
    var param2 = $stateParams.website;

    

    

    var posOptions = { timeout: 10000, enableHighAccuracy: false };
    $cordovaGeolocation
         .getCurrentPosition(posOptions)
         .then(function (position) {
             latGeo = position.coords.latitude;
             lngGeo = position.coords.longitude;
             var pyrmont = { lat: latGeo, lng: lngGeo };
             map2 = new google.maps.Map(document.getElementById('mapDetail'), {
                 center: pyrmont,
                 zoom: 15
             });
         }, function (err) {
             alert("Une erreur a été rencontré lors de l'acquisition de votre position\nVeuillez Recommencez");
         });

    var service = new google.maps.places.PlacesService(map);
    service.getDetails({
        placeId: param1
    }, function (place, status) {
        if (status === google.maps.places.PlacesServiceStatus.OK) {
            var db = $cordovaSQLite.openDB({ name: "laBonneAdresse.db" });
            putDataOnView(place);
            var query = "SELECT name FROM Etablissement WHERE reference like '" + place.place_id + "' ";
            $cordovaSQLite.execute(db, query).then(function (res) {
                if (res.rows.length > 0) {
                    document.getElementById("buttonDB").innerHTML = "Supprimer l'établissement";
                } else {
                    document.getElementById("buttonDB").innerHTML = "Enregistrer l'établissement";
                }
            }, function (err) {
                console.error(err);
            });
            
            $scope.shareMyIdea = function () {
                $cordovaSocialSharing
                .share('Cet établissement devrais vous interesser :' + param2 + ". Tel :" + place.international_phone_number, 'Partage via La Bonne Adresse', null, place.url) // Share via native share sheet
                .then(function (result) {
                    console.log("Okay : " + result);
                }, function (err) {
                    console.log("Erreur : " + err);
                });
            }

            $scope.executeDatabase = function () {
                //$cordovaSQLite.deleteDB("laBonneAdresse.db");
                
                var query = "SELECT name FROM Etablissement WHERE reference like '" + place.place_id + "' ";
                $cordovaSQLite.execute(db, query).then(function (res) {
                    if (res.rows.length > 0) {
                        var query = "DELETE FROM Etablissement WHERE reference like '" + place.place_id + "' ";
                        $cordovaSQLite.execute(db, query).then(function (res) {
                            document.getElementById("buttonDB").innerHTML = "Enregistrer l'établissement";
                        }, function (err) {
                            alert("l'établissement a pas pu être supprimer");
                        });
                    } else {
                        var query = "CREATE TABLE IF NOT EXISTS Etablissement(id integer primary key, reference text unique, name text, phoneNumber text,rating text, address text)";
                        $cordovaSQLite.execute(db, query).then(function (res) {
                            //console.log("table Etablissement crée");
                        }, function (err) {
                            console.error("erreur : " + err);
                        });

                        var query = "INSERT OR IGNORE INTO Etablissement (reference,name,phoneNumber,rating,address) VALUES (?,?,?,?,?)";
                        $cordovaSQLite.execute(db, query, [place.place_id, place.name, place.international_phone_number, place.rating, place.vicinity]).then(function (res) {
                            document.getElementById("buttonDB").innerHTML = "Supprimer l'établissement";
                        }, function (err) {
                            alert("l'établissement a pas pu être ajouté");
                        });
                    }
                }, function (err) {
                    console.error(err);
                });

                

                var query = "SELECT name,phoneNumber,reference FROM Etablissement";
                $cordovaSQLite.execute(db, query).then(function (res) {
                    if (res.rows.length > 0) {
                        for (var i = 0; i < res.rows.length; i++) {
                            console.log("SELECTED -> " + res.rows.item(i).name + " " + res.rows.item(i).phoneNumber);
                        }
                    } else {
                        console.log("No results found");
                    }
                }, function (err) {
                    console.error(err);
                });
            }
        } else {
            alert("Une Erreur est survenus");
        }
    })



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
            var string2 = results[i].name + "\n" + results[i].vicinity;
            string += "<a class='item item-avatar' href='#/tab/dash/" + results[i].place_id + "/" + string2 + "'>" +
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

function putDataOnView(_theData) {
    var theData = _theData;

    document.getElementById("nomEta").innerHTML = theData.name;

    document.getElementById("adress").innerHTML = theData.formatted_address;
    if (theData.international_phone_number != 'undefined') {
        document.getElementById("phone").innerHTML = "<a class='item item-avatar' href='tel:" + theData.international_phone_number + "'> Téléphone : " + theData.international_phone_number + "</a>";
    } else {
        alert("pas de num");
    }

    if (theData.photos != 'undefined') {
        var test = theData.photos[0].getUrl({ 'maxWidth': 400, 'maxHeight': 400 });
        document.getElementById("pictureEtat").innerHTML = "<img src='" + test + "'/>";
    } else {
        alert("b :" + theData.photos);
    }

    var string = "";
    for (var i = 0; i < theData.reviews.length; i++) {
        string += "<div  class='item item-text-wrap'>" +
                  "<p>" + theData.reviews[i].author_name + "</p>" +
                  "<p>" + theData.reviews[i].rating + " / 5 </p>" +
                  "<p>" + theData.reviews[i].text + "</p>";
        string += "</div>";
    }
    document.getElementById("listDetails").innerHTML = string;
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
angular.module('starter.controllers', [])

.controller('DashCtrl', function ($scope, $cordovaNetwork, $cordovaGeolocation, $cordovaSQLite) {
    var db = $cordovaSQLite.openDB({ name: "laBonneAdresse.db" });
    var query = "CREATE TABLE IF NOT EXISTS Etablissement(id integer primary key, reference text unique, name text, phoneNumber text,rating text, address text)";
    $cordovaSQLite.execute(db, query).then(function (res) {
        //console.log("table Etablissement crée");
    }, function (err) {
        console.error("erreur : " + err);
    });

    $scope.checkConnection = function () {
        var isConnect = $cordovaNetwork.isOnline();
        if (isConnect == true) {
            alert('Vous avez bien une connection à internet');
        } else {
            alert("vous n'êtes pas connecté à internet");
        }
    }

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

.controller('FavsCtrl', function ($scope, $cordovaSQLite, $http) {
    var db = $cordovaSQLite.openDB({ name: "laBonneAdresse.db" });
    var query = "SELECT name,reference,phoneNumber,reference,address FROM Etablissement";
    $cordovaSQLite.execute(db, query).then(function (res) {
        var string = "";
        if (res.rows.length > 0) {
            for (var i = 0; i < res.rows.length; i++) {
                var string2 = res.rows.item(i).name + "\n" + res.rows.item(i).address;
                string += "<a class='item' href='#/tab/fav/" + res.rows.item(i).reference + "/" + string2 + "'>" +
                      "<h2>" + res.rows.item(i).name + "</h2>" +
                      "<p>" + res.rows.item(i).address + "</p>";
                if (res.rows.item(i).rating == undefined) {
                    string += "<p><i>Note non renseignée</i></p>";
                } else {
                    string += "<p>Note : " + res.rows.item(i).rating + "/5 </p>";
                }
                string += "</a>";
            }
            document.getElementById("listFav").innerHTML = string;
        } else {
            document.getElementById("feedback2").innerHTML = "vous n'avez pas de favoris";
            document.getElementById("listFav").innerHTML = " ";
        }
    }, function (err) {
        console.error(err);
    });

    document.addEventListener('CordovaBrowser_LoadCompleted', function () {
        console.log("//**********device ready");
    }
    , false);


})

.controller('ChatDetailCtrl', function ($scope, $stateParams, Chats) {
    $scope.chat = Chats.get($stateParams.chatId);
})

    

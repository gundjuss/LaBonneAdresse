angular.module('starter.controllers', [])

.controller('DashCtrl', function ($scope, $cordovaNetwork, $cordovaGeolocation, $cordovaSQLite) {
    var db = $cordovaSQLite.openDB({ name: "laBonneAdresse.db" });
    var query = "CREATE TABLE IF NOT EXISTS Etablissement(id integer primary key, reference text unique,website text,url text, name text, phoneNumber text,rating text, address text , comments text)";
    $cordovaSQLite.execute(db, query).then(function (res) {
        //console.log("table Etablissement crée");
    }, function (err) {
        console.error("erreur : " + err);
    });

    $scope.testPlace = function () {
        var isConnect = $cordovaNetwork.isOnline();
        if (isConnect == true) {
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
        } else {
            alert("vous n'êtes pas connecté à internet");
        }

    }
})

.controller('FavsCtrl', function ($scope, $cordovaSQLite, $http) {
    var db = $cordovaSQLite.openDB({ name: "laBonneAdresse.db" });
    var query = "SELECT name,reference,phoneNumber,reference,address,website,url FROM Etablissement";
    $cordovaSQLite.execute(db, query).then(function (res) {
        var string = "";
        if (res.rows.length > 0) {
            for (var i = 0; i < res.rows.length; i++) {
                var string2 = res.rows.item(i).name + "\n" + res.rows.item(i).address;
                string += "<a class='item' href='#/tab/fav/" + res.rows.item(i).reference + "'>" +
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

    


})

.controller('ChatDetailCtrl', function ($scope, $stateParams, $cordovaSQLite, $cordovaNetwork) {
    var param1 = $stateParams.favId;
    console.log("Reference : " + param1);
    var db = $cordovaSQLite.openDB({ name: "laBonneAdresse.db" });
    var oldName;
    var oldReference;
    var oldNumber;
    var oldComment;
    var oldAdress;
    var oldWebsite;
    var oldUrl;
    var oldRating;
    var query = "SELECT name,reference,phoneNumber,comments,address,website,url,rating FROM Etablissement WHERE reference LIKE '" + param1 + "'";
    $cordovaSQLite.execute(db, query).then(function (res) {

        var string = "";
        console.log("result : " + res.rows);
        if (res.rows.length > 0) {
            oldRating = res.rows.item(0).rating;
            oldName = res.rows.item(0).name;
            oldAdress = res.rows.item(0).address;
            oldReference = res.rows.item(0).reference;
            oldNumber = res.rows.item(0).phoneNumber;
            oldComment = res.rows.item(0).comments;
            oldWebsite = res.rows.item(0).website;
            oldUrl = res.rows.item(0).url;
            document.getElementById("nomEta").innerHTML = res.rows.item(0).name;
            document.getElementById("adress").innerHTML = res.rows.item(0).address;
            document.getElementById("listDetails").innerHTML = res.rows.item(0).comments;

            
            $scope.shareMyIdea = function () {
                $cordovaSocialSharing
                .share('Cet établissement devrais vous interesser :' + res.rows.item(i).name + ". Tel :" + res.rows.item(i).phoneNumber, 'Partage via La Bonne Adresse', null, place.url) // Share via native share sheet
                .then(function (result) {
                    console.log("Okay : " + result);
                }, function (err) {
                    console.log("Erreur : " + err);
                });
            }

            if (res.rows.item(0).phoneNumber != 'undefined') {
                document.getElementById("phone").innerHTML = "<a class='item item-avatar' href='tel:" + res.rows.item(0).phoneNumber + "'> Téléphone : " + res.rows.item(0).phoneNumber + "</a>";
            } else {
                alert("pas de num");
            }

            $scope.executeDatabase = function () {
                //$cordovaSQLite.deleteDB("laBonneAdresse.db");

                var query = "SELECT name,reference,phoneNumber,reference,address,website,url FROM Etablissement WHERE reference like '" + res.rows.item(0).reference + "' ";
                $cordovaSQLite.execute(db, query).then(function (res) {
                    if (res.rows.length > 0) {
                        var query = "DELETE FROM Etablissement WHERE reference like '" + res.rows.item(0).reference + "' ";
                        $cordovaSQLite.execute(db, query).then(function (res) {
                            document.getElementById("buttonDB").innerHTML = "Enregistrer l'établissement";
                            var query = "SELECT name,reference,phoneNumber,reference,address FROM Etablissement";
                            $cordovaSQLite.execute(db, query).then(function (res) {
                                var string = "";
                                if (res.rows.length > 0) {
                                    for (var i = 0; i < res.rows.length; i++) {
                                        var string2 = res.rows.item(i).name + "\n" + res.rows.item(i).address;
                                        string += "<a class='item' href='#/tab/fav/" + res.rows.item(i).reference + "'>" +
                                              "<h2>" + res.rows.item(i).name + "</h2>" +
                                              "<p>" + res.rows.item(i).address + "</p>";
                                        if (res.rows.item(i).rating == undefined) {
                                            string += "<p><i>Note non renseignée</i></p>";
                                        } else {
                                            string += "<p>Note : " + res.rows.item(i).rating + "/5 </p>";
                                        }
                                        string += "</a>";
                                    }
                                    console.log("test : " + string);
                                    document.getElementById("listFav").innerHTML = string;
                                } else {
                                    document.getElementById("feedback2").innerHTML = "vous n'avez pas de favoris";
                                    document.getElementById("listFav").innerHTML = " ";
                                }
                            }, function (err) {
                                console.error(err);
                            });
                        }, function (err) {
                            alert("l'établissement a pas pu être supprimer");
                        });
                    } else {
                        var query = "INSERT OR IGNORE INTO Etablissement (reference,name,phoneNumber,rating,address,comments,website,url) VALUES (?,?,?,?,?,?,?,?)";
                        $cordovaSQLite.execute(db, query, [oldReference, oldName, oldNumber, oldRating, oldAdress, oldComment, oldWebsite, oldUrl]).then(function (res) {
                            document.getElementById("buttonDB").innerHTML = "Supprimer l'établissement";
                            var query = "SELECT name,reference,phoneNumber,reference,address,website,url FROM Etablissement";
                            $cordovaSQLite.execute(db, query).then(function (res) {
                                var string = "";
                                if (res.rows.length > 0) {
                                    for (var i = 0; i < res.rows.length; i++) {
                                        var string2 = res.rows.item(i).name + "\n" + res.rows.item(i).address;
                                        string += "<a class='item' href='#/tab/fav/" + res.rows.item(i).reference + "'>" +
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
                        }, function (err) {
                            alert("l'établissement a pas pu être ajouté");
                        });
                    }
                }, function (err) {
                    console.error(err);
                });
            }

        } else {
            console.log("pas de résultat trouvé");
        }
    }, function (err) {
        console.error(err);
    });


    var query = "SELECT name FROM Etablissement WHERE reference like '" + param1 + "' ";
    $cordovaSQLite.execute(db, query).then(function (res) {
        if (res.rows.length > 0) {
            document.getElementById("buttonDB").innerHTML = "Supprimer l'établissement";
        } else {
            document.getElementById("buttonDB").innerHTML = "Enregistrer l'établissement";
        }
    }, function (err) {
        console.error(err);
    });
})



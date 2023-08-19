App = {
    web3Provider: null,
    contracts: {},
    account: '0x0',

    init: async function() {
        return await App.initWeb3();
    },

    initWeb3: async function() {
        // Tryout new method of setting up web3 provider
        if (window.ethereum) {
            web3 = new Web3(web3.currentProvider);

            try {
                //Request account access
                await window.ethereum.request({ method: "eth_requestAccounts" });
            } catch (error) {
                console.error("User denied account access");
            }
            App.web3Provider = web3.currentProvider;
            console.log("modern dapp browser");
        } else if (window.web3) {
            App.web3Provider = window.web3.currentProvider;
            console.log("legacy dapp browser");
        } else {
            // If no injected web3 instance is detected, fall back to Ganache
            App.web3Provider = new Web3.providers.HttpProvider('http://localhost:7545');
        }
          
        web3 = new Web3(App.web3Provider);
        return App.initContract();
    },

    initContract: function () {
        $.getJSON('PetShop.json', function (petShop) {
            // Get the necessary contract artifact file and instantiate it with truffle-contract
            App.contracts.PetShop = TruffleContract(petShop);
            // Set the provider for our contract
            App.contracts.PetShop.setProvider(App.web3Provider);

            // Listen for event and render the page?
            App.listenForEvents();
            return App.render();
        });

        return App.bindEvents();
    },

    bindEvents: function () {
        $(document).on('click', '.btn-adopt', App.handleAdopt);
    },

    listenForEvents: function() {
        App.contracts.PetShop.deployed().then(function (instance) {
            instance.service_event({
                fromBlock: 0,
                toBlock: 'latest'
            }).watch(function (error, event) {
                console.log("service triggered", event);
                App.render();
            });
        });
    },

    render: function () {
        var petShopInstance;

        web3.eth.getCoinbase(function (err, account) {
            if (err === null) {
                App.account = account;
                $("#accountAddress").html("Your Account: " + account);
                web3.eth.getBalance(account, function (err, balance) {
                    if (err === null) {
                        $("#accountBalance").html("Your Remaining Balance: " + web3.fromWei(balance, "Ether") + " ETH");
                    }
                })
            }
        })

        App.contracts.PetShop.deployed().then(function (instance) {
            petShopInstance = instance;
            
            // Return the information of all the pets?
            return petShopInstance.pet_count();
        }).then(function(pet_count) {
            var pet_array = [];

            for (var i = 0; i < pet_count; i++) {
                pet_array.push(petShopInstance.pets(i));
            }
            Promise.all(pet_array).then(function(values) {
                var petsRow = $('#petsRow');
                petsRow.empty();
                for (var i = 0; i < pet_count; i++) {
                    var id = values[i][0]
                    var name = values[i][1];
                    var breed = values[i][2];
                    var age = values[i][3];
                    var img = values[i][4];
                    var adopted = values[i][5];
                    var vaccinated = values[i][6];
                    var neutered = values[i][7];
                    var num_of_vote = values[i][8];

                    // Show the not adopted pet in the page
                    if (adopted == false) {
                        // Choose to not use pet template for loading pet information
                        petTemplate = "";
                        // Everything until name and button id
                        petTemplate += "<div class=\"col-sm-6 col-md-4 col-lg-3\"> <div class=\"panel panel-default panel-pet\"> <div class=\"panel-heading clearfix\">";

                        // Add the name and assign data id to the button
                        petTemplate += "<h3 class=\"panel-title pull-left\">" + name + "</h3>";
                        petTemplate += "<button class=\"btn btn-default btn-adopt pull-right\" type=\"button\" data-id=\"" + id + "\">Adopt</button></div>";


                        // Add the panel body and image
                        petTemplate += "<div class=\"panel-body\">";
                        petTemplate += "<img alt=\"140x140\" data-src=\"holder.js/140x140\" class=\"img-rounded img-center\" style=\"width: 100%;\" src=\"" + img + "\" data-holder-rendered=\"true\"></img> <br/><br/>";

                        // Add Pet information
                        petTemplate += "<strong>Breed:</strong> <span class=\"pet-breed\">" + breed + "</span><br/>";
                        petTemplate += "<strong>Age:</strong> <span class=\"pet-age\">" + age + "</span><br/>";

                        if(vaccinated == false) {
                            petTemplate += "<strong>Vaccinated:</strong> <span class=\"pet-vaccination\">No</span><br/>";
                        } else {
                            petTemplate += "<strong>Vaccinated:</strong> <span class=\"pet-vaccination\">Yes</span><br/>";
                        }

                        if(neutered == false) {
                            petTemplate += "<strong>Neutered:</strong> <span class=\"pet-neutering\">No</span><br/>";
                        } else {
                            petTemplate += "<strong>Neutered:</strong> <span class=\"pet-neutering\">Yes</span><br/>";
                        }

                        // Add the service form
                        petTemplate += "<form onSubmit=\"App.castService(this); return false;\" class=\"form-inline\">";
                        petTemplate += "<div class=\"form-group\">";
                        petTemplate += "<label class=\"my-1 mr-2\" for=\"inlineFormServiceSelect\">Services: </label> </div>";

                        petTemplate += "<div class=\"form-group\"> <select class=\"form-control my-1 mr-sm-2\" id=\"inlineFormServiceSelect\">";
                        petTemplate += "<option value=\"Select\">Choose...</option><option value=\"feed\">Feed: 1ETH</option> <option value=\"toy\">Toy: 2ETH</option>";
                        
                        // If not vaccinated
                        if(vaccinated == false) {
                            petTemplate += "<option value=\"vaccinate\">Vaccinate: 5ETH</option>";
                        }

                        // If not neutered
                        if(neutered == false) {
                            petTemplate += "<option value=\"neuter\">Neuter: 10ETH</option>";
                        }

                        petTemplate +="<option value=\"spray\">Spray: 15ETH</option></select></div>";
                        petTemplate += "<button class=\"btn btn-service btn-primary my-1\" type=\"submit\" data-id=\"" + id + "\">Confirm</button>";
                        petTemplate += "</form></div></div>";

                        petsRow.append(petTemplate);
                    }
                }
            });
        }).then(function () {

        }).catch(function (error){
            console.log(error);
        });
    },

    handleAdopt: function (event) {
        event.preventDefault();
    
        var petId = parseInt($(event.target).data('id'));
    
        App.contracts.PetShop.deployed().then(function (instance) {
            return instance.adopt(petId, { from: App.account });
        }).then(function (result) {
            window.alert('Pet adopted successfully');
            App.render();
        }).catch(function (err) {
            console.log(err.message);
        });
    },

    castService: function (input) {

        var petId = input.getElementsByTagName('button')[0].attributes[2].value;
        var serviceItem = input.getElementsByTagName('select')[0].value;
        
        var ethValue;
        var serviceId;

        if (serviceItem == 'Select') {
            window.alert('Please select the service');
        } else {
            if (serviceItem == 'feed') {
                ethValue = 1;
                serviceId = 0;
            } else if (serviceItem == 'toy') {
                ethValue = 2;
                serviceId = 1;
            } else if (serviceItem == 'vaccinate') {
                ethValue = 5;
                serviceId = 2;
            } else if (serviceItem == 'neuter') {
                ethValue = 10;
                serviceId = 3;
            } else if (serviceItem == 'spray') {
                ethValue = 15;
                serviceId = 4;
            }

            App.contracts.PetShop.deployed().then(function (instance) { 
                // Get the pet information to see if the service value can be halved
                pet = instance.pets(petId);

                Promise.all([pet]).then(function(values) {
                    var num_of_vote = values[0][8];

                    if (num_of_vote >= 5) {
                        ethValue *= 0.5;
                    }
                    return instance.service(petId, serviceId, { from: App.account, value: window.web3.toWei(ethValue, 'ether')});
                }).then(function () {
                    window.alert('Pet serviced successfully');
                    App.render();
                }).catch(function (error) {
                    console.warn(error);
                })
            });
        }

    }

};

$(function() {
    $(window).on('load', function() {
        App.init();
    });
});
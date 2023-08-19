historyApp = {
    web3Provider: null,
    contracts: {},
    account: '0x0',

    init: async function() {
        return await historyApp.initWeb3();
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
            historyApp.web3Provider = web3.currentProvider;
            console.log("modern dapp browser");
        } else if (window.web3) {
            historyApp.web3Provider = window.web3.currentProvider;
            console.log("legacy dapp browser");
        } else {
            // If no injected web3 instance is detected, fall back to Ganache
            historyApp.web3Provider = new Web3.providers.HttpProvider('http://localhost:7545');
        }
          
        web3 = new Web3(historyApp.web3Provider);
        return historyApp.initContract();
    },

    initContract: function () {
        $.getJSON('../PetShop.json', function (petShop) {
            // Get the necessary contract artifact file and instantiate it with truffle-contract
            historyApp.contracts.PetShop = TruffleContract(petShop);
    
            // Set the provider for our contract
            historyApp.contracts.PetShop.setProvider(historyApp.web3Provider);

            // Listen for event and render the page?
            return historyApp.render();

        });
        return historyApp.bindEvents();
    },

    bindEvents: function () {
        $(document).on('click', '.btn-return', historyApp.handleReturn);
    },

    render: function() {
        var historyInstance;

        web3.eth.getCoinbase(function (err, account) {
            if (err === null) {
                historyApp.account = account;
                $("#accountAddress").html("Your Account: " + account);
                web3.eth.getBalance(account, function (err, balance) {
                    if (err === null) {
                        $("#accountBalance").html("Your Remaining Balance: " + web3.fromWei(balance, "Ether") + " ETH");
                    }
                })
            }
        })

        historyApp.contracts.PetShop.deployed().then(function (instance) {
            historyInstance = instance;

            return historyInstance.pet_count();
        }).then(function(pet_count) {
            var pet_array = [];

            for (var i = 0; i < pet_count; i++) {
                pet_array.push(historyInstance.pets(i));
            }

            Promise.all(pet_array).then(function(values) {
                var petsRow = $('#petsRow');
                var petTemplate = $('#petTemplate');
                petsRow.empty();

                for (var i = 0; i < pet_count; i++) {
                    var id = values[i][0]
                    var name = values[i][1];
                    var breed = values[i][2];
                    var age = values[i][3];
                    var img = '..\/' + values[i][4];
                    var adopted = values[i][5];
                    var vaccinated = values[i][6];
                    var neutered = values[i][7];
                    
                    // Show the not adopted pet in the page
                    if (adopted == true) {
                        petTemplate = "";
                        
                        // Everything until name and button id
                        petTemplate += "<div class=\"col-sm-6 col-md-4 col-lg-3\"> <div class=\"panel panel-default panel-pet\"> <div class=\"panel-heading clearfix\">";

                        // Add the name and assign data id to the button
                        petTemplate += "<h3 class=\"panel-title pull-left\">" + name + "</h3>";
                        petTemplate += "<button class=\"btn btn-default btn-return pull-right\" type=\"button\" data-id=\"" + id + "\">Return</button></div>";

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

                        petTemplate += "</div></div></div>";

                        petsRow.append(petTemplate);
                    }
                }
                
            });
        }).catch(function (error) {
            console.warn(error);
        });
    },

    handleReturn: function (event) {
        event.preventDefault();
    
        var petId = parseInt($(event.target).data('id'));
        historyApp.contracts.PetShop.deployed().then(function (instance) {
            return instance.pet_return(petId, { from: historyApp.account, value: window.web3.toWei(1, 'ether')});
        }).then(function(result) {
            window.alert('Pet returned successfully');
            historyApp.render();
        }).catch(function (error) {
            console.warn(error);
        });
    }
};

$(function() {
    $(window).on('load', function() {
      historyApp.init();
    });
});
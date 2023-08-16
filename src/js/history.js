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
                    var img = values[i][4];
                    var adopted = values[i][5];

                    // Show the not adopted pet in the page
                    if (adopted == true) {
                        petTemplate.find('.panel-title').text(name);
                        petTemplate.find('img').attr('src', '..\/' + img);
                        petTemplate.find('.pet-breed').text(breed);
                        petTemplate.find('.pet-age').text(age);
                        petTemplate.find('.btn-adopt').attr('data-id', id);

                        petsRow.append(petTemplate.html());
                    }
                }
                
            });
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
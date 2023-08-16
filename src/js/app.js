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
            // App.listenForEvnets();
            return App.render();

            // Use our contract to retrieve and mark the adopted pets
            // return App.markAdopted();
        });
    
        // return App.bindEvents();
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
                var petTemplate = $('#petTemplate');
                petsRow.empty();

                for (var i = 0; i < pet_count; i++) {
                    var id = values[i][0]
                    var name = values[i][1];
                    var breed = values[i][2];
                    var age = values[i][3];
                    var img = values[i][4];
                    var adopted = values[i][5];
                    var winner = values[i][6];

                    // Show the not adopted pet in the page
                    if (adopted == false) {
                        petTemplate.find('.panel-title').text(name);
                        petTemplate.find('img').attr('src', img);
                        petTemplate.find('.pet-breed').text(breed);
                        petTemplate.find('.pet-age').text(age);
                        petTemplate.find('.btn-adopt').attr('data-id', id);

                        petsRow.append(petTemplate.html());
                    }
                }

                
            });
        }).catch(function (err){
            console.warn(err);
        });
    },

    // bindEvents: function () {
    //     $(document).on('click', '.btn-adopt', App.handleAdopt);
    // },

    // markAdopted: function (adopters, account) {
    //     var adoptionInstance;
    
    //     App.contracts.Adoption.deployed().then(function (instance) {
    //         adoptionInstance = instance;
    //         console.log(adoptionInstance);
    //         return adoptionInstance.getAdopters.call();
    //     }).then(function (adopters) {
    //         console.log(adopters);
    //         for (i = 0; i < adopters.length; i++) {
    //             if (adopters[i] !== '0x0000000000000000000000000000000000000000') {
    //                 $('.panel-pet').eq(i).find('button').text('Success').attr('disabled', true);
    //                 // Update the json file of the adopted pet so it will show in the history instead of in the shop
    //                 // $('.panel-pet').eq(i).remove();  
    //             }
    //         }
    //         console.log($('.panel-pet'));
    //     }).catch(function (err) {
    //       console.log(err.message);
    //     });
    // },

    // handleAdopt: function (event) {
    //     event.preventDefault();
    
    //     var petId = parseInt($(event.target).data('id'));
    
    //     var adoptionInstance;
    
    //     web3.eth.getAccounts(function (error, accounts) {
    //         if (error) {
    //             console.log(error);
    //         }
    
    //         var account = accounts[0];
    
    //         App.contracts.Adoption.deployed().then(function (instance) {
    //             adoptionInstance = instance;
    
    //             // Execute adopt as a transaction by sending account
    //             return adoptionInstance.adopt(petId, { from: account });
    //         }).then(function (result) {
    //             return App.markAdopted();
    //         }).catch(function (err) {
    //             console.log(err.message);
    //         });
    //     });
    // }
};

$(function() {
    $(window).on('load', function() {
      App.init();
    });
});
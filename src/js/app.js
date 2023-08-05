App = {
    web3Provider: null,
    contracts: {},
    account: '0x0',

    init: async function() {
        $.getJSON('../pets.json', function(data) {
            var petsRow = $('#petsRow');
            var petTemplate = $('#petTemplate');

            for (i = 0; i < data.length; i ++) {
                if (data[i].adopted == false) {
                    petTemplate.find('.panel-title').text(data[i].name);
                    petTemplate.find('img').attr('src', data[i].picture);
                    petTemplate.find('.pet-breed').text(data[i].breed);
                    petTemplate.find('.pet-age').text(data[i].age);
                    petTemplate.find('.btn-adopt').attr('data-id', data[i].id);

                    // Change the vacination status and update the service display
                    if (data[i].vaccinated == true) {
                        petTemplate.find('.pet-vaccination').text('Yes');
                        petTemplate.find('#inlineFormServiceSelect')[0][3].style.display = 'none';
                    } else {
                        petTemplate.find('.pet-vaccination').text('No');
                        petTemplate.find('#inlineFormServiceSelect')[0][3].style.display = '';
                    }

                    // Change the nueter status and update the service display
                    if (data[i].neutered == true) {
                        petTemplate.find('.pet-neutering').text('Yes');
                        petTemplate.find('#inlineFormServiceSelect')[0][4].style.display = 'none';
                    } else {
                        petTemplate.find('.pet-neutering').text('No');
                        petTemplate.find('#inlineFormServiceSelect')[0][4].style.display = '';
                    }
                    
                
                    petsRow.append(petTemplate.html());
                }
                
            }
        });

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
        $.getJSON('Adoption.json', function (data) {
          // Get the necessary contract artifact file and instantiate it with truffle-contract
          var AdoptionArtifact = data;
          App.contracts.Adoption = TruffleContract(AdoptionArtifact);
    
          // Set the provider for our contract
          App.contracts.Adoption.setProvider(App.web3Provider);
    
          // Use our contract to retrieve and mark the adopted pets
          return App.markAdopted();
        });
    
        return App.bindEvents();
    },

    bindEvents: function () {
        $(document).on('click', '.btn-adopt', App.handleAdopt);
    },

    markAdopted: function (adopters, account) {
        var adoptionInstance;
    
        App.contracts.Adoption.deployed().then(function (instance) {
            adoptionInstance = instance;
    
            return adoptionInstance.getAdopters.call();
        }).then(function (adopters) {
            for (i = 0; i < adopters.length; i++) {
                if (adopters[i] !== '0x0000000000000000000000000000000000000000') {
                    $('.panel-pet').eq(i).find('button').text('Success').attr('disabled', true);
                
                    // Update the json file of the adopted pet so it will show in the history instead of in the shop
                    
                }
            }
        }).catch(function (err) {
          console.log(err.message);
        });
    },

    handleAdopt: function (event) {
        event.preventDefault();
    
        var petId = parseInt($(event.target).data('id'));
    
        var adoptionInstance;
    
        web3.eth.getAccounts(function (error, accounts) {
            if (error) {
                console.log(error);
            }
    
            var account = accounts[0];
    
            App.contracts.Adoption.deployed().then(function (instance) {
                adoptionInstance = instance;
    
                // Execute adopt as a transaction by sending account
                return adoptionInstance.adopt(petId, { from: account });
            }).then(function (result) {
                return App.markAdopted();
            }).catch(function (err) {
                console.log(err.message);
            });
        });
    }
};

$(function() {
    $(window).load(function() {
      App.init();
    });
});
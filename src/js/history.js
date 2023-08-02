historyApp = {
    web3Provider: null,
    contracts: {},
    account: '0x0',

    init: async function() {
        $.getJSON('../pets.json', function(data) {
            var petsRow = $('#petsRow');
            var petTemplate = $('#petTemplate');

            for (i = 0; i < data.length; i ++) {
                if (data[i].adopted == true) {
                    petTemplate.find('.panel-title').text(data[i].name);
                    petTemplate.find('img').attr('src', '..\/' + data[i].picture);
                    // petTemplate.find('img').attr('src', data[i].picture);    
                    petTemplate.find('.pet-breed').text(data[i].breed);
                    petTemplate.find('.pet-age').text(data[i].age);

                    // Change the vacination status
                    if (data[i].vaccinated == true) {
                        petTemplate.find('.pet-vaccination').text('Yes');
                    } else {
                        petTemplate.find('.pet-vaccination').text('No');
                    }

                    // Change the nueter status
                    if (data[i].neutered == true) {
                        petTemplate.find('.pet-neutering').text('Yes');
                    } else {
                        petTemplate.find('.pet-neutering').text('No');
                    }
                
                    petsRow.append(petTemplate.html());
                }
                
            }
        });

        return await App.initWeb3();
    },

    initWeb3: async function() {
        if (typeof web3 !== 'undefined') {

            App.web3Provider = web3.currentProvider;
          
        } else {
            // If no injected web3 instance is detected, fall back to Ganache
          
            App.web3Provider = new Web3.providers.HttpProvider('http://localhost:7545');
          
        }
          
        web3 = new Web3(App.web3Provider);
        return App.initContract();
    }
};

$(function() {
    $(window).load(function() {
      historyApp.init();
    });
});
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
      App.init();
    });
});
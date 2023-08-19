regApp = {
    web3Provider: null,
    contracts: {},
    account: '0x0',

    init: async function() {
        return await regApp.initWeb3();
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
            regApp.web3Provider = web3.currentProvider;
            console.log("modern dapp browser");
        } else if (window.web3) {
            regApp.web3Provider = window.web3.currentProvider;
            console.log("legacy dapp browser");
        } else {
            // If no injected web3 instance is detected, fall back to Ganache
            regApp.web3Provider = new Web3.providers.HttpProvider('http://localhost:7545');
        }
          
        web3 = new Web3(regApp.web3Provider);
        return regApp.initContract();
    },

    initContract: function () {
        $.getJSON('../PetShop.json', function (petShop) {
            // Get the necessary contract artifact file and instantiate it with truffle-contract
            regApp.contracts.PetShop = TruffleContract(petShop);
    
            // Set the provider for our contract
            regApp.contracts.PetShop.setProvider(regApp.web3Provider);

            regApp.listenForEvents();
            return regApp.render();
        });
    },
    
    listenForEvents: function() {
        regApp.contracts.PetShop.deployed().then(function (instance) {
            instance.register_event({
                fromBlock: 0,
                toBlock: 'latest'
            }).watch(function (error, event) {
                console.log("register triggered", event);
                return regApp.render();
            });
        });
    },

    render: function () {
        web3.eth.getCoinbase(function (err, account) {
            if (err === null) {
                regApp.account = account;
                $("#accountAddress").html("Your Account: " + account);
                web3.eth.getBalance(account, function (err, balance) {
                    if (err === null) {
                        $("#accountBalance").html("Your Remaining Balance: " + web3.fromWei(balance, "Ether") + " ETH");
                    }
                })
            }
        })
    },

    castRegister: function () {
        var vaccinate_status;
        var neuter_status;
        var form = $('#registrationForm');
        var name = $('#nameInput').val();
        var breed = $('#breedSelect').val();
        var age = $('#ageSelect').val();
        var vaccinate = $('#vaccinationSelect').val();
        var neuter = $('#neuterSelect').val();
        var img = 'images\/' + $('#breedSelect').val() + '.jpg';

        if(breed == 'Select') {
            window.alert('Please select the breed');
        } else if (age == 'Select') {
            window.alert('Please select the age');
        } else if (vaccinate == 'Select') {
            window.alert('Please select the vaccination status');
        } else if (neuter == 'Select') {
            window.alert('Please select the neuter status');   
        } else {
            (vaccinate == 'yes') ? vaccinate_status = true : vaccinate_status = false;
            (neuter == 'yes') ? neuter_status = true : neuter_status = false;
            
            regApp.contracts.PetShop.deployed().then(function (instance) {
                return instance.register(name, breed, age, img, vaccinate_status, neuter_status, {from : regApp.account});
            }).then(function (result) {
                // window.location.reload();
                window.alert('Registration Success');
                setTimeout(function() { 
                    location.reload();
                }, 3000); 
            }).catch(function (error) {
                console.error(error);
            })
        }

    }
}

$(function() {
    $(window).on('load', function() {
        regApp.init();
    });
});
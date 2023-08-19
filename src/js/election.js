electionApp = {
    web3Provider: null,
    contracts: {},
    account: '0x0',
    hasVoted: false,

    init: async function() {
        return await electionApp.initWeb3();
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
            electionApp.web3Provider = web3.currentProvider;
            console.log("modern dapp browser");
        } else if (window.web3) {
            electionApp.web3Provider = window.web3.currentProvider;
            console.log("legacy dapp browser");
        } else {
            // If no injected web3 instance is detected, fall back to Ganache
            electionApp.web3Provider = new Web3.providers.HttpProvider('http://localhost:7545');
        }
          
        web3 = new Web3(electionApp.web3Provider);
        return electionApp.initContract();
    },

    initContract: function() {
        $.getJSON("../PetShop.json", function(petShop) {
            // Get the necessary contract artifact file and instantiate it with truffle-contract
            electionApp.contracts.PetShop = TruffleContract(petShop);
    
            // Set the provider for our contract
            electionApp.contracts.PetShop.setProvider(electionApp.web3Provider);

            // Listen for event
            electionApp.listenForEvents();
            return electionApp.render();

        });
    },

    listenForEvents: function() {
        electionApp.contracts.PetShop.deployed().then(function (instance) {
            instance.vote_event({
                fromBlock: 0,
                toBlock: 'latest'
            }).watch(function (error, event) {
                console.log("vote triggered", event);
                electionApp.render();
            })
        })
    },

    render: function() {
        var electionInstance;

        web3.eth.getCoinbase(function (err, account) {
            if (err === null) {
                electionApp.account = account;
                $("#accountAddress").html("Your Account: " + account);
                web3.eth.getBalance(account, function (err, balance) {
                    if (err === null) {
                        $("#accountBalance").html("Your Remaining Balance: " + web3.fromWei(balance, "Ether") + " ETH");
                    }
                })
            }
        })

        electionApp.contracts.PetShop.deployed().then(function (instance) {
            electionInstance = instance;
            return electionInstance.pet_count();
        }).then(function (pet_count) {
            var pet_array = [];
            for (var i = 0; i < pet_count; i++) {
                pet_array.push(electionInstance.pets(i));
            }
            Promise.all(pet_array).then(function (values) {
                var candidatesResults = $("#candidatesResults");
                candidatesResults.empty();

                var candidatesSelect = $('#candidatesSelect');
                candidatesSelect.empty();
                candidatesSelect.append("<option value=\"select\">Choose...</option>");
                for (var i = 0; i < pet_count; i++) {
                    var id = values[i][0]['c'][0];
                    var name = values[i][1];
                    var breed = values[i][2];
                    var age = values[i][3];
                    var img = values[i][4].replace(' ', '%20');
                    var adopted = values[i][5];
                    var num_of_vote = values[i][8];

                    if (adopted == false) {
                        var candidateTemplete = "<tr><th scope=\"row\">" + id + "</th><td>" + name + "</td><td>" + breed + "</td><td>" + age + "</td><td><img src=..\/" + img + " class=\"img-rounded img-center\" border=3 height=100 width=100></img></td><td>" + num_of_vote + "</td></tr>";
                        candidatesResults.append(candidateTemplete);

                        var candidateOption = "<option value='" + id + "' >" + name + "</ option>";
                        candidatesSelect.append(candidateOption);
                    }
                }
            });
            return electionInstance.voters(electionApp.account);
        }).then(function (hasVoted) {
            if (hasVoted) {
                $('form#voteForm').hide();
            } else {
                $('form#voteForm').show();
            }
            return electionInstance.regList(electionApp.account);
        }).then(function () {

        }).catch(function (error) {
            console.warn(error);
        });
    
    },

    castVote: function () {
        var candidateId = $('#candidatesSelect').val();

        if(candidateId == 'Select') {
            window.alert('Please select the candidate');
        } else {
            electionApp.contracts.PetShop.deployed().then(function (instance) {
                return instance.vote(candidateId, { from: electionApp.account });
            }).then(function (result) {
                window.alert('Vote Success');
            }).catch(function (error) {
                console.error(error);
            })
        }
    }
}

$(function () {
    $(window).on('load', function () {
        electionApp.init();
    });
});
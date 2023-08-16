pragma solidity ^0.5.1;

// Integrate everything in a single contract

contract PetShop {
    // Currently emulate what is in the JSON file, maybe cut neuter/vaccinate?
    struct Pet {
        uint256 id;
        string name;
        string breed;
        uint256 age;
        string img;
        bool adopted;
        uint256 num_of_vote;
    }

    // Store accounts that have voted
    mapping(address => bool) public voters;

    mapping(address => bool) public regList;

    Pet[] public pets;
    address[] public adopters;

    uint public pet_count = 0;

    event vote_event(uint256 indexed _candidateId);

    event register_event(uint256 indexed pet_count);

    constructor() public {
        add_pet('Frieda', 'Corgi', 3, 'images/Corgi.jpg');
        add_pet('Gina', 'Bedlington', 3, 'images/Bedlington.jpg');
        add_pet('Collins', 'German Shephard', 2, 'images/German Shepherd.jpg');
        add_pet('Melissa', 'Chihuahua', 2, 'images/Chihuahua.jpg');
        add_pet('Jeanine', 'Bichon', 2, 'images/Bichon.jpg');
        add_pet('Elvia', 'Yorkshire', 3, 'images/Yorkshire.jpg');
        add_pet('Latisha', 'Golden Retriever', 3, 'images/Golden Retriever.jpg');
        add_pet('Coleman', 'Husky', 3, 'images/Husky.jpg');
        add_pet('Nichole', 'Maltese', 2, 'images/Maltese.jpg');
        add_pet('Fran', 'Samoyed', 5, 'images/Samoyed.jpg');
        add_pet('Leonor', 'Labrador Retriever', 1, 'images/Labrador Retriever.jpg');
        add_pet('Dean', 'Sheltie', 4, 'images/Sheltie.jpg');
        add_pet('Stevenson', 'Corgi', 7, 'images/Corgi.jpg');
        add_pet('Kristina', 'Golden Retriever', 4, 'images/Golden Retriever.jpg');
        add_pet('Ethel', 'Maltese', 2, 'images/Maltese.jpg');
        add_pet('Terry', 'Pomeranian', 2, 'images/Pomeranian.jpg');
    }

    // Use memory or direct variables?
    function add_pet(string memory _name, string memory _breed, uint256 age, string memory _img) private {
        uint256 id = pet_count;
        // Adding new pet for setting up the status of each pet
        pets.push(Pet(id, _name, _breed, age, _img, false, 0));
        pet_count++;
    }

    function register(string memory _name, string memory _breed, uint256 age, string memory _img) public {
        add_pet(_name, _breed, age, _img);

        emit register_event(pet_count);
    }

    function vote(uint256 _candidateId) public {
        // require that they haven't voted before
        require(!voters[msg.sender]);

        // require a valid candidate
        require(_candidateId > 0 && _candidateId <= pet_count);

        // record that voter has voted
        voters[msg.sender] = true;

        // update candidate vote Count
        pets[_candidateId].num_of_vote++;

        // trigger voted event
        emit vote_event(_candidateId);
    }

    // function adopt(uint petId) public returns (uint) {
    //     require(petId >= 0 && petId <= 15);
    //     adopters[petId] = msg.sender;
    //     return petId;
    // }



    // function getAdopters() public view returns (address[] memory) {
    //     return adopters;
    // }

    // function getPets() public view returns (Pet[] memory) {
    //     return pets;
    // }

}
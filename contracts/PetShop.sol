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
        bool vaccinated;
        bool neutered;
        uint256 num_of_vote;
        address adopter;
    }

    string public functionCalled;

    // Store accounts that have voted
    mapping(address => bool) public voters;

    mapping(address => bool) public regList;

    Pet[] public pets;
    address[] public adopters;

    uint256 public pet_count = 0;
    uint256 private vaccinate_service = 2;
    uint256 private neuter_service = 3;

    event vote_event(uint256 indexed _candidateId);

    event register_event(uint256 indexed pet_count);

    event service_event(uint256 indexed petId);

    constructor() public {
        add_pet('Frieda', 'Corgi', 3, 'images/Corgi.jpg', true, true);
        add_pet('Gina', 'Bedlington', 3, 'images/Bedlington.jpg', true, true);
        add_pet('Collins', 'German Shephard', 2, 'images/German Shepherd.jpg', true, false);
        add_pet('Melissa', 'Chihuahua', 2, 'images/Chihuahua.jpg', false, true);
        add_pet('Jeanine', 'Bichon', 2, 'images/Bichon.jpg', false, false);
        add_pet('Elvia', 'Yorkshire', 3, 'images/Yorkshire.jpg', true, true);
        add_pet('Latisha', 'Golden Retriever', 3, 'images/Golden Retriever.jpg', true, true);
        add_pet('Coleman', 'Husky', 3, 'images/Husky.jpg', false, false);
        add_pet('Nichole', 'Maltese', 2, 'images/Maltese.jpg', false, false);
        add_pet('Fran', 'Samoyed', 5, 'images/Samoyed.jpg', false, false);
        add_pet('Leonor', 'Labrador Retriever', 1, 'images/Labrador Retriever.jpg', false, false);
        add_pet('Dean', 'Sheltie', 4, 'images/Sheltie.jpg', false, false);
        add_pet('Stevenson', 'Corgi', 7, 'images/Corgi.jpg', false, false);
        add_pet('Kristina', 'Golden Retriever', 4, 'images/Golden Retriever.jpg', false, false);
        add_pet('Ethel', 'Maltese', 2, 'images/Maltese.jpg', false, false);
        add_pet('Terry', 'Pomeranian', 2, 'images/Pomeranian.jpg', false, false);
    }

    // Use memory or direct variables?
    function add_pet(string memory _name, string memory _breed, uint256 age, string memory _img, bool vaccinated, bool neutered) private {
        uint256 id = pet_count;
        // Adding new pet for setting up the status of each pet
        pets.push(Pet(id, _name, _breed, age, _img, false, vaccinated, neutered, 0, address(0)));
        pet_count++;
    }

    function register(string memory _name, string memory _breed, uint256 age, string memory _img, bool vaccinated, bool neutered) public {
        add_pet(_name, _breed, age, _img, vaccinated, neutered);

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

    function adopt(uint256 petId) public returns (uint256) {
        require(petId >= 0 && petId < pet_count);
        
        pets[petId].adopted = true;
        pets[petId].adopter = msg.sender;
        return petId;
    }

    function pet_return(uint256 petId) public payable returns (uint256) {
        require(petId >= 0 && petId < pet_count);

        // Need to make sure the account that return is the same account that adopt
        require(pets[petId].adopter == msg.sender);

        pets[petId].adopted = false;
        pets[petId].adopter = address(0);
        return petId;
    }

    function getAdopters() public view returns (address[] memory) {
        return adopters;
    }
    
    function service(uint petId, uint serviceId) public payable {
        // Check which service
        if (serviceId == vaccinate_service) {
            // Change the vaccinate status of the pet
            pets[petId].vaccinated = true;
        } else if (serviceId == neuter_service) {
            // Change the neuter status of the pet
            pets[petId].neutered = true;
        }

        emit service_event(petId);
    }

    // function getPets() public view returns (Pet[] memory) {
    //     return pets;
    // }

}
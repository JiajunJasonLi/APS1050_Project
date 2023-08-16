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
        bool election_winner;
        uint256 num_of_vote;
    }

    Pet[] public pets;
    address[] public adopters;

    uint public pet_count = 0;

    constructor() public {
        add_pet('Frieda', 'Corgi', 3, 'images/corgi.jpg');
        add_pet('Gina', 'Bedlington', 3, 'images/bedlington.jpg');
        add_pet('Collins', 'German Shephard', 2, 'images/german_shepherd.jpg');
        add_pet('Melissa', 'Chihuahua', 2, 'images/chihuahua.jpg');
        add_pet('Jeanine', 'Bichon', 2, 'images/bichon.jpg');
        add_pet('Elvia', 'Yorkshire', 3, 'images/yorkshire.jpg');
        add_pet('Latisha', 'Golden Retriever', 3, 'images/golden_retriever.jpg');
        add_pet('Coleman', 'Husky', 3, 'images/husky.jpg');
        add_pet('Nichole', 'Maltese', 2, 'images/maltese.jpg');
        add_pet('Fran', 'Samoyed', 5, 'images/samoyed.jpg');
        add_pet('Leonor', 'Labrador Retriever', 1, 'images/labrador_retriever.jpg');
        add_pet('Dean', 'Sheltie', 4, 'images/sheltie.jpg');
        add_pet('Stevenson', 'Corgi', 7, 'images/corgi.jpg');
        add_pet('Kristina', 'Golden Retriever', 4, 'images/golden_retriever.jpg');
        add_pet('Ethel', 'Maltese', 2, 'images/maltese.jpg');
        add_pet('Terry', 'Pomeranian', 2, 'images/pomeranian.jpg');
    }

    // Use memory or direct variables?
    function add_pet(string memory _name, string memory _breed, uint256 age, string memory _img) private {
        uint256 id = pet_count;
        // Adding new pet for setting up the status of each pet
        pets.push(Pet(id, _name, _breed, age, _img, false, false, 0));
        pet_count++;
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
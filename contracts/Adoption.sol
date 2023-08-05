pragma solidity ^0.5.1;


contract Adoption {


   address[16] public adopters;

   function adopt(uint petId) public returns (uint) {

      require(petId >= 0 && petId <= 15); // 确保id在数组长度内


      adopters[petId] = msg.sender; // 保存调用这地址 

      return petId;

   }



   function getAdopters() public view returns (address[16] memory) {

      return adopters;
   }


}
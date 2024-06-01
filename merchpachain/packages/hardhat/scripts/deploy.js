// scripts/deploy.js
async function main() {
    const DataStorage = await ethers.getContractFactory("DataStorage");
    const dataStorage = await DataStorage.deploy();
    await dataStorage.deployed();
    console.log("DataStorage deployed to:", dataStorage.address);
  }
  
  main()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });
  
// https://eth-goerli.g.alchemy.com/v2/zKDKqttu-UVTPPT-8IVAR1SGTH45n_xz
require('@nomiclabs/hardhat-waffle');
module.exports={
  solidity:'0.8.0',
  networks:{
    goreli:{
      url:'https://eth-goerli.g.alchemy.com/v2/zKDKqttu-UVTPPT-8IVAR1SGTH45n_xz',
      accounts:['c33d200cf732db4f8ea88dc8e2874e8fff92c5fc29d3c566c513fc34a7f6eacb']
    }
  }
}
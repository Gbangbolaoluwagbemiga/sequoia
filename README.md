# Payeer

Payeer is a decentralized application (dApp) built on the Base blockchain that allows a group of friends to randomly select one person to pay the bill.

## Features

- **Add Participants**: Add names of people sharing the bill.
- **Random Selection**: Fairly and randomly select one person to pay.
- **Reset**: Clear the list for a new round.

## Tech Stack

- **Solidity**: Smart Contract
- **Hardhat**: Development Environment
- **Base Sepolia**: Testnet for deployment

## Prerequisites

- Node.js installed
- A wallet with Base Sepolia ETH

## Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/Gbangbolaoluwagbemiga/sequoia.git
   cd sequoia
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file in the root directory and add your private key:
   ```env
   PRIVATE_KEY=your_private_key_here
   ```

## Usage

### Compile Contract

```bash
npx hardhat compile
```

### Run Tests

```bash
npx hardhat test
```

### Deploy to Base Sepolia

```bash
npx hardhat run scripts/deploy.js --network baseSepolia
```

## Contract Address

(To be updated after deployment)

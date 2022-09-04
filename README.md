# RevokeSnap

This project is a functional proof-of-concept of using the upcoming MetaMask feature called Snaps to facilitate browsing and revoking approvals given by user to ERC20 Tokens. It has been implemented during ethWarsaw hackathon by Cassandra team.


## Table of Contents

1. Setup
2. Abstract
3. Solution
4. Conclusions


## SETUP

Prerequisites:
Metamask Flask installed and configured in your browser of choice https://metamask.io/flask/ 

After cloning the repo run `yarn setup` which will install all dependencies, build the snap and serve the website on `http://localhost:8080/`.


## ABSTRACT

In order to ensure security of token usage by external actors ERC20 token standard implements an allowance, where the owner of the token needs to approve an actor (i.e. DEX smart contract) to be able to utilise its tokens up to a chosen limit.

In order to enhance the somewhat clunky DeFi user experience, many of the DeFi protocols use a max uint256 value for approvals in order for the user not to have to approve tokens and spend their money on unnecessary gas fees each time they want to interact with their contracts.

Especially for active DeFi users that can easily create a situation when after using said protocols there are some leftover approvals, which is a potential security threat.

Currently there are a number of web solutions offering a service of showing the open approvals for an account.They function in one of 2 ways:

User connects a wallet to the website through wallet provider and the connected account gets analized (https://revoke.cash/)  
User inputs an address which gets analized (https://etherscan.io/tokenapprovalchecker)

While both solutions offer a preview for only 1 account at a time, only in the first one there is a possibility to revoke the approvals directly from the user interface. The process is time consuming as each approval needs to be addressed individually and manually confirmed. While this approach is secure it requires a lot of continuous, manual user interaction.


## SOLUTION

We decided to leverage the following benefits of Snaps:
Access to all accounts in Metamask
Ability to perform complex operations using a single approval from a user
To propose a solution for this problem, which in the future should make it possible to:
present only one prompt to user to get access to all current and future accounts (with notable exception of hardware wallets)
revoke all approvals from all current accounts in batch, with no need for separate confirmations and accounts switching
actively monitor all user accounts (including those on hardware wallets) for new approvals and display notification to user when detected.

On installing the RevokeSnap, the web UI will automatically fetch the parent key from users Metamask and generate a number of accounts, perform a check for leftover approvals and, once the search is complete, expose a button to revoke all identified approvals. On the click of a button the snap will issue a series of transactions corresponding to the leftover approval to zero them out one by one. As the Snap already is in possession of the generated wallets private keys this does not require any additional confirmation from the user, beyond the initial one.


## CONCLUSIONS

As during the hackathon there was only a limited amount of time to create the most optimum solutions we utilised a number of functional implementations which have room for improvement.

1. Accounts
Currently the number of accounts generated in the snap is passed as a function parameter and hardcoded as 3. A better option could be for the snap to use an external API (or a dedicated backend) to verify the next transaction nonce on each account for a given chain and only generate accounts with the nonce number greater than 0.

2. Approval checks
We used a short list of known addresses of tokens and actors to showcase the functionality, but optimally the approval check should be done more globally. This could be done, i.e. by using an RPC provider API (such as Infura) to find all approval transactions and parse them to display on the website.

3. Testing & Debugging
Testing and debugging the actions which happen inside the snap is slow due to:
The fact that on each iteration of the snap, the previous snap needs to be removed from Matamask and reinstalled
There is no way of seeing console logs of the snap execution. A work around this is to run notifications from the dApp, but they very easily run into rate limits
A testing setup and debugger console would be helpful.

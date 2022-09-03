export const ERC20 = {
    abi: [
        'function name() public view returns (string)',
        'function symbol() public view returns (string)',
        'function balanceOf(address _owner) public view returns (uint256 balance)',
        'function approve(address _spender, uint256 _value) public returns (bool success)',
        'function allowance(address owner, address spender) public veiw returns (uint256)'
    ]
};

export const RETURN_FAIL = 'Fail';
  
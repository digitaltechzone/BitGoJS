export const txForExplainTransfer = '0x80800000000400164247d6f2b425ac5771423ae6c80c754f7172b0000000000000000000000000000000b40000ab3fcf8d6d697d01c3da3a20b06cd8b36f016755cb7637c3eb6b228980d8857c7826a8ea498e52fd73ecd8e3869881c9aba49ae598dfbf1d5af69b1c02b4f2bd03020000000000051a1ae3f911d8f1d46d7416bfbe4b593fd41eac19cb00000000000003e85468697320697320616e206578616d706c6500000000000000000000000000000000';

export const txExplainedTransfer = {
  id: '0ebb7aa84ec8023202517671d5781fa108405abcb73e76857520a8f163d4aae4',
  fee: '180',
  outputAmount: '1000',
  memo: 'This is an example',
  recipient: 'STDE7Y8HV3RX8VBM2TZVWJTS7ZA1XB0SSC3NEVH0',
};

export const txForExplainContract = '0x80800000000400164247d6f2b425ac5771423ae6c80c754f7172b0000000000000000000000000000000b4000009d038cfc4db2b0fa3d590b89363a762897fef5c7385b88bc4d4e6fb667f062c293b00b8a6a1750e30b4c90bb539df81cdd522f46ff66da1c7af1c66803352b5030200000000021a000000000000000000000000000000000000000003706f7809737461636b2d73747800000001000000000000000000000000000000007b';

export const txExplainedContract = {
  id: '7fb4ab093f9ec1d78e4a0e0b223f00e69a7800a948574285c51ee35b48be0331',
  fee: '180',
  contractAddress: 'ST000000000000000000002AMW42H',
  contractName: 'pox',
  functionName: 'stack-stx',
  functionArgs: [{ type: 0, value: '123' }],
};

export const unsignedTxForExplainTransfer = '0x80800000000400164247d6f2b425ac5771423ae6c80c754f7172b0000000000000000000000000000000b400000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000003020000000000051a1ae3f911d8f1d46d7416bfbe4b593fd41eac19cb00000000000003e800000000000000000000000000000000000000000000000000000000000000000000';
export const unsignedTxExplainedTransfer = {
  fee: '180',
  outputAmount: '1000',
  memo: '',
  recipient: 'STDE7Y8HV3RX8VBM2TZVWJTS7ZA1XB0SSC3NEVH0',
  sender: 'STB44HYPYAT2BB2QE513NSP81HTMYWBJP02HPGK6',
};

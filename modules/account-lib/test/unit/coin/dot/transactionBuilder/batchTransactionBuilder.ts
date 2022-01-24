import should from 'should';
import sinon, { assert } from 'sinon';
import { BatchTransactionBuilder } from '../../../../../src/coin/dot';
import * as DotResources from '../../../../resources/dot';
import { buildTestConfig } from './base';

describe('Dot Batch Transaction Builder', () => {
  let builder: BatchTransactionBuilder;

  const sender = DotResources.accounts.account1;

  beforeEach(() => {
    const config = buildTestConfig();
    builder = new BatchTransactionBuilder(config);
  });

  describe('setter validation', () => {
    it('should validate list of calls', () => {
      const spy = sinon.spy(builder, 'validateCalls');
      should.throws(
        // @ts-ignore allow invalid parameter for testing
        () => builder.calls([1]),
        (e: Error) =>
          e.message ===
          'Unsigned transaction must be a string. Unable to decode with error: Error: Invalid empty address passed',
      );
      should.doesNotThrow(() => builder.calls([DotResources.rawTx.anonymous.unsigned]));
      assert.calledTwice(spy);
    });
  });

  describe('build batch transaction', () => {
    it('should build a batch transaction', async () => {
      builder
        .calls(DotResources.rawTx.anonymous.batch)
        .sender({ address: sender.address })
        .validity({ firstValid: 9266787, maxDuration: 64 })
        .referenceBlock('0xef5a7eb51dc6e777de2b0232119c90c5782bb8b4704888244276b94ea659f60b')
        .sequenceId({ name: 'Nonce', keyword: 'nonce', value: 200 })
        .fee({ amount: 0, type: 'tip' })
        .version(8);
      builder.sign({ key: sender.secretKey });
      const tx = await builder.build();
      const txJson = tx.toJson();
      // test the call items
      should.deepEqual(txJson.sender, sender.address);
      should.deepEqual(txJson.blockNumber, 9266787);
      should.deepEqual(txJson.referenceBlock, '0xef5a7eb51dc6e777de2b0232119c90c5782bb8b4704888244276b94ea659f60b');
      should.deepEqual(txJson.genesisHash, '0xe143f23803ac50e8f6f8e62695d1ce9e4e1d68aa36c1cd2cfd15340213f3423e');
      should.deepEqual(txJson.specVersion, 9150);
      should.deepEqual(txJson.nonce, 200);
      should.deepEqual(txJson.tip, 0);
      should.deepEqual(txJson.transactionVersion, 8);
      should.deepEqual(txJson.chainName, 'Westend');
      should.deepEqual(txJson.eraPeriod, 64);
    });
    it('should build an unsigned batch transaction', async () => {
      builder
        .calls(DotResources.rawTx.anonymous.batch)
        .sender({ address: sender.address })
        .validity({ firstValid: 9266787, maxDuration: 64 })
        .referenceBlock('0xef5a7eb51dc6e777de2b0232119c90c5782bb8b4704888244276b94ea659f60b')
        .sequenceId({ name: 'Nonce', keyword: 'nonce', value: 200 })
        .fee({ amount: 0, type: 'tip' })
        .version(8);
      const tx = await builder.build();
      const txJson = tx.toJson();
      // test the call items
      should.deepEqual(txJson.sender, sender.address);
      should.deepEqual(txJson.blockNumber, 9266787);
      should.deepEqual(txJson.referenceBlock, '0xef5a7eb51dc6e777de2b0232119c90c5782bb8b4704888244276b94ea659f60b');
      should.deepEqual(txJson.genesisHash, '0xe143f23803ac50e8f6f8e62695d1ce9e4e1d68aa36c1cd2cfd15340213f3423e');
      should.deepEqual(txJson.specVersion, 9150);
      should.deepEqual(txJson.nonce, 200);
      should.deepEqual(txJson.tip, 0);
      should.deepEqual(txJson.transactionVersion, 8);
      should.deepEqual(txJson.chainName, 'Westend');
      should.deepEqual(txJson.eraPeriod, 64);
    });
    it('should build from raw signed tx', async () => {
      builder.from(DotResources.rawTx.batch.signed);
      builder
        .validity({ firstValid: 9266787, maxDuration: 64 })
        .referenceBlock('0xef5a7eb51dc6e777de2b0232119c90c5782bb8b4704888244276b94ea659f60b')
        .version(8);
      const tx = await builder.build();
      const txJson = tx.toJson();
      // test the call items
      should.deepEqual(txJson.sender, sender.address);
      should.deepEqual(txJson.blockNumber, 9266787);
      should.deepEqual(txJson.referenceBlock, '0xef5a7eb51dc6e777de2b0232119c90c5782bb8b4704888244276b94ea659f60b');
      should.deepEqual(txJson.genesisHash, '0xe143f23803ac50e8f6f8e62695d1ce9e4e1d68aa36c1cd2cfd15340213f3423e');
      should.deepEqual(txJson.specVersion, 9150);
      should.deepEqual(txJson.nonce, 200);
      should.deepEqual(txJson.tip, 0);
      should.deepEqual(txJson.transactionVersion, 8);
      should.deepEqual(txJson.chainName, 'Westend');
      should.deepEqual(txJson.eraPeriod, 64);
    });
    it('should build from raw unsigned tx', async () => {
      builder.from(DotResources.rawTx.batch.unsigned);
      builder
        .validity({ firstValid: 9266787, maxDuration: 64 })
        .referenceBlock('0xef5a7eb51dc6e777de2b0232119c90c5782bb8b4704888244276b94ea659f60b')
        .sender({ address: sender.address })
        .sign({ key: sender.secretKey });
      const tx = await builder.build();
      const txJson = tx.toJson();
      // test the call items
      should.deepEqual(txJson.sender, sender.address);
      should.deepEqual(txJson.blockNumber, 9266787);
      should.deepEqual(txJson.referenceBlock, '0xef5a7eb51dc6e777de2b0232119c90c5782bb8b4704888244276b94ea659f60b');
      should.deepEqual(txJson.genesisHash, '0xe143f23803ac50e8f6f8e62695d1ce9e4e1d68aa36c1cd2cfd15340213f3423e');
      should.deepEqual(txJson.specVersion, 9150);
      should.deepEqual(txJson.nonce, 200);
      should.deepEqual(txJson.tip, 0);
      should.deepEqual(txJson.transactionVersion, 8);
      should.deepEqual(txJson.chainName, 'Westend');
      should.deepEqual(txJson.eraPeriod, 64);
    });
  });
});

import should from 'should';
import sinon, { assert } from 'sinon';
import { AddressInitializationBuilder } from '../../../../../src/coin/dot';
import * as DotResources from '../../../../resources/dot';
import { buildTestConfig } from './base';
import utils from '../../../../../src/coin/dot/utils';

describe('Dot Address Initialization Builder', () => {
  let builder: AddressInitializationBuilder;

  const sender = DotResources.accounts.account1;
  const receiver = DotResources.accounts.account3;
  const config = buildTestConfig();
  const materialData = utils.getMaterial(config);

  beforeEach(() => {
    builder = new AddressInitializationBuilder(config).material(materialData);
  });

  describe('setter validation', () => {
    it('should validate delay', () => {
      const spy = sinon.spy(builder, 'validateValue');
      should.throws(
        () => builder.delay('-1'),
        (e: Error) => e.message === 'Value cannot be less than zero',
      );
      should.doesNotThrow(() => builder.delay('0'));
      assert.calledTwice(spy);
    });

    it('should validate owner address', () => {
      const spy = sinon.spy(builder, 'validateAddress');
      should.throws(
        () => builder.owner({ address: 'asd' }),
        (e: Error) => e.message === `The address 'asd' is not a well-formed dot address`,
      );
      should.doesNotThrow(() => builder.owner({ address: sender.address }));
      assert.calledTwice(spy);
    });

    it('should validate index', () => {
      const spy = sinon.spy(builder, 'validateValue');
      should.throws(
        () => builder.index(-1),
        (e: Error) => e.message === 'Value cannot be less than zero',
      );
      should.doesNotThrow(() => builder.index(0));
      assert.calledTwice(spy);
    });
  });

  describe('build addProxy transaction', () => {
    it('should build a addProxy transaction', async () => {
      builder
        .owner({ address: receiver.address })
        .type(ProxyType.ANY)
        .delay('0')
        .sender({ address: sender.address })
        .validity({ firstValid: 3933, maxDuration: 64 })
        .referenceBlock('0x149799bc9602cb5cf201f3425fb8d253b2d4e61fc119dcab3249f307f594754d')
        .sequenceId({ name: 'Nonce', keyword: 'nonce', value: 200 })
        .fee({ amount: 0, type: 'tip' });
      builder.sign({ key: sender.secretKey });
      const tx = await builder.build();
      const txJson = tx.toJson();
      should.deepEqual(txJson.owner, receiver.address);
      should.deepEqual(txJson.proxyType, ProxyType.ANY);
      should.deepEqual(txJson.delay, '0');
      should.deepEqual(txJson.sender, sender.address);
      should.deepEqual(txJson.blockNumber, 3933);
      should.deepEqual(txJson.referenceBlock, '0x149799bc9602cb5cf201f3425fb8d253b2d4e61fc119dcab3249f307f594754d');
      should.deepEqual(txJson.genesisHash, materialData.genesisHash);
      should.deepEqual(txJson.specVersion, materialData.specVersion);
      should.deepEqual(txJson.nonce, 200);
      should.deepEqual(txJson.tip, 0);
      should.deepEqual(txJson.transactionVersion, materialData.txVersion);
      should.deepEqual(txJson.chainName, materialData.chainName);
      should.deepEqual(txJson.eraPeriod, 64);
    });

    it('should build an unsigned addProxy transaction', async () => {
      builder
        .owner({ address: receiver.address })
        .type(ProxyType.ANY)
        .delay('0')
        .sender({ address: sender.address })
        .validity({ firstValid: 3933, maxDuration: 64 })
        .referenceBlock('0x149799bc9602cb5cf201f3425fb8d253b2d4e61fc119dcab3249f307f594754d')
        .sequenceId({ name: 'Nonce', keyword: 'nonce', value: 200 })
        .fee({ amount: 0, type: 'tip' });
      const tx = await builder.build();
      const txJson = tx.toJson();
      should.deepEqual(txJson.owner, receiver.address);
      should.deepEqual(txJson.proxyType, ProxyType.ANY);
      should.deepEqual(txJson.delay, '0');
      should.deepEqual(txJson.sender, sender.address);
      should.deepEqual(txJson.blockNumber, 3933);
      should.deepEqual(txJson.referenceBlock, '0x149799bc9602cb5cf201f3425fb8d253b2d4e61fc119dcab3249f307f594754d');
      should.deepEqual(txJson.genesisHash, materialData.genesisHash);
      should.deepEqual(txJson.specVersion, materialData.specVersion);
      should.deepEqual(txJson.nonce, 200);
      should.deepEqual(txJson.tip, 0);
      should.deepEqual(txJson.transactionVersion, materialData.txVersion);
      should.deepEqual(txJson.chainName, materialData.chainName);
      should.deepEqual(txJson.eraPeriod, 64);
    });

    it('should build from raw signed tx', async () => {
      builder.from(DotResources.rawTx.addProxy.signed);
      builder
        .validity({ firstValid: 3933, maxDuration: 64 })
        .referenceBlock('0x149799bc9602cb5cf201f3425fb8d253b2d4e61fc119dcab3249f307f594754d');
      const tx = await builder.build();
      const txJson = tx.toJson();
      should.deepEqual(txJson.owner, receiver.address);
      should.deepEqual(txJson.proxyType, ProxyType.ANY);
      should.deepEqual(txJson.delay, '0');
      should.deepEqual(txJson.sender, sender.address);
      should.deepEqual(txJson.blockNumber, 3933);
      should.deepEqual(txJson.referenceBlock, '0x149799bc9602cb5cf201f3425fb8d253b2d4e61fc119dcab3249f307f594754d');
      should.deepEqual(txJson.genesisHash, materialData.genesisHash);
      should.deepEqual(txJson.specVersion, materialData.specVersion);
      should.deepEqual(txJson.nonce, 200);
      should.deepEqual(txJson.tip, 0);
      should.deepEqual(txJson.transactionVersion, materialData.txVersion);
      should.deepEqual(txJson.chainName, materialData.chainName);
      should.deepEqual(txJson.eraPeriod, 64);
    });

    it('should build from raw unsigned tx', async () => {
      builder.from(DotResources.rawTx.addProxy.unsigned);
      builder
        .validity({ firstValid: 3933, maxDuration: 64 })
        .referenceBlock('0x149799bc9602cb5cf201f3425fb8d253b2d4e61fc119dcab3249f307f594754d')
        .sender({ address: sender.address })
        .sign({ key: sender.secretKey });
      const tx = await builder.build();
      const txJson = tx.toJson();
      should.deepEqual(txJson.owner, receiver.address);
      should.deepEqual(txJson.proxyType, ProxyType.ANY);
      should.deepEqual(txJson.delay, '0');
      should.deepEqual(txJson.sender, sender.address);
      should.deepEqual(txJson.blockNumber, 3933);
      should.deepEqual(txJson.referenceBlock, '0x149799bc9602cb5cf201f3425fb8d253b2d4e61fc119dcab3249f307f594754d');
      should.deepEqual(txJson.genesisHash, materialData.genesisHash);
      should.deepEqual(txJson.specVersion, materialData.specVersion);
      should.deepEqual(txJson.nonce, 200);
      should.deepEqual(txJson.eraPeriod, 64);
      should.deepEqual(txJson.tip, 0);
      should.deepEqual(txJson.transactionVersion, materialData.txVersion);
      should.deepEqual(txJson.chainName, materialData.chainName);
    });
  });

  describe('build anonymous proxy creation transaction', () => {
    it('should build an anonymous proxy transaction', async () => {
      builder
        .type(ProxyType.ANY)
        .delay('0')
        .index(0)
        .sender({ address: sender.address })
        .validity({ firstValid: 3933, maxDuration: 64 })
        .referenceBlock('0x149799bc9602cb5cf201f3425fb8d253b2d4e61fc119dcab3249f307f594754d')
        .sequenceId({ name: 'Nonce', keyword: 'nonce', value: 200 })
        .fee({ amount: 0, type: 'tip' });
      builder.sign({ key: sender.secretKey });
      const tx = await builder.build();
      const txJson = tx.toJson();
      should.deepEqual(txJson.proxyType, ProxyType.ANY);
      should.deepEqual(txJson.delay, '0');
      should.deepEqual(txJson.index, '0');
      should.deepEqual(txJson.sender, sender.address);
      should.deepEqual(txJson.blockNumber, 3933);
      should.deepEqual(txJson.referenceBlock, '0x149799bc9602cb5cf201f3425fb8d253b2d4e61fc119dcab3249f307f594754d');
      should.deepEqual(txJson.genesisHash, materialData.genesisHash);
      should.deepEqual(txJson.specVersion, materialData.specVersion);
      should.deepEqual(txJson.nonce, 200);
      should.deepEqual(txJson.tip, 0);
      should.deepEqual(txJson.transactionVersion, materialData.txVersion);
      should.deepEqual(txJson.chainName, materialData.chainName);
      should.deepEqual(txJson.eraPeriod, 64);
    });

    it('should build an unsigned anonymous proxy transaction', async () => {
      builder
        .type(ProxyType.ANY)
        .delay('0')
        .index(0)
        .sender({ address: sender.address })
        .validity({ firstValid: 3933, maxDuration: 64 })
        .referenceBlock('0x149799bc9602cb5cf201f3425fb8d253b2d4e61fc119dcab3249f307f594754d')
        .sequenceId({ name: 'Nonce', keyword: 'nonce', value: 200 })
        .fee({ amount: 0, type: 'tip' });
      const tx = await builder.build();
      const txJson = tx.toJson();
      should.deepEqual(txJson.proxyType, ProxyType.ANY);
      should.deepEqual(txJson.delay, '0');
      should.deepEqual(txJson.index, '0');
      should.deepEqual(txJson.sender, sender.address);
      should.deepEqual(txJson.blockNumber, 3933);
      should.deepEqual(txJson.referenceBlock, '0x149799bc9602cb5cf201f3425fb8d253b2d4e61fc119dcab3249f307f594754d');
      should.deepEqual(txJson.genesisHash, materialData.genesisHash);
      should.deepEqual(txJson.specVersion, materialData.specVersion);
      should.deepEqual(txJson.nonce, 200);
      should.deepEqual(txJson.tip, 0);
      should.deepEqual(txJson.transactionVersion, materialData.txVersion);
      should.deepEqual(txJson.chainName, materialData.chainName);
      should.deepEqual(txJson.eraPeriod, 64);
    });

    it('should default to building anonymous proxy if owner is not called', async () => {
      builder
        .type(ProxyType.ANY)
        .delay('0')
        .sender({ address: sender.address })
        .validity({ firstValid: 3933, maxDuration: 64 })
        .referenceBlock('0x149799bc9602cb5cf201f3425fb8d253b2d4e61fc119dcab3249f307f594754d')
        .sequenceId({ name: 'Nonce', keyword: 'nonce', value: 200 })
        .fee({ amount: 0, type: 'tip' });
      builder.sign({ key: sender.secretKey });
      const tx = await builder.build();
      const txJson = tx.toJson();
      should.deepEqual(txJson.proxyType, ProxyType.ANY);
      should.deepEqual(txJson.delay, '0');
      should.deepEqual(txJson.index, '0');
      should.deepEqual(txJson.sender, sender.address);
      should.deepEqual(txJson.blockNumber, 3933);
      should.deepEqual(txJson.referenceBlock, '0x149799bc9602cb5cf201f3425fb8d253b2d4e61fc119dcab3249f307f594754d');
      should.deepEqual(txJson.genesisHash, materialData.genesisHash);
      should.deepEqual(txJson.specVersion, materialData.specVersion);
      should.deepEqual(txJson.nonce, 200);
      should.deepEqual(txJson.tip, 0);
      should.deepEqual(txJson.transactionVersion, materialData.txVersion);
      should.deepEqual(txJson.chainName, materialData.chainName);
      should.deepEqual(txJson.eraPeriod, 64);
    });

    it('should build from raw signed tx', async () => {
      builder.from(DotResources.rawTx.anonymous.signed);
      builder
        .validity({ firstValid: 8975007, maxDuration: 64 })
        .referenceBlock('0x9ed0c8ee5fdc375ee57f79591d7d0db4d7cd2aa0e5403a2ed84edf0f859e3f05');
      const tx = await builder.build();
      const txJson = tx.toJson();
      should.deepEqual(txJson.proxyType, ProxyType.ANY);
      should.deepEqual(txJson.index, '0');
      should.deepEqual(txJson.delay, '0');
      should.deepEqual(txJson.sender, sender.address);
      should.deepEqual(txJson.blockNumber, 8975007);
      should.deepEqual(txJson.referenceBlock, '0x9ed0c8ee5fdc375ee57f79591d7d0db4d7cd2aa0e5403a2ed84edf0f859e3f05');
      should.deepEqual(txJson.genesisHash, '0xe143f23803ac50e8f6f8e62695d1ce9e4e1d68aa36c1cd2cfd15340213f3423e');
      should.deepEqual(txJson.nonce, 200);
      should.deepEqual(txJson.tip, 0);
      should.deepEqual(txJson.transactionVersion, materialData.txVersion);
      should.deepEqual(txJson.chainName, materialData.chainName);
      should.deepEqual(txJson.eraPeriod, 64);
    });

    it('should build from raw unsigned tx', async () => {
      builder.from(DotResources.rawTx.anonymous.unsigned);
      builder
        .validity({ firstValid: 8975007, maxDuration: 64 })
        .referenceBlock('0x9ed0c8ee5fdc375ee57f79591d7d0db4d7cd2aa0e5403a2ed84edf0f859e3f05')
        .sender({ address: sender.address })
        .sign({ key: sender.secretKey });
      const tx = await builder.build();
      const txJson = tx.toJson();
      should.deepEqual(txJson.proxyType, ProxyType.ANY);
      should.deepEqual(txJson.index, '0');
      should.deepEqual(txJson.delay, '0');
      should.deepEqual(txJson.sender, sender.address);
      should.deepEqual(txJson.blockNumber, 8975007);
      should.deepEqual(txJson.referenceBlock, '0x9ed0c8ee5fdc375ee57f79591d7d0db4d7cd2aa0e5403a2ed84edf0f859e3f05');
      should.deepEqual(txJson.genesisHash, '0xe143f23803ac50e8f6f8e62695d1ce9e4e1d68aa36c1cd2cfd15340213f3423e');
      should.deepEqual(txJson.nonce, 200);
      should.deepEqual(txJson.tip, 0);
      should.deepEqual(txJson.transactionVersion, materialData.txVersion);
      should.deepEqual(txJson.chainName, materialData.chainName);
      should.deepEqual(txJson.eraPeriod, 64);
    });
  });
});

import { BaseCoin as CoinConfig, PolkadotSpecNameType } from '@bitgo/statics';
import { UnsignedTransaction } from '@substrate/txwrapper-core';
import { DecodedSignedTx, DecodedSigningPayload, TypeRegistry } from '@substrate/txwrapper-core/lib/types';
import { decode, getRegistry } from '@substrate/txwrapper-polkadot';
import * as _ from 'lodash';
import BigNumber from 'bignumber.js';
import { isValidEd25519Seed } from '../../utils/crypto';
import { BaseTransactionBuilder, TransactionType } from '../baseCoin';
import { BuildTransactionError, InvalidTransactionError } from '../baseCoin/errors';
import { BaseAddress, BaseKey, FeeOptions, SequenceId, ValidityWindow } from '../baseCoin/iface';
import { AddressValidationError, InvalidFeeError } from './errors';
import { CreateBaseTxInfo, Material, TxMethod } from './iface';
import { KeyPair } from './keyPair';
import { Transaction } from './transaction';
import { BaseTransactionSchema, SignedTransactionSchema, SigningPayloadTransactionSchema } from './txnSchema';
import { default as utils } from './utils';

export abstract class TransactionBuilder extends BaseTransactionBuilder {
  protected _transaction: Transaction;
  protected _keyPair: KeyPair;
  protected _sender: string;

  protected _blockNumber: number;
  protected _referenceBlock: string;
  protected _nonce: number;
  protected _tip?: number;
  protected _eraPeriod?: number;
  protected _registry: TypeRegistry;
  protected _method?: TxMethod;
  protected _material: Material;

  constructor(_coinConfig: Readonly<CoinConfig>) {
    super(_coinConfig);
    this._transaction = new Transaction(_coinConfig);
    this.staticsConfig();
  }

  /**
   * Sets the address of sending account.
   *
   * @param {BaseAddress} address The SS58-encoded address.
   * @returns {TransactionBuilder} This transaction builder.
   *
   * @see https://wiki.polkadot.network/docs/build-transaction-construction
   */
  sender({ address }: BaseAddress): this {
    this.validateAddress({ address });
    this._sender = address;
    this._transaction.sender(address);
    return this;
  }

  /**
   * The nonce for this transaction.
   *
   * @param {number} nonce
   * @returns {TransactionBuilder} This transaction builder.
   *
   * @see https://wiki.polkadot.network/docs/build-transaction-construction
   */
  sequenceId(nonce: SequenceId): this {
    const value = new BigNumber(nonce.value);
    this.validateValue(value);
    this._nonce = value.toNumber();
    return this;
  }

  /**
   * The tip to increase transaction priority.
   *
   * @param {number | undefined} [fee.type] options for building fee tx
   * @returns {TransactionBuilder} This transaction builder.
   *
   * @see https://wiki.polkadot.network/docs/build-transaction-construction
   */
  fee(fee: FeeOptions): this {
    if (fee.type !== 'tip') {
      throw new InvalidFeeError(fee.type, 'tip');
    }
    const tipBN = new BigNumber(fee.amount);
    this.validateValue(tipBN);
    this._tip = tipBN.toNumber();
    return this;
  }

  /**
   * The number of the checkpoint block after which the transaction is valid
   *
   * @param {ValidityWindow} firstValid block checkpoint where transaction is first valid
   * @param {ValidityWindow} maxDuration number of blocks after checkpoint for which transaction is valid
   * @returns {TransactionBuilder} This transaction builder.
   *
   * @see https://wiki.polkadot.network/docs/build-transaction-construction
   */
  validity({ firstValid, maxDuration }: ValidityWindow): this {
    if (!_.isUndefined(firstValid)) {
      this.validateValue(new BigNumber(firstValid));
      this._blockNumber = firstValid;
    }
    if (!_.isUndefined(maxDuration)) {
      this.validateValue(new BigNumber(maxDuration));
      this._eraPeriod = maxDuration;
    }
    return this;
  }

  /**
   * The hash of the checkpoint block.
   *
   * @param {number} referenceBlock block hash checkpoint from where the transaction is valid
   * @returns {TransactionBuilder} This transaction builder.
   *
   * @see https://wiki.polkadot.network/docs/build-transaction-construction
   * @see https://wiki.polkadot.network/docs/build-protocol-info#transaction-mortality
   */
  referenceBlock(referenceBlock: string): this {
    this._referenceBlock = referenceBlock;
    return this;
  }

  /**
   * The current version for transaction format.
   *
   * @param {number} transactionVersion
   * @returns {TransactionBuilder} This transaction builder.
   *
   * @see https://wiki.polkadot.network/docs/build-transaction-construction
   * @deprecated This field was added in material data.
   */
  version(transactionVersion: number): this {
    // this._transactionVersion = transactionVersion;
    return this;
  }

  private method(method: TxMethod): this {
    this._method = method;
    return this;
  }

  /**
   * The material data for the block.
   *
   * @param {Material} material
   * @returns {TransactionBuilder} This transaction builder.
   *
   * @see https://wiki.polkadot.network/docs/build-transaction-construction
   */
  material(material: Material): this {
    this._material = material;
    this._registry = getRegistry({
      chainName: material.chainName,
      specName: material.specName,
      specVersion: material.specVersion,
      metadataRpc: material.metadata,
    });
    return this;
  }

  /**
   * Set the network based on the configuration in the statics module
   */
  protected staticsConfig(): void {
    this._material = utils.getMaterial(this._coinConfig);
    this._registry = getRegistry({
      chainName: this._material.chainName,
      specName: this._material.specName,
      specVersion: this._material.specVersion,
      metadataRpc: this._material.metadata,
    });
  }

  /** @inheritdoc */
  protected get transaction(): Transaction {
    return this._transaction;
  }

  /** @inheritdoc */
  protected set transaction(transaction: Transaction) {
    this._transaction = transaction;
  }

  /** @inheritdoc */
  protected fromImplementation(rawTransaction: string): Transaction {
    const decodedTxn = decode(rawTransaction, {
      metadataRpc: this._material.metadata,
      registry: this._registry,
    }) as DecodedSigningPayload | DecodedSignedTx;
    if (utils.isSigningPayload(decodedTxn)) {
      this.referenceBlock(decodedTxn.blockHash);
    } else {
      this.sender({ address: utils.decodeDotAddress(decodedTxn.address) });
    }
    this.validity({ maxDuration: decodedTxn.eraPeriod });
    this.sequenceId({
      name: 'Nonce',
      keyword: 'nonce',
      value: decodedTxn.nonce,
    });
    if (decodedTxn.tip) {
      this.fee({ amount: `${decodedTxn.tip}`, type: 'tip' });
    }
    this.method(decodedTxn.method as unknown as TxMethod);
    return this._transaction;
  }

  /** @inheritdoc */
  protected async buildImplementation(): Promise<Transaction> {
    this.transaction.setTransaction(this.buildTransaction());
    this.transaction.transactionType(this.transactionType);
    this.transaction.registry(this._registry);
    this.transaction.chainName(this._material.chainName);
    if (this._keyPair) {
      this.transaction.sign(this._keyPair);
    }
    this._transaction.loadInputsAndOutputs();
    return this._transaction;
  }

  protected createBaseTxInfo(): CreateBaseTxInfo {
    return {
      baseTxInfo: {
        address: this._sender,
        blockHash: this._referenceBlock,
        blockNumber: this._registry.createType('BlockNumber', this._blockNumber).toNumber(),
        eraPeriod: this._eraPeriod,
        genesisHash: this._material.genesisHash,
        metadataRpc: this._material.metadata,
        specVersion: this._material.specVersion,
        transactionVersion: this._material.txVersion,
        nonce: this._nonce,
        tip: this._tip,
      },
      options: {
        metadataRpc: this._material.metadata,
        registry: this._registry,
      },
    };
  }

  /**
   * Builds the specific transaction builder internally
   * using the @substrate/txwrapper builder.
   */
  protected abstract buildTransaction(): UnsignedTransaction;

  /**
   * The transaction type.
   */
  protected abstract get transactionType(): TransactionType;

  // region Validators
  /** @inheritdoc */
  validateAddress(address: BaseAddress, addressFormat?: string): void {
    if (!utils.isValidAddress(address.address)) {
      throw new AddressValidationError(address.address);
    }
  }

  /** @inheritdoc */
  validateKey({ key }: BaseKey): void {
    let isValidPrivateKeyFromBytes;
    const isValidPrivateKeyFromHex = isValidEd25519Seed(key);
    const isValidPrivateKeyFromBase64 = isValidEd25519Seed(Buffer.from(key, 'base64').toString('hex'));
    try {
      const decodedSeed = utils.decodeSeed(key);
      isValidPrivateKeyFromBytes = isValidEd25519Seed(Buffer.from(decodedSeed.seed).toString('hex'));
    } catch (err) {
      isValidPrivateKeyFromBytes = false;
    }

    if (!isValidPrivateKeyFromBytes && !isValidPrivateKeyFromHex && !isValidPrivateKeyFromBase64) {
      throw new BuildTransactionError(`Key validation failed`);
    }
  }

  /**
   * Validates the specific transaction builder internally
   */
  protected abstract validateDecodedTransaction(
    decodedTxn: DecodedSigningPayload | DecodedSignedTx,
    rawTransaction?: string,
  ): void;

  /** @inheritdoc */
  validateRawTransaction(rawTransaction: string): void {
    const decodedTxn = decode(rawTransaction, {
      metadataRpc: this._material.metadata,
      registry: this._registry,
    }) as DecodedSigningPayload | DecodedSignedTx;

    const eraPeriod = decodedTxn.eraPeriod;
    const nonce = decodedTxn.nonce;
    const tip = decodedTxn.tip;

    if (utils.isSigningPayload(decodedTxn)) {
      const blockHash = decodedTxn.blockHash;
      const validationResult = SigningPayloadTransactionSchema.validate({
        eraPeriod,
        blockHash,
        nonce,
        tip,
      });
      if (validationResult.error) {
        throw new InvalidTransactionError(`Transaction validation failed: ${validationResult.error.message}`);
      }
    } else {
      const sender = decodedTxn.address;
      const validationResult = SignedTransactionSchema.validate({
        sender,
        nonce,
        eraPeriod,
        tip,
      });
      if (validationResult.error) {
        throw new InvalidTransactionError(`Transaction validation failed: ${validationResult.error.message}`);
      }
    }

    this.validateDecodedTransaction(decodedTxn, rawTransaction);
  }

  /** @inheritdoc */
  validateTransaction(_: Transaction): void {
    this.validateBaseFields(
      this._sender,
      this._blockNumber,
      this._referenceBlock,
      this._material.genesisHash,
      this._material.chainName,
      this._nonce,
      this._material.specVersion,
      this._material.specName,
      this._material.txVersion,
      this._eraPeriod,
      this._tip,
    );
  }

  private validateBaseFields(
    sender: string,
    blockNumber: number,
    blockHash: string,
    genesisHash: string,
    chainName: string,
    nonce: number,
    specVersion: number,
    specName: PolkadotSpecNameType,
    transactionVersion: number,
    eraPeriod: number | undefined,
    tip: number | undefined,
  ): void {
    const validationResult = BaseTransactionSchema.validate({
      sender,
      blockNumber,
      blockHash,
      genesisHash,
      chainName,
      nonce,
      specVersion,
      specName,
      transactionVersion,
      eraPeriod,
      tip,
    });

    if (validationResult.error) {
      throw new InvalidTransactionError(`Transaction validation failed: ${validationResult.error.message}`);
    }
  }

  /** @inheritdoc */
  validateValue(value: BigNumber): void {
    if (value.isLessThan(0)) {
      throw new BuildTransactionError('Value cannot be less than zero');
    }
  }

  // endregion

  /** @inheritdoc */
  protected signImplementation({ key }: BaseKey): Transaction {
    this._keyPair = new KeyPair({ prv: key });
    return this._transaction;
  }
}

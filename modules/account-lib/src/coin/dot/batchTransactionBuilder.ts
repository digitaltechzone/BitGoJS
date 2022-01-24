import { BaseCoin as CoinConfig } from '@bitgo/statics';
import { TransactionBuilder } from './transactionBuilder';
import { DecodedSignedTx, DecodedSigningPayload, UnsignedTransaction } from '@substrate/txwrapper-core';
import { methods } from '@substrate/txwrapper-polkadot';
import { TransactionType } from '../baseCoin';
import { BatchCall, BatchCallObject, BatchArgs, MethodNames } from './iface';
import { BuildTransactionError, InvalidTransactionError } from '../baseCoin/errors';
import { BatchTransactionSchema } from './txnSchema';
import { Transaction } from './transaction';

export class BatchTransactionBuilder extends TransactionBuilder {
  protected _calls: BatchCall[];
  protected _type: TransactionType;

  constructor(_coinConfig: Readonly<CoinConfig>) {
    super(_coinConfig);
  }

  /** @inheritDoc */
  protected buildTransaction(): UnsignedTransaction {
    return this.buildBatchTransaction();
  }

  /**
   *
   *
   * @returns {UnsignedTransaction}
   *
   * @see https://polkadot.js.org/docs/substrate/extrinsics/#batchcalls-veccall
   */
  protected buildBatchTransaction(): UnsignedTransaction {
    const baseTxInfo = this.createBaseTxInfo();
    return methods.utility.batch(
      {
        calls: this._calls,
      },
      baseTxInfo.baseTxInfo,
      baseTxInfo.options,
    );
  }

  protected get transactionType(): TransactionType {
    return TransactionType.Batch;
  }

  /**
   * Set multiple unsigned transactions to be batched and broadcast as a single transaction
   *
   * @param {BatchCalls[]} calls unsigned transactions
   * @returns {BatchTransactionBuilder} This batch transaction builder.
   */
  calls(calls: BatchCall[]): this {
    this.validateCalls(calls);
    this._calls = calls;
    return this;
  }

  /** @inheritdoc */
  validateDecodedTransaction(decodedTxn: DecodedSigningPayload | DecodedSignedTx): void {
    const txMethod = decodedTxn.method.args as unknown as BatchArgs;
    const validationResult = this.validateBatchTransactionFields(txMethod.calls);
    if (validationResult.error) {
      throw new InvalidTransactionError(`Transaction validation failed: ${validationResult.error.message}`);
    }
  }

  /** @inheritdoc */
  protected fromImplementation(rawTransaction: string): Transaction {
    const tx = super.fromImplementation(rawTransaction);
    if (this._method?.name === MethodNames.Batch) {
      const txMethod = this._method.args as BatchArgs;
      this.calls(txMethod.calls);
    } else {
      throw new InvalidTransactionError(
        `Invalid Transaction Type: ${this._method?.name}. Expected ${MethodNames.Batch}`,
      );
    }
    return tx;
  }

  /** @inheritdoc */
  validateTransaction(_: Transaction): void {
    super.validateTransaction(_);
    this.validateFields();
  }

  /**
   * Validate list of unsigned transactions added to batch
   *
   * @param {string[]} calls
   *
   */
  validateCalls(calls: BatchCall[]): any {
    calls.forEach((call) => {
      if (typeof call === 'string') {
        try {
          super.fromImplementation(call);
        } catch (e) {
          throw new BuildTransactionError(`invalid unsigned transaction: ${e}`);
        }
      } else if (!((call as BatchCallObject)?.args) && (call as BatchCallObject)?.callIndex) {
        throw new BuildTransactionError(`call missing either of the following parameters: args, callIndex`);
      }
    });
  }

  private validateFields(): any {
    const validationResult = this.validateBatchTransactionFields(this._calls);
    if (validationResult.error) {
      throw new InvalidTransactionError(
        `AddressInitialization Transaction validation failed: ${validationResult.error.message}`,
      );
    }
  }

  private validateBatchTransactionFields(calls: BatchCall[]): any {
    return BatchTransactionSchema.validate({
      calls,
    });
  }
}

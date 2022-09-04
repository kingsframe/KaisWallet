// Next, React
import { FC, useEffect, useState } from 'react';
import Link from 'next/link';

// Wallet
import { useWallet, useConnection } from '@solana/wallet-adapter-react';

// Components
import { RequestAirdrop } from '../../components/RequestAirdrop';
import pkg from '../../../package.json';

// Store
import useUserSOLBalanceStore from '../../stores/useUserSOLBalanceStore';
import { Keypair, LAMPORTS_PER_SOL, PublicKey, SystemProgram, Transaction } from '@solana/web3.js';

// MS
import Squads from "@sqds/sdk";

// Local Storage
import { useLocalStorage } from 'usehooks-ts'

export const HomeView: FC = ({ }) => {
  const destAddress = new PublicKey('EJ5BiUhi6ifQpZmYBupx839xF1YKvZmj6yq9At3PecEh')
  const amount = 0.001 * LAMPORTS_PER_SOL;

  const wallet = useWallet();
  const { connection } = useConnection();

  const balance = useUserSOLBalanceStore((s) => s.balance)
  const { getUserSOLBalance } = useUserSOLBalanceStore()

  const [squads, setSquads] = useState<Squads | null>()
  const [multisigAccount, setMultisigAccount] = useLocalStorage('multisigAccount', null)
  const [txPDA, setTxPDA] = useLocalStorage('txPDA', null)
  const [txStatus, setTxStatus] = useLocalStorage('txStatus', null)
  const [transactionIndex, setTransactionIndex] = useLocalStorage('transactionIndex', null)
  const [ixPDA, setIxPDA] = useLocalStorage('ixPDA', null)

  useEffect(() => {
    if (wallet.publicKey) {
      console.log(wallet.publicKey.toBase58())
      getUserSOLBalance(wallet.publicKey, connection)
    }
  }, [wallet.publicKey, connection, getUserSOLBalance])

  useEffect(() => {
    if (wallet) {
      // By default, the canonical Program IDs for SquadsMPL and ProgramManager will be used
      // The 'wallet' passed in will be the signer/feePayer on all transactions through the Squads object.
      setSquads(Squads.devnet(wallet)); // or Squads.devnet(...); Squads.mainnet(...)
    }
  }, [wallet])

  const onTransfer = async () => {
    const transaction = new Transaction().add(
      SystemProgram.transfer({
        fromPubkey: wallet.publicKey,
        toPubkey: destAddress,
        lamports: amount,
      })
    );

    const signature = await wallet.sendTransaction(transaction, connection);

    await connection.confirmTransaction(signature, 'confirmed');
    console.log('balance after transfer: ', balance)
  }

  const createMS = async () => {
    if (!squads) {
      console.log("squads not found:", wallet)
      return
    }
    const threshold = 1
    const createKey = Keypair.generate().publicKey;
    const members = [wallet.publicKey];
    const newMultisigAccount = await squads.createMultisig(threshold, createKey, members);
    setMultisigAccount(newMultisigAccount)
    console.log('account created: ', newMultisigAccount)
    console.log('balance after MS create: ', balance)
  }

  const createMSTransaction = async () => {
    if (!squads) {
      console.log("squads not found:", wallet)
      return
    }

    if (!multisigAccount) {
      console.log("multisig account not found, please create a new multisig")
      return
    }

    const authorityIndex = 1;
    console.log("ms pubkey used to create transaction: ", multisigAccount.publicKey)
    const newMsTransaction = await squads.createTransaction(new PublicKey(multisigAccount.publicKey), authorityIndex);
    setTxPDA(newMsTransaction.publicKey.toString())
    setTxStatus(newMsTransaction.status)
    setTransactionIndex(newMsTransaction.transactionIndex)
    console.log('new Ms transaction created: ', newMsTransaction)
    console.log('balance after MS create transaction: ', balance)
  }

  const addInstruction = async () => {
    if (!squads) {
      console.log("squads not found:", wallet)
      return
    }

    if (!multisigAccount) {
      console.log("multisig account not found, please create a new multisig")
      return
    }

    if (!txPDA) {
      console.log("multisig transaction account not found, please create a new ms transaction")
      return
    }

    console.log("ms transaction used to add instruction: ", txPDA)
    const transferIx = SystemProgram.transfer({
      fromPubkey: wallet.publicKey,
      toPubkey: destAddress,
      lamports: amount,
    })
    const newMsIx = await squads.addInstruction(new PublicKey(txPDA), transferIx)
    setIxPDA(newMsIx.publicKey.toString())
    console.log('new Ms instruction created: ', newMsIx)
    console.log('balance afterwards: ', balance)
  }

  const activateMsTransaction = async () => {
    // TODO check if status is already active
    if (!squads) {
      console.log("squads not found:", wallet)
      return
    }

    if (!multisigAccount) {
      console.log("multisig account not found, please create a new multisig")
      return
    }

    if (!txPDA) {
      console.log("multisig transaction account not found, please create a new ms transaction")
      return
    }

    console.log("the ms transaction about to be activated: ", txPDA)
    const currentMsTransaction = await squads.activateTransaction(new PublicKey(txPDA));
    setTxStatus(JSON.stringify(currentMsTransaction.status))
    setTransactionIndex(currentMsTransaction.transactionIndex)
    console.log('the Ms transaction activated: ', currentMsTransaction)
    console.log('balance afterwards: ', balance)
  }

  const approveMsTransaction = async () => {
    // TODO check if status is already active
    if (!squads) {
      console.log("squads not found:", wallet)
      return
    }

    if (!multisigAccount) {
      console.log("multisig account not found, please create a new multisig")
      return
    }

    if (!txPDA) {
      console.log("multisig transaction account not found, please create a new ms transaction")
      return
    }

    console.log("the ms transaction about to be approved: ", txPDA)
    const currentMsTransaction = await squads.approveTransaction(new PublicKey(txPDA));
    setTxStatus(JSON.stringify(currentMsTransaction.status))
    setTransactionIndex(currentMsTransaction.transactionIndex)
    console.log('the Ms transaction approved: ', currentMsTransaction)
    console.log('balance afterwards: ', balance)
  }

  const executeMsTransaction = async () => {
    // TODO check if status is execute ready
    if (!squads) {
      console.log("squads not found:", wallet)
      return
    }

    if (!multisigAccount) {
      console.log("multisig account not found, please create a new multisig")
      return
    }

    if (!txPDA) {
      console.log("multisig transaction account not found, please create a new ms transaction")
      return
    }

    console.log("the ms transaction about to be executed: ", txPDA)
    const currentTransaction = await squads.executeTransaction(new PublicKey(txPDA));
    setTxStatus(JSON.stringify(currentTransaction.status))
    setTransactionIndex(currentTransaction.transactionIndex)
    console.log('the Ms transaction executed: ', currentTransaction)

    // const currentExecuteInstruction = await squads.buildExecuteTransaction(new PublicKey(txPDA));
    // const transaction = new Transaction().add(currentExecuteInstruction);
    // const signature = await wallet.sendTransaction(transaction, connection);
    // await connection.confirmTransaction(signature, 'confirmed');

    console.log('balance afterwards: ', balance)
  }

  return (

    <div className="md:hero mx-auto p-4">
      <div className="md:hero-content flex flex-col">
        <h1 className="text-center text-5xl md:pl-12 font-bold text-transparent bg-clip-text bg-gradient-to-tr from-[#9945FF] to-[#14F195]">
          Kai's wallet <span className='text-sm font-normal align-top text-slate-700'>v{pkg.version}</span>
        </h1>
        {/* <h4 className="md:w-full text-center text-slate-300 my-2">
          <p>Simply the fastest way to get started.</p>
          Next.js, tailwind, wallet, web3.js, and more.
        </h4> */}
        <div className="max-w-md mx-auto mockup-code bg-primary p-6 my-2">
          <pre data-prefix=">">
            <code className="truncate">LocalStorage msPDA</code>
            {multisigAccount && <>
              <p>PubKey: {multisigAccount.publicKey}</p>
              <p>Threshold: {multisigAccount.threshold}</p>
              <p>Keys: {multisigAccount.keys}</p>
              <p>Tx Index: {multisigAccount.transactionIndex}</p>
              <p>MS Change Index: {multisigAccount.msChangeIndex}</p>
            </>
            }
          </pre>
        </div>
        <div className="max-w-md mx-auto mockup-code bg-primary p-6 my-2">
          <pre data-prefix=">">
            <code className="truncate">LocalStorage txPDA</code>
            {txPDA && <>
              <p>PubKey: {txPDA}</p>
              <p>Status: {JSON.stringify(txStatus)}</p>
              <p>TransactionIndex: {transactionIndex}</p>
            </>}
          </pre>
        </div>
        <div className="max-w-md mx-auto mockup-code bg-primary p-6 my-2">
          <pre data-prefix=">">
            <code className="truncate">LocalStorage ixPDA</code>
            {ixPDA && <>
              <p>PubKey: {ixPDA}</p>
            </>}
          </pre>
        </div>
        <div className="text-center">
          <RequestAirdrop publicKey={wallet.publicKey} />
          {/* {wallet.publicKey && <p>Public Key: {wallet.publicKey.toBase58()}</p>} */}
          {wallet && <p>SOL Balance: {(balance || 0).toLocaleString()}</p>}
        </div>

        <button
          className="px-8 m-2 btn animate-pulse bg-gradient-to-r from-[#9945FF] to-[#14F195] hover:from-pink-500 hover:to-yellow-500 ..."
          onClick={onTransfer}
        >
          <span>Transfer</span>
        </button>

        <button
          className="px-8 m-2 btn animate-pulse bg-gradient-to-r from-[#9945FF] to-[#14F195] hover:from-pink-500 hover:to-yellow-500 ..."
          onClick={createMS}
        >
          <span>Create a MultiSig</span>
        </button>

        <button
          className="px-8 m-2 btn animate-pulse bg-gradient-to-r from-[#9945FF] to-[#14F195] hover:from-pink-500 hover:to-yellow-500 ..."
          onClick={createMSTransaction}
        >
          <span>Create a MultiSig Transaction</span>
        </button>

        <button
          className="px-8 m-2 btn animate-pulse bg-gradient-to-r from-[#9945FF] to-[#14F195] hover:from-pink-500 hover:to-yellow-500 ..."
          onClick={addInstruction}
        >
          <span>Add an Instruction</span>
        </button>

        <button
          className="px-8 m-2 btn animate-pulse bg-gradient-to-r from-[#9945FF] to-[#14F195] hover:from-pink-500 hover:to-yellow-500 ..."
          onClick={activateMsTransaction}
        >
          <span>Activate Transaction</span>
        </button>

        <button
          className="px-8 m-2 btn animate-pulse bg-gradient-to-r from-[#9945FF] to-[#14F195] hover:from-pink-500 hover:to-yellow-500 ..."
          onClick={approveMsTransaction}
        >
          <span>Approve Transaction</span>
        </button>

        <button
          className="px-8 m-2 btn animate-pulse bg-gradient-to-r from-[#9945FF] to-[#14F195] hover:from-pink-500 hover:to-yellow-500 ..."
          onClick={executeMsTransaction}
        >
          <span>Execute Transaction</span>
        </button>
      </div>
    </div>
  );
};

import React, { useEffect, useState } from "react";
import { ethers } from "ethers";

import { contractABI, contractAddress } from "../utils/constants";

export const TransactionContext = React.createContext();

const { ethereum } = window;

const getEthereumContract = async () => {
  const provider = new ethers.BrowserProvider(ethereum);
  const signer = await provider.getSigner();
  const transactionContract = new ethers.Contract(
    contractAddress,
    contractABI,
    signer
  );
  return transactionContract;
};
export const TransactionProvider = ({ children }) => {
  const [transactionCount, settransactionCount] = useState(
    localStorage.getItem("transactionCount")
  );
  const [transactions, setTransactions] = useState([]);
  const [isLoading, setisLoading] = useState(false);
  const [currentAccount, setCurrentAccount] = useState("");
  const [formData, setFormData] = useState({
    addressTo: "",
    amount: "",
    keyword: "",
    message: "",
  });
  const handleChange = (e, name) => {
    setFormData((prevState) => ({ ...prevState, [name]: e.target.value }));
  };
  const getAllTransactions = async () => {
    try {
      if (!ethereum) return alert("Please install metamask!");
      const transactionsContract = await getEthereumContract();
      const availableTransactions =
        await transactionsContract.getAllTranasctions();
      const structuredTransaction = availableTransactions.map(
        (transaction) => ({
          addressTo: transaction.receiver,
          addressFrom: transaction.sender,
          timestamp: new Date(
            Number(transaction.timestamp) * 1000
          ).toLocaleDateString(),
          message: transaction.message,
          keyword: transaction.keyword,
          amount: transaction.amount.toString() / 10 ** 18,
        })
      );
      setTransactions(structuredTransaction);
    } catch (error) {
      console.log(error);
    }
  };

  const checkIfTransactionExists = async () => {
    try {
      const transactionContract = await getEthereumContract();
      const transactionCount = await transactionContract.getTransactionCount();
      window.localStorage.setItem("transactionCount", transactionCount);
    } catch (error) {
      console.log(error);
    }
  };

  const checkIfWalletIsConnected = async () => {
    try {
      if (!ethereum) return alert("Please install metamask!");
      const accounts = await ethereum.request({ method: "eth_accounts" });
      if (accounts.length) {
        setCurrentAccount(accounts[0]);
        getAllTransactions();
      } else {
        console.log("No account found");
      }
    } catch (err) {
      console.log(err);
      throw new Error("No ethereum object!!");
    }
  };

  const connectWallet = async () => {
    try {
      if (!ethereum) return alert("Please install metamask!");
      const accounts = await ethereum.request({
        method: "eth_requestAccounts",
      });
      setCurrentAccount(accounts[0]);
    } catch (err) {
      console.log(err);
      throw new Error("No ethereum object!!");
    }
  };

  const sendTransaction = async () => {
    try {
      if (!ethereum) return alert("Please install Metamask");
      const { addressTo, amount, keyword, message } = formData;
      const transactionContract = await getEthereumContract();
      const parsedAmount = ethers.parseEther(amount);
      await ethereum.request({
        method: "eth_sendTransaction",
        params: [
          {
            from: currentAccount,
            to: addressTo,
            gas: "0x5208", //21000 wei
            value: parsedAmount._hex,
          },
        ],
      });
      const transactionHash = await transactionContract.addToBlockchain(
        addressTo,
        parsedAmount,
        message,
        keyword
      );
      setisLoading(true);
      await transactionHash.wait();
      setisLoading(false);
      setFormData({
        addressTo: "",
        amount: "",
        keyword: "",
        message: "",
      });
      const transactionCount = await transactionContract.getTransactionCount();
      settransactionCount(Number(transactionCount));
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    checkIfTransactionExists();
    checkIfWalletIsConnected();
  }, []);

  return (
    <TransactionContext.Provider
      value={{
        connectWallet,
        currentAccount,
        formData,
        setFormData,
        handleChange,
        sendTransaction,
        transactions,
        isLoading,
      }}
    >
      {children}
    </TransactionContext.Provider>
  );
};

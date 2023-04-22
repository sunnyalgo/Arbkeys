/* eslint-disable jsx-a11y/alt-text */
/* eslint-disable @next/next/no-img-element */
import { ReactElement, useEffect, useState, useCallback } from "react";
import * as AIicon from "react-icons/fa";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

import PageLoading from "../components/PageLoading";
import { errorAlert, successAlert } from "../components/toastGroup";

import { CONTRACTADDRESS, gasLimit } from "../config";
import NFTMINTABI from "../../public/abi/NFTMINTABI.json";
import { useAccount } from "wagmi";
import { keccak256 } from "ethers/lib/utils.js";
import { Presel_form, CurrentPrice_form } from "./presel";

const ethers = require("ethers");
const { MerkleTree } = require('merkletreejs');
const { freeAddresses } = require('../freeWhiteList.json');
const { preAddresses } = require('../freeWhiteList.json');

export interface NFTType {
  mint: string;
  staked: boolean;
  stakedTime: number;
}

const Mint = () => {
  const { address: account, isConnected } = useAccount();
  const provider =
    typeof window !== "undefined" && window.ethereum
      ? new ethers.providers.Web3Provider(window.ethereum)
      : null;
  const Signer = provider?.getSigner();

  if (provider === null) {
    // Handle the case when Ethereum is not present in the browser
  }

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const NFTMintContract = new ethers.Contract(
    CONTRACTADDRESS,
    NFTMINTABI,
    Signer
  );

  const [startLoading, setStartLoading] = useState<boolean>(false);
  const [totalSupply, setTotalSupply] = useState<number>(0);
  const [quantity_count, setQuantityCount] = useState<number>(1);
  const [sale_type, setType] = useState<number>(3);
  const [max_cnt, setMaxCnt] = useState<number>(10);
  const [current_price, setCurrentPrice] = useState<number>(0.01);
  const price_value: Array<number> = [0, 0.01, 0.02, 0];
  const decCount = () => {
    quantity_count > 1 ? setQuantityCount((prev) => prev - 1) : 1;
  };
  const incCount = () => {
    sale_type != 0 && quantity_count < max_cnt
      ? setQuantityCount((prev) => prev + 1)
      : max_cnt;
  };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const changeType = (_index: number) => {
    const type = Number(localStorage.getItem("saleType"));
    const balanceOf = Number(localStorage.getItem("balanceOf"));
    if(type != _index)
    {
      console.log("change Type To :" , _index);
      localStorage.setItem("saleType",String(_index));
      setType(_index);
      //set MaxCount for diffrent type with old balence.
      _index == 0 ? balanceOf == 0 ? setMaxCnt(1) : setMaxCnt(0) :
      _index == 3 ? setMaxCnt(0) : setMaxCnt(10-balanceOf);

      //if freeSale type ? balence != 0 => QuantityCount = 1 else 0
      _index == 0 && balanceOf != 0 ? setQuantityCount(0) : setQuantityCount(1);
      _index == 3 ? setQuantityCount(0) : setQuantityCount(1);
      setCurrentPrice(price_value[_index]);
    }
  };

  const freeLeafNodes = freeAddresses.map((addr: string) => keccak256(addr.toLowerCase()));
  const freeMerkleTree = new MerkleTree(freeLeafNodes, keccak256, { sortPairs: true });
  const preLeafNodes = preAddresses.map((addr: string) => keccak256(addr.toLowerCase()));
  const preMerkleTree = new MerkleTree(preLeafNodes, keccak256, { sortPairs: true });

  const freeProof = () =>{
    if(account){
      let freeUserAddress = account.trim().toLowerCase();
      const freeLeaf = keccak256(freeUserAddress);
      const  freeProof_1 = freeMerkleTree.getProof(freeLeaf)
      let freeProof = [];
      for (let i = 0; i < freeProof_1.length; i ++) {
        freeProof.push(freeProof_1[i].data.toString('hex'))
      }
    }
  }

  const preProof = () =>{
    if(account){
      let preUserAddress = account.trim().toLowerCase();
      const preLeaf = keccak256(preUserAddress);
      const  preProof_1 = preMerkleTree.getProof(preLeaf)
      let preProof = [];
      for (let i = 0; i < preProof_1.length; i ++) {
        preProof.push(preProof_1[i].data.toString('hex'))
      }
    }
  }

  const handleMintFunc = () => {
    if (account) {
      const param1 = current_price * quantity_count;
      const param2 = quantity_count;
      const param3 = freeProof();
      const param4 = account;
      setStartLoading(true);
      {
        sale_type == 0 && 
          NFTMintContract.freeMint(param1,param2,param3,param4)
            .then((tx: { wait: () => Promise<any> }) => {
              tx.wait().then(() => {
                setStartLoading(false);
                successAlert("Mint success!");
                getTotalSupplyCounts();
              });
            })
            .catch(() => {
              setStartLoading(false);
              errorAlert("Free Minting was canceled.");
            });
      }
      {
        sale_type == 1 &&
          NFTMintContract.preMint(param1,param2,param3,param4)
            .then((tx: { wait: () => Promise<any> }) => {
              tx.wait().then(() => {
                setStartLoading(false);
                successAlert("Mint success!");
                getTotalSupplyCounts();
              });
            })
            .catch(() => {
              setStartLoading(false);
              errorAlert("Pre Minting was canceled.");
            });
      }
      {
        sale_type == 2 &&
          NFTMintContract.publicMint(param1,param2,param3,param4)
            .then((tx: { wait: () => Promise<any> }) => {
              tx.wait().then(() => {
                setStartLoading(false);
                successAlert("Mint success!");
                getTotalSupplyCounts();
              });
            })
            .catch(() => {
              setStartLoading(false);
              errorAlert("Public Minting was canceled.");
            });
      }
    } else {
    }
  };

  const getTotalSupplyCounts = useCallback(async () => {
    const balance = await NFTMintContract.totalSupply();
    setTotalSupply(Number(balance.toString()));
  }, []);

  useEffect(() => {
    changeType(3);
    if (isConnected) {
      console.log("excute check");
      (async () => {
        const _freeSaleTime = await NFTMintContract.freeSaleTime();
        const _preSaleTime = await NFTMintContract.preSaleTime();
        const _publicSaleTime = await NFTMintContract.publicSaleTime();
        const _balanceOf = await NFTMintContract.balanceOf(account);
        localStorage.setItem("freeSaleTime",_freeSaleTime);
        localStorage.setItem("preSaleTime",_preSaleTime);
        localStorage.setItem("publicSaleTime",_publicSaleTime);
        localStorage.setItem("balanceOf",_balanceOf);
        const time = new Date().getTime()/1000;
        time < _freeSaleTime ? changeType(3) : 
        time < _preSaleTime ? changeType(0) :
        time < _publicSaleTime ? changeType(1) : changeType(2);
        getTotalSupplyCounts();
      })();
      setInterval(()=>{
        const time = new Date().getTime()/1000;
        const freeTime = Number(localStorage.getItem("freeSaleTime")),
              preTime = Number(localStorage.getItem("preSaleTime")),
              publicTime = Number(localStorage.getItem("publicSaleTime"));

        time < freeTime ? changeType(3) : 
        time < preTime ? changeType(0) :
        time < publicTime ? changeType(1) : changeType(2);
      },60000)
    }
  }, [isConnected, NFTMintContract, account, changeType, getTotalSupplyCounts]); 

  return (
    <div className="w-full px-4 sm:px-16 py-8 bg-black font-inter text-center text-[20px] ">
      <div className="w-full md:flex justify-center items-center gap-8 max-w-[1440px] m-auto">
        <div className="flex-none md:flex-1 px-0 sm:px-16 ">
          <section className="px-7 py-4 xl:py-8 rounded-xl bg-secondback m-2">
            <p className="text-[24px] leading-[181%] text-white text-left">
              Mint a Poseidon NFT
            </p>
            <p className="leading-[181%] text-basecolor text-left font-inter">
              99 of 133 NFTs remain
            </p>
          </section>
          <section className="px-7 py-4 rounded-xl bg-secondback m-2 mt-4">
            <div className="w-full flex justify-between items-center py-4 xl:py-8 sm:gap-5 text-white">
              Balance
            </div>
            <hr />
            <div className="w-full flex justify-between items-center py-4 xl:py-8 sm:gap-5">
              <span className="text-white">Amount</span>
              <button
                className={`sm:ml-8 px-2 py-1 text-black duration-200 transition-all ${
                  quantity_count <= 1 ? "cursor-not-allowed" : ""
                }`}
                onClick={() =>
                  quantity_count <= 1 ? setQuantityCount(1) : setQuantityCount(quantity_count - 1)
                }
              >
                <AIicon.FaMinus color="#04E09F" opacity={1} />
              </button>
              <p className="text-[1.5rem] text-white">{quantity_count}</p>
              <button
                className={`px-2 py-1 text-black duration-200 transition-all ${
                  quantity_count >= 5 ? "cursor-not-allowed" : ""
                }`}
                onClick={() =>
                  quantity_count >= 5 ? setQuantityCount(5) : setQuantityCount(quantity_count + 1)
                }
              >
                <AIicon.FaPlus color="#04E09F" />
              </button>
              <button
                className="px-2 py-0 bg-basecolor text-black hover:bg-green-300 duration-200 transition-all text-[16px] rounded-md font-bold"
                onClick={() => setQuantityCount(5)}
              >
                MAX
              </button>
            </div>
            <hr />
            <div className="w-full flex justify-between items-center py-4 xl:py-8 gap-5 text-white">
              Total
              <span className="text-basecolor">1000 USDC + GAS</span>
            </div>
          </section>
          <div className="w-full flex justify-center p-3">
            <button
              className="w-full py-4 bg-base text-black bg-basecolor hover:bg-green-300 duration-200 transition-all text-[1rem] font-bold uppercase rounded-xl"
              onClick={() => handleMintFunc()}
            >
              Mint Poseidon
            </button>
          </div>
        </div>
        <div className="flex-none md:flex-1">
          <div className="sm:p-8 text-center">
            <img
              src="/img/mint.png"
              className="w-full max-w-[500px] min-w-[150px] xs:min-w-[250px] m-auto"
            />
          </div>
        </div>
      </div>
      <p className="text-[1rem] text-white text-center mt-8">
        View your Poseidon NFT on&nbsp;
        <a
          href="#"
          rel="referrer"
          className="text-indigo-400 hover:text-blue-700 duration-300 transition-all decoration-0"
        >
          NFT Apparel Marketplace
        </a>
      </p>
      <div className="max-w-[1440px] xl:flex p-10 m-auto mt-10">
        <div className="flex-none xl:flex justify-center items-center xl:w-[20%]">
          <img className="p-2 mx-auto mb-5" src="/img/snowround.png" />
        </div>
        <div className="xl:w-[80%] xl:p-6">
          <div className="items-center sm:grid lg:grid-cols-4 sm:grid-cols-2 gap-10 m-auto sm:gap-5">
            <div>
              <Presel_form
                id={0}
                title=""
                color={sale_type != 0 ? "bg-red-600" : "bg-green-600"}
                text={sale_type != 0 ? "Inactive" : "Active"}
              ></Presel_form>
            </div>
            <div>
              <Presel_form
                id={1}
                title=""
                color={sale_type != 1 ? "bg-red-600" : "bg-green-600"}
                text={sale_type != 1 ? "Inactive" : "Active"}
              ></Presel_form>
            </div>
            <div>
              <Presel_form
                id={2}
                title=""
                color={sale_type != 2 ? "bg-red-600" : "bg-green-600"}
                text={sale_type != 2 ? "Inactive" : "Active"}
              ></Presel_form>
            </div>
            <div>
              <Presel_form
                id={3}
                title="3 wallets per"
                color="bg-gray-600"
                value={totalSupply}
              ></Presel_form>
            </div>
          </div>
          <div className="items-center sm:grid lg:grid-cols-5 sm:grid-cols-2 gap-10 m-auto sm:gap-5 mt-5">
            <div className="lg:col-span-2">
              <CurrentPrice_form
                id={4}
                color="bg-gray-600"
                value={current_price}
              ></CurrentPrice_form>
            </div>
            <div className="lg:col-span-3 presel-gradient rounded-xl text-left p-5 mt-5 sm:mt-0">
              <h5 className="text-white">Quantity</h5>
              <div className="flex w-full">
                <div className="relative m-auto">
                  <div className="flex justify-content-center items-center px-1">
                    <button
                      onClick={decCount}
                      className={`mx-5 lg:mx-8 md:mx-2 sm:mx-1 w-[30px] h-[30px] lg:w-[30px] lg:h-[30px] sm:w-[15px] sm:h-[15px] ${
                        quantity_count <= 1 ? "cursor-not-allowed" : ""
                      }`}
                    >
                      <AIicon.FaMinusCircle color="white" opacity={1} />
                    </button>
                    <button className="w-[70px] h-[70px] md:w-[70px] md:h-[70px] sm:w-[40px] sm:h-[40px] bg-orange-500 rounded-full text-10 text-white">
                      {quantity_count}
                    </button>
                    <button
                      onClick={incCount}
                      className={`mx-5 lg:mx-8 md:mx-2 sm:mx-1 w-[30px] h-[30px] lg:w-[30px] lg:h-[30px] sm:w-[15px] sm:h-[15px] ${
                        quantity_count >= max_cnt ? "cursor-not-allowed" : ""
                      }`}
                    >
                      <AIicon.FaPlusCircle color="white" opacity={1} />
                    </button>
                  </div>
                  <div className="absolute border rounded-full border-orange-500 flex justify-content-center items-center top-4 sm:top-2  px-1 -z-10">
                    <span className="mx-5 lg:mx-8 md:mx-2 sm:mx-1 w-[20px] h-[20px] lg:w-[30px] lg:h-[30px] sm:w-[15px] sm:h-[15px]"></span>
                    <button
                      className="w-[62px] h-[40px] 
                              md:w-[72px] md:h-[50px] 
                              sm:w-[42px] sm:h-[25px] 
                              text-10 invisible"
                    >
                      {quantity_count}
                    </button>
                    <span className="mx-5 lg:mx-8 md:mx-3 sm:mx-1 w-[25px] h-[25px] lg:w-[30px] lg:h-[30px] sm:w-[15px] sm:h-[15px]"></span>
                  </div>
                </div>
                <div className="m-auto">
                  <button
                    className="bg-orange-500 hover:bg-orange-300 rounded-lg pw-10 text-white p-5"
                    onClick={() => handleMintFunc()}
                  >
                    Mint
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <p className="text-[1rem] text-white text-center mt-8">
        View your Poseidon NFT on&nbsp;
        <a
          href="#"
          rel="referrer"
          className="text-indigo-400 hover:text-blue-700 duration-300 transition-all decoration-0"
        >
          NFT Apparel Marketplace
        </a>
      </p>
      {startLoading && <PageLoading loading={true} />}
    </div>
  );
};

export default Mint;

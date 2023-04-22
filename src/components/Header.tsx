import Link from "next/link";
import { useRouter } from "next/router";
import { useState, useEffect } from "react";
import { isMobile } from "react-device-detect";
import * as AIicon from "react-icons/ai";
import * as Ioicon from "react-icons/io";
import * as Fiicon from "react-icons/fi";
import { Web3Button } from "@web3modal/react";

// import { useWeb3React } from "@web3-react/core";
import { injected } from "../connecthook/connect";
import { switchNetwork } from "../connecthook/switch-network";
import { motion } from "framer-motion";
import {
  useAccount,
  useContract,
  useSigner,
  useConnect,
  useDisconnect,
} from "wagmi";
import { InjectedConnector } from "wagmi/connectors/injected";
import { TwitterIcon } from "./svgIcons";

export default function Header() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  // const web3 = useWeb3React();
  // const { account, chainId, activate, deactivate } = web3;
  const { address, isConnected } = useAccount();
  const { connect } = useConnect({
    connector: new InjectedConnector(),
  });
  const { disconnect } = useDisconnect();
  // console.log(web3);
  // async function connect() {
  //   if (chainId !== 1 || chainId === undefined) {
  //     switchNetwork();
  //   }
  //   try {
  //     await activate(injected);
  //     localStorage.setItem("isWalletConnected", "true");
  //   } catch (ex) {
  //     console.log(ex);
  //   }
  // }

  // async function disconnect() {
  //   try {
  //     deactivate();
  //     localStorage.setItem("isWalletConnected", "false");
  //   } catch (ex) {
  //     console.log(ex);
  //   }
  // }

  useEffect(() => {
    const connectWalletOnPageLoad = async () => {
      if (localStorage?.getItem("isWalletConnected") === "true") {
        try {
          await connect();
          localStorage.setItem("isWalletConnected", "true");
        } catch (ex) {
          localStorage.setItem("isWalletConnected", "false");
          console.log(ex);
        }
      }
    };
    connectWalletOnPageLoad();
  }, []);

  return (
    <header className="w-full">
      <div className="w-full z-[9999] bg-baseback fixed flex justify-center xs:justify-between items-center px-8 sm:px-16 xl:px-32 py-4">
        <Link href={`/`}>
          <div className="logo cursor-pointer flex items-center justify-center md:justify-between hidden xs:block">
            <h1 className="text-[36px] font-bold uppercase logo-text text-basecolor">
              Andrond
            </h1>
          </div>
        </Link>
        <div className="flex items-center justify-center gap-4">
          <img src="/img/mark_up.png" width={28} />
          <img src="/img/twitter.png" width={28} />
          {/* <Fiicon.FiTwitter
            width={20}
            radius={20}
            className="cursor-pointer text-basecolor bg-red"
          /> */}
          <Web3Button icon="hide" label={"Connect Wallet"} />

          {/* <div
            className="lg:hidden cursor-pointer"
            onClick={() => setOpen(true)}
          >
            <AIicon.AiOutlineMenu
              size={20}
              fontWeight={800}
              className="text-basecolor"
            />
          </div> */}
        </div>
        {open && (
          <motion.section
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ ease: "easeInOut", duration: 0.2, delay: 0.1 }}
          >
            <div className="fixed w-full right-0 bottom-0 left-0 bg-gray-800 opacity-[100%]">
              <div
                className="w-full flex justify-end p-7 cursor-pointer"
                onClick={() => setOpen(false)}
              >
                <AIicon.AiOutlineClose
                  color="white"
                  fontWeight={800}
                  size={20}
                />
              </div>
              <div className="w-full p-10 flex justify-center">
                <div className="w-full text-center">
                  <Link href={"/"}>
                    <div
                      className={`text-[2rem] hover:text-white duration-300 transition-all cursor-pointer list-none ${
                        router.pathname === "/"
                          ? "text-red-500 underline"
                          : "text-white"
                      }`}
                      onClick={() => setOpen(false)}
                    >
                      Home
                    </div>
                  </Link>
                  {/* <Link href={"/mint"}>
                    <div
                      className={`text-[2rem] hover:text-white duration-300 transition-all cursor-pointer list-none ${
                        router.pathname === "/mint"
                          ? "text-red-500 underline"
                          : "text-white"
                      }`}
                      onClick={() => setOpen(false)}
                    >
                      Collection
                    </div>
                  </Link>
                  <Link href={"/roadmap"}>
                    <div
                      className={`text-[2rem] hover:text-white duration-300 transition-all cursor-pointer list-none ${
                        router.pathname === "/roadmap"
                          ? "text-red-500 underline"
                          : "text-white"
                      }`}
                      onClick={() => setOpen(false)}
                    >
                      Roadmap
                    </div>
                  </Link>
                  <Link href={"/membership"}>
                    <div
                      className={`text-[2rem] hover:text-white duration-300 transition-all cursor-pointer list-none ${
                        router.pathname === "/membership"
                          ? "text-red-500 underline"
                          : "text-white"
                      }`}
                      onClick={() => setOpen(false)}
                    >
                      Membership
                    </div>
                  </Link>
                  <Link href={"/faq"}>
                    <div
                      className={`text-[2rem] hover:text-white duration-300 transition-all cursor-pointer list-none ${
                        router.pathname === "/faq"
                          ? "text-red-500 underline"
                          : "text-white"
                      }`}
                      onClick={() => setOpen(false)}
                    >
                      Faq
                    </div>
                  </Link>
                  <Link href={"/token"}>
                    <div
                      className={`text-[2rem] hover:text-white duration-300 transition-all cursor-pointer list-none ${
                        router.pathname === "/token"
                          ? "text-red-500 underline"
                          : "text-white"
                      }`}
                      onClick={() => setOpen(false)}
                    >
                      Beasttoken
                    </div>
                  </Link> */}
                </div>
              </div>
            </div>
          </motion.section>
        )}
      </div>
    </header>
  );
}

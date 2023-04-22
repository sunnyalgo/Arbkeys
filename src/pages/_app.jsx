import { useState } from "react";
import Header from "../components/Header";
import { ToastContainer } from "react-toastify";
import PageLoading from "../components/PageLoading";
import "../styles/style.scss";

import { Web3ReactProvider } from "@web3-react/core";
import { ethers } from "ethers";
import { motion } from "framer-motion";

import {
  EthereumClient,
  w3mConnectors,
  w3mProvider,
} from "@web3modal/ethereum";
import { Web3Modal } from "@web3modal/react";
import { configureChains, createClient, WagmiConfig } from "wagmi";
import { arbitrum, mainnet, goerli } from "wagmi/chains";

import Footer from "../components/Footer";

const chains = [goerli];
const projectId = "5ec45aaa225f34e643203fe4093a2856";

const { provider } = configureChains(chains, [w3mProvider({ projectId })]);
const wagmiClient = createClient({
  autoConnect: true,
  connectors: w3mConnectors({ projectId, version: 1, chains }),
  provider,
});
const ethereumClient = new EthereumClient(wagmiClient, chains);

function StakingApp({ Component, pageProps }) {
  const [loading, setLoading] = useState(false);

  const getLibrary = (provider) => {
    const library = new ethers.providers.Web3Provider(provider);
    library.pollingInterval = 8000; // frequency provider is polling
    return library;
  };

  const getChainId = (provider) => {
    const library = new ethers.providers.Web3Provider(provider);
    return library.chainId;
  };

  return (
    <motion.section
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ ease: "easeInOut", duration: 0.9, delay: 0.2 }}
    >
      <Web3ReactProvider getLibrary={getLibrary} chainId={getChainId}>
        <WagmiConfig client={wagmiClient}>
          <Header />
          <Component
            {...pageProps}
            startLoading={() => setLoading(true)}
            closeLoading={() => setLoading(false)}
          />
          <ToastContainer style={{ fontSize: 14 }} />
          <PageLoading loading={loading} />
          <Footer />
        </WagmiConfig>
      </Web3ReactProvider>
      <Web3Modal
        projectId={projectId}
        ethereumClient={ethereumClient}
        themeVariables={{
          "--w3m-font-family": "Roboto, sans-serif",
          "--w3m-accent-color": "#04E09F",
          "--w3m-accent-fill-color": "black",
          // "--w3m-button-border-radius": "none",
          "--w3m-button-padding": "4px",
        }}
      />
    </motion.section>
  );
}

export default StakingApp;

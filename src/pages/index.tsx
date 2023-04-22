import type { NextPage } from "next";
import Mint from "../components/mint";
import Image from 'next/image';


export interface NFTType {
  mint: string;
  staked: boolean;
  stakedTime: number;
}

const Home: NextPage = () => {
  const scrollToBottom = () => {
    window.scrollTo({
      top: document.body.scrollHeight,
      behavior: "smooth",
    });
  };

  return (
    <main className="w-full">
      <div className="w-full">
        <div className="relative">
          <div className="banner-gradient">
            <Image
              src="img/banner.png"
              alt=""
              className="w-full justify-center flex items-center pt-16 image-mask transparent"
            />
          </div>
          <Image
            src="img/mask.png"
            alt=""
            className="w-full absolute bottom-[-15px] xs:bottom-[-25px] md:bottom-[-40px]"
          />
        </div>
        <div className="mx-[32px] sm:mx-[128px] m-auto md:p-0  text-[20px] md:text-[18px]  xl:text-[20px] lg:absolute lg:w-[557px] top-[20%] left-[5%] xl:top-[23%] rounded-xl mt-16 lg:mt-4 text-center  lg:top-[18%]">
          
        </div>
      </div>
      <Mint></Mint>
    </main>
  );
};

export default Home;

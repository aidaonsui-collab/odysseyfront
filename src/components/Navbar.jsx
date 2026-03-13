import React, { useState } from "react";
import IconButton from "./buttons/IconButton";
import Search from "./forms/Search";
import LinkButton from "./buttons/LinkButton";
import Logo from "./Logo";
import AuthButton from "./AuthButton";
import { useLocation } from "react-router-dom";
import Button from "./Button";
import MenuSvg from "../assets/MenuSvg";
import { navigation } from "../constants";
import PrimaryButtonInvert from "./buttons/PrimaryButtonInvert";

const Navbar = ({ toggleOpenCreateCoin }) => {
  const path = useLocation();
  const [openNavigation, setOpenNavigation] = useState(false);

  const toggleNavigation = () => {
    if (openNavigation) {
      setOpenNavigation(false);
    } else {
      setOpenNavigation(true);
    }
  };

  const handleClick = () => {
    if (!openNavigation) return;
    setOpenNavigation(false);
  };
  return (
    <>
      <nav className="fixed top-0 z-50 w-full dark:bg-black">
        <div className="sm:px-4 sm:px-8 py-3 md:py-6 lg:px-5 lg:pl-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center justify-start">
              {/* Logo */}
              <Logo />

              {/* Nav and search */}
              <div className="hidden md:flex flex-row items-center gap-5">
                <LinkButton
                  name="About Us"
                  href="/about"
                  active={path.pathname === "/about"}
                />
                <Search />
              </div>
            </div>
            
            {/* Right side buttons */}
            <div className="flex items-center gap-3">
              {/* Stake $AIDA */}
              <a
                href="/stake"
                className="hidden md:block text-purple-400 hover:text-purple-300 text-sm px-3 py-2"
              >
                💰 Stake $AIDA
              </a>
              
              {/* Connect Wallet - prominent */}
              <div className="flex-shrink-0">
                <AuthButton />
              </div>
            </div>
            
            {/* Mobile menu button */}
            <Button className="md:hidden ml-2" onClick={toggleNavigation}>
              <MenuSvg openNavigation={openNavigation} />
            </Button>
          </div>
        </div>
        
        {/* Mobile nav */}
        {openNavigation && (
          <div className="md:hidden fixed top-[4.3rem] left-0 right-0 bottom-0 bg-black z-40 p-4">
            {navigation.map((item) => (
              <a
                key={item.id}
                href={item.url}
                onClick={handleClick}
                className="block py-3 text-gray-300 hover:text-white"
              >
                {item.title}
              </a>
            ))}
            <a href="/create-coin" className="block py-3 text-purple-400">
              Create Coin
            </a>
          </div>
        )}
        
        <hr className="border-none h-[2px] bg-gradient-to-r from-[#EC8AEF] to-[#8121E0]" />
      </nav>
    </>
  );
};

export default Navbar;

import { useLocation } from "react-router-dom";
import { disablePageScroll, enablePageScroll } from "scroll-lock";

import { navigation } from "../constants";
import Button from "./Button";
import MenuSvg from "../assets/MenuSvg";
import { useState } from "react";
import AuthButton from "./AuthButton";

const Header = () => {
  const pathname = useLocation();
  const [openNavigation, setOpenNavigation] = useState(false);

  const toggleNavigation = () => {
    if (openNavigation) {
      setOpenNavigation(false);
      enablePageScroll();
    } else {
      setOpenNavigation(true);
      disablePageScroll();
    }
  };

  const handleClick = () => {
    if (!openNavigation) return;

    enablePageScroll();
    setOpenNavigation(false);
  };

  return (
    <div
      className={`fixed top-0 left-0 w-full z-50 border-b border-n-6 border-gray-500 lg:bg-n-8/90 lg:backdrop-blur-sm ${
        openNavigation ? "bg-n-8" : "bg-n-8/90 backdrop-blur-sm"
      }`}
    >
      <style>{`
        .suiet-wallet-connect-button > button > div > svg:last-child,
        [class*="notification"],
        [data-icon*="bell"],
        .suiet-icon-bell {
          display: none !important;
        }
      `}</style>
      <div className="flex w-full items-center justify-between px-2 lg:px-7.5 xl:px-10 max-lg:py-2" style={{ minWidth: 'max-content' }}>
        
        {/* Logo */}
        <a className="block w-[12rem] xl:mr-8 flex-shrink-0" href="#hero">
          <span className="text-xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
            TheOdyssey.fun
          </span>
        </a>

        {/* Navigation Links */}
        <nav className="hidden lg:flex items-center gap-6 mx-8">
          {navigation.map((item) => (
            <a
              key={item.id}
              href={item.url}
              onClick={handleClick}
              className="text-xs font-semibold text-gray-300 hover:text-white whitespace-nowrap"
            >
              {item.title}
            </a>
          ))}
        </nav>

        {/* Right side buttons */}
        <div className="flex items-center gap-3 flex-shrink-0">
          <a
            href="/create-coin"
            className="button text-n-1/50 transition-colors hover:text-n-1 py-2 px-4 text-sm"
          >
            Create Coin
          </a>
          <AuthButton />
        </div>

        {/* Mobile menu button */}
        <Button
          className="lg:hidden ml-2"
          px="px-3"
          onClick={toggleNavigation}
        >
          <MenuSvg openNavigation={openNavigation} />
        </Button>
      </div>
    </div>
  );
};

export default Header;

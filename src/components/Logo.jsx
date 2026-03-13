import React from "react";
import { Link } from "react-router-dom";

const Logo = () => {
  return (
    <Link to="/" className="flex ms-2 md:me-24">
      <span className="self-center sm:text-sm md:text-2xl font-bold whitespace-nowrap bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
        TheOdyssey.fun
      </span>
    </Link>
  );
};

export default Logo;

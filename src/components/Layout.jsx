import React, { useState } from "react";
import Navbar from "./Navbar";
import Sidebar from "./Sidebar";
import Footer from "./Footer";

const Layout = ({ children }) => {
  const [open, setOpen] = useState(false);
  const [openCreateCoin, setOpenCreateCoin] = useState(false);

  const toggleOpenCreateCoin = () => {
    setOpenCreateCoin(!openCreateCoin);
  };

  return (
    <>
      {/* Full-width responsive container */}
      <div className="relative my-0 mx-auto w-full max-w-full">
        <Navbar toggleOpenCreateCoin={toggleOpenCreateCoin} />
        <div className="flex flex-row w-full">
          <Sidebar setOpen={setOpen} open={open} toggleOpenCreateCoin={toggleOpenCreateCoin} />
          <div
            className={`w-full ${
              open ? "lg:max-w-[calc(100%-200px)]" : "lg:max-w-[calc(100%-80px)]"
            } min-h-screen mt-[13%] lg:mt-[6.8%] px-4 lg:px-6 pb-8`}
          >
            {children}
          </div>
        </div>
        <Footer />
      </div>
    </>
  );
};

export default Layout;

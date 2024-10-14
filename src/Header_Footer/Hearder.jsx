import React, { useContext } from "react";
import { AuthContext } from "../Router/ProtectedRoute";
import logo from "../assets/logo.png";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faRightFromBracket } from "@fortawesome/free-solid-svg-icons";

const Hearder = () => {
  const { logout } = useContext(AuthContext);
  const handleLogout = () => {
    logout();
    window.location.reload();
  };
  return (
    <div className="w-full bg-white">
      <header className="fixed h-20 items-center top-0 p-4 flex left-0 z-50 w-full bg-[#2F4F4F] text-[#eaf9e7] py-2">
        <img src={logo} alt="logo" className="w-14 h-14 rounded-full" />
        <span className="ml-2 text-3xl font-bold">Voucher4U</span>
        <div className="flex items-center ml-auto">
          <button
            className="bg-[#4ca771] hover:bg-[#eaf9e7] font-bold text-lg text-[#eaf9e7] hover:text-[#4ca771] border-2 border-[#4ca771] p-2 rounded-lg w-fit h-fit flex items-center justify-center"
            onClick={handleLogout}
          >
            <FontAwesomeIcon className="mr-2" icon={faRightFromBracket} /> Đăng
            xuất
          </button>
        </div>
      </header>
    </div>
  );
};

export default Hearder;

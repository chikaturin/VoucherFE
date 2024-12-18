import React from "react";
import { Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChartLine, faTicket } from "@fortawesome/free-solid-svg-icons";

const Nav = () => {
  return (
    <div className="sticky top-0 bg-gradient-to-bl bg-[#5c98c5]  text-[#eaf9e7] w-full lg:h-full p-0 m-0">
      <h1 className="font-extrabold text-xl text-center pt-8 pb-10">
        DANH MỤC QUẢN LÝ
      </h1>
      <div className="p-4">
        <ul className="flex lg:block items-center">
          <Link
            to="DashBoardPartner"
            className="w-full route text-lg lg:text-xl font-extrabold">
            <li className="w-full lg:hover:px-5 py-2 hover:bg-[#eaf9e7] hover:text-[#3D78A5] text-center lg:text-left rounded-full mb-4">
              <FontAwesomeIcon icon={faChartLine} /> Thống kê
            </li>
          </Link>
          <Link
            to="ListVoucherPN"
            className="w-full route text-lg lg:text-xl font-extrabold">
            <li className="w-full lg:hover:px-5 py-2 hover:bg-[#eaf9e7] hover:text-[#3D78A5] text-center lg:text-left rounded-full mb-4">
              <FontAwesomeIcon icon={faTicket} /> Voucher
            </li>
          </Link>
        </ul>
      </div>
    </div>
  );
};

export default Nav;

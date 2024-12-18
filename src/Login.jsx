import React, { useState } from "react";
import { faEarthAsia } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useNavigate } from "react-router-dom";
import { SSO } from "@htilssu/wowo";
import axios from "axios";
const sso = new SSO("V4U");
const Login = () => {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [success, setSuccess] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const URL = "https://server-voucher.vercel.app/api";
  const URL_CALLBACK = "https://voucher4u.io.vn/sso";
  function handleLoginSSO() {
    sso.redirectToLogin(`${URL_CALLBACK}`);
  }

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setIsLoading(true);

    if (!name || !password) {
      setError("Please fill in all fields");
      setIsLoading(false);
      return;
    }

    try {
      const response = await axios.post(`${URL}/signIn`, {
        Name: name,
        PassWord: password,
      });

      if (response.status === 200) {
        const token = response.data.AccessTokken;
        window.location.href = `${URL_CALLBACK}?Token=${token}`;
      } else {
        throw new Error("Đăng nhập không thành công.");
      }
    } catch (error) {
      setIsLoading(false);
      if (error.response) {
        setError(
          error.response.data.message ||
            "Có lỗi xảy ra trong quá trình đăng nhập."
        );
      } else {
        setError("Có lỗi xảy ra trong quá trình đăng nhập. Vui lòng thử lại.");
      }
    }
  };

  return (
    <div
      className={`flex items-center justify-center w-full h-screen lg:pb-0 py-28 bg-cover bg-[url(./assets/imagelogin.jpg)]`}
    >
      <div
        className="w-full lg:p-0 m-4 lg:w-1/3 bg-white bg-opacity-50 backdrop-blur-md rounded-3xl text-[#2F4F4F] overflow-hidden shadow-xl shadow-[#2F4F4F]"
        id="loginForm"
      >
        <div className="w-full p-6 ">
          <p className="w-full text-4xl font-bold text-center mb-10">
            Login to your account
          </p>
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="rounded-3xl text-xl mb-4">
              <p className="px-4 pt-2 rounded-full font-semibold">
                Can we have your Name?
              </p>
              <input
                type="text"
                className="w-full rounded-full text-lg py-2 px-4 bg-transparent outline-none border-b-4 border-[#2F4F4F] placeholder:text-[#2F4F4F]"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Name"
                required
              />
            </div>
            <div className="rounded-3xl text-xl">
              <p className="px-4 pt-2 rounded-full font-semibold">
                And your Password?
              </p>
              <input
                type="password"
                className="w-full rounded-full text-lg py-2 px-4 bg-transparent outline-none border-b-4 border-[#2F4F4F] placeholder:text-[#2F4F4F]"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password"
                required
              />
            </div>
            <p className="text-right mt-1 cursor-pointer hover:text-[#eaf9e7]">
              Forgot your Password?
            </p>
            <div className="grid grid-cols-12 my-4">
              <div className="col-span-5 flex items-center">
                <div className="border border-[#2F4F4F] w-full"></div>
              </div>
              <div className="col-span-2 text-center text-lg">or</div>
              <div className="col-span-5 flex items-center">
                <div className="border border-[#2F4F4F] w-full"></div>
              </div>
            </div>
            <div className="flex items-center text-3xl justify-center">
              <button
                onClick={handleLoginSSO}
                type="button"
                className="w-fit grid grid-row-2 hover:text-[#eaf9e7] cursor-pointer"
              >
                <div className="flex justify-center">
                  <FontAwesomeIcon icon={faEarthAsia} />
                </div>
                <span className="text-base">Oggy Login System</span>
              </button>
            </div>
            <button
              type="submit"
              className="my-6 w-full text-center text-xl py-3 font-bold cursor-pointer border-2 border-[#2F4F4F] hover:bg-[#2F4F4F] hover:text-white rounded-xl"
              disabled={isLoading}
            >
              {isLoading ? "Logging in..." : "Login"}
            </button>
          </form>
          {success && (
            <p className="text-green-500 text-center mt-4">{success}</p>
          )}
          {error && <p className="text-red-500 text-center mt-4">{error}</p>}
        </div>
      </div>
    </div>
  );
};

export default Login;

import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTrash } from "@fortawesome/free-solid-svg-icons";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";

const CreateVoucher = () => {
  const URL = "http://localhost:4001/api";

  const [Voucher, setVoucher] = useState({
    _id: "",
    Name: "",
    ReleaseTime: "",
    ExpiredTime: "",
    Description: "",
    Image: "",
    RemainQuantity: 0,
    MinValue: 0,
    MaxValue: 0,
    PercentDiscount: 0,
    Conditions: [],
    HaveVouchers: [],
  });

  const [condition, setCondition] = useState({
    MinValue: "",
    MaxValue: "",
    PercentDiscount: "",
  });

  const [services, setServices] = useState([]);
  const [selectedServices, setSelectedServices] = useState([]);
  const Token = localStorage.getItem("Token");
  const navigate = useNavigate();

  const [ExpiredTime, setExpiredDate] = useState(null);
  const [ReleaseTime, setReleaseDate] = useState(null);
  const [showExpiredCalendar, setShowExpiredCalendar] = useState(false);
  const [showReleaseCalendar, setShowReleaseCalendar] = useState(false);

  const formatDate = (a) => {
    return new Date(a).toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  let nextDate = new Date();
  nextDate.setDate(nextDate.getDate() + 1);

  const toggleExpiredCalendar = (e) => {
    e.preventDefault();
    setShowExpiredCalendar(!showExpiredCalendar);
  };

  const toggleReleaseCalendar = (e) => {
    e.preventDefault();
    setShowReleaseCalendar(!showReleaseCalendar);
  };

  const handExpiredDateChange = (date) => {
    setExpiredDate(date);
    setShowExpiredCalendar(!showExpiredCalendar);
  };

  const handleReleaseDateChange = (date) => {
    setReleaseDate(date);
    setShowReleaseCalendar(!showReleaseCalendar);
  };

  const fetchServices = async () => {
    try {
      const response1 = await fetch(
        "https://server-voucher.vercel.app/api/readtoken",
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${Token}`,
          },
        }
      );

      if (!response1.ok) {
        throw new Error(
          `Error fetching token: ${response1.status} ${response1.statusText}`
        );
      }

      const dataToken = await response1.json();
      const serviceId = dataToken.PartnerService[0].serviceId;

      const response = await fetch(`${URL}/getServiceID/${serviceId}`);

      if (!response.ok) {
        throw new Error(
          `Error fetching services: ${response.status} ${response.statusText}`
        );
      }

      const data = await response.json();
      setServices(data);
    } catch (error) {
      console.error("Error fetching services:", error);
    }
  };

  useEffect(() => {
    fetchServices();
  }, []);

  const deleteCondition = (indexToDelete) => {
    setVoucher((prevVoucher) => ({
      ...prevVoucher,
      Conditions: prevVoucher.Conditions.filter((_, i) => i !== indexToDelete),
    }));
  };

  const handleConditionChange = (e) => {
    const { name, value } = e.target;
    setCondition((prev) => ({ ...prev, [name]: value }));
  };

  const addCondition = () => {
    if (Voucher.Conditions.length >= 3) {
      alert("You can't add more than 3 conditions");
      return;
    }

    if (!condition.MinValue || !condition.MaxValue) {
      alert("Please fill all the condition fields");
      return;
    }

    setVoucher((prev) => ({
      ...prev,
      Conditions: [...prev.Conditions, condition],
    }));

    setCondition({ MinValue: "", MaxValue: "", PercentDiscount: "" });
  };

  const handleServiceChange = (e) => {
    const { value, checked } = e.target;
    setSelectedServices((prev) =>
      checked ? [...prev, value] : prev.filter((id) => id !== value)
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (
      !Voucher._id ||
      !Voucher.Name ||
      !ExpiredTime ||
      !ReleaseTime ||
      !Voucher.Description ||
      !Voucher.Image ||
      !Voucher.RemainQuantity ||
      !Voucher.Conditions.length ||
      !selectedServices.length
    ) {
      alert("Please fill all the fields");
      return;
    }

    const formdata = new FormData();
    const imageFile = Voucher.Image;
    formdata.append("voucher", imageFile);
    formdata.append("_id", Voucher._id);
    formdata.append("Name", Voucher.Name);
    formdata.append("ReleaseTime", ReleaseTime);
    formdata.append("ExpiredTime", ExpiredTime);
    formdata.append("Description", Voucher.Description);
    formdata.append("RemainQuantity", Number(Voucher.RemainQuantity));
    formdata.append("PercentDiscount", Number(Voucher.PercentDiscount));

    Voucher.Conditions.forEach((cond, index) => {
      formdata.append(`Conditions[${index}][MinValue]`, Number(cond.MinValue));
      formdata.append(`Conditions[${index}][MaxValue]`, Number(cond.MaxValue));
    });

    selectedServices.forEach((serviceId, index) => {
      formdata.append(`HaveVouchers[${index}][Service_ID]`, serviceId);
    });

    try {
      const response = await fetch(`${URL}/createVoucherByPartner`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("Token")}`,
        },
        body: formdata,
      });

      const data = await response.json();
      if (response.ok) {
        alert("Voucher created successfully");
        navigate("/Partner/ListvoucherPN");
      } else {
        alert("Error: " + (data?.message || "Failed to create voucher"));
      }
    } catch (err) {
      console.error("Error creating voucher:", err);
      alert("An error occurred while creating the voucher");
    }
  };

  return (
    <div className="lg:bg-[#eaf9e7] bg-[#75bde0]">
      <div className="w-full bg-[#eaf9e7] p-4 px-10 bg-gradient-to-bl to-[#75bde0] from-30% from-[#eeeeee]">
        <h1 className="text-4xl text-[#274f6c] mb-10 mt-4 w-full text-center font-bold">
          Tạo voucher
        </h1>
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
            <div className="grid grid-cols-12 items-center bg-[#c6d6ff] text-[#3775A2] py-1 pl-4 rounded-lg h-12">
              <div className="col-span-12">
                <label className="font-bold text-[#3775A2]">Mã Voucher</label>
              </div>
              <div className="col-span-12">
                <input
                  className="border-2 placeholder-[#5b91de] border-[#bad3e6] outline-none px-2 py-2 h-full w-full rounded-lg bg-white"
                  type="text"
                  placeholder="Nhập mã voucher"
                  value={Voucher._id}
                  maxLength={10}
                  onChange={(e) =>
                    setVoucher({ ...Voucher, _id: e.target.value })
                  }
                />
              </div>
            </div>
            <div className="grid grid-cols-12 items-center bg-[#c6d6ff] text-[#3775A2] py-1 pl-4 rounded-lg h-12">
              <div className="col-span-12">
                <label className="font-bold text-[#3775A2]">Name</label>
              </div>
              <div className="col-span-12">
                <input
                  className="border-2 placeholder-[#5b91de] border-[#c6d6ff] outline-none px-2 py-2 h-full w-full rounded-lg bg-white"
                  type="text"
                  placeholder="Nhập tên voucher"
                  value={Voucher.Name}
                  onChange={(e) =>
                    setVoucher({ ...Voucher, Name: e.target.value })
                  }
                />
              </div>
            </div>
          </div>
          <div className="mt-10 grid grid-cols-12 items-center bg-[#c6d6ff] text-[#3775A2] py-1 pl-4 rounded-lg h-12">
            <div className="col-span-12">
              <label className="font-bold text-[#3775A2]">Description</label>
            </div>
            <div className="col-span-12">
              <input
                className="border-2 placeholder-[#5b91de] border-[#c6d6ff] outline-none px-2 py-2 h-full w-full rounded-lg bg-white"
                type="text"
                placeholder="Nhập mô tả"
                value={Voucher.Description}
                onChange={(e) =>
                  setVoucher({ ...Voucher, Description: e.target.value })
                }
              />
            </div>
          </div>
          <div className="mt-10 grid grid-cols-1 lg:grid-cols-2 gap-10">
            <div className="grid grid-cols-12 items-center bg-[#c6d6ff] text-[#3775A2] py-1 pl-4 rounded-lg h-12">
              <div className="col-span-12">
                <label className="font-bold text-[#3775A2]">Release Time</label>
              </div>
              <div
                className="col-span-12 w-full"
                onClick={toggleReleaseCalendar}
              >
                <span className="block border-2 border-[#75bde0] outline-none text-[#3b7097] placeholder:text-[#75bde0] py-[0.65rem] px-2 h-full w-full rounded-lg bg-[#ffffff]">
                  {ReleaseTime ? (
                    <span>{formatDate(ReleaseTime)}</span>
                  ) : (
                    <span>Chọn ngày </span>
                  )}
                  {showReleaseCalendar && (
                    <div className="absolute mt-6 z-50 bg-[#ffffff] rounded-lg shadow-xl shadow-[#75bde0] p-4 w-fit">
                      <Calendar
                        onChange={handleReleaseDateChange}
                        value={ReleaseTime}
                        minDate={new Date()}
                      />
                    </div>
                  )}
                </span>
              </div>
            </div>
            <div className="grid grid-cols-12 items-center bg-[#c6d6ff] text-[#3775A2] py-1 pl-4 rounded-lg h-12">
              <div className="col-span-12">
                <label className="font-bold text-[#3775A2]">Expired Time</label>
              </div>
              <div
                className="col-span-12 w-full"
                onClick={toggleExpiredCalendar}
              >
                <span className="block border-2 border-[#75bde0] outline-none text-[#3b7097] placeholder:text-[#75bde0] py-[0.65rem] px-2 h-full w-full rounded-lg bg-[#ffffff]">
                  {ExpiredTime ? (
                    <span>{formatDate(ExpiredTime)}</span>
                  ) : (
                    <span>Chọn ngày</span>
                  )}
                  {showExpiredCalendar && (
                    <div className="absolute mt-6 w-fit right-40 z-50 bg-[#ffffff] rounded-lg shadow-xl shadow-[#75bde0] p-4">
                      <Calendar
                        onChange={handExpiredDateChange}
                        value={ExpiredTime}
                        minDate={nextDate}
                      />
                    </div>
                  )}
                </span>
              </div>
            </div>
          </div>
          <div className="mt-10 grid grid-cols-1 lg:grid-cols-2 gap-10">
            <div className="grid grid-cols-12 items-center bg-[#c6d6ff] text-[#3775A2] py-1 pl-4 rounded-lg h-12">
              <div className="col-span-5">
                <label className="font-bold text-[#3775A2] line-clamp-1">
                  Discount Percentage
                </label>
              </div>
              <div className="col-span-12">
                <input
                  placeholder={
                    Voucher.PercentDiscount == 0
                      ? "Nhập phần trăm giảm giá"
                      : Voucher.PercentDiscount
                  }
                  className="border-2 placeholder-[#5b91de] border-[#c6d6ff] outline-none px-2 py-2 h-full w-full rounded-lg bg-white"
                  type="number"
                  name="PercentDiscount"
                  onChange={(e) =>
                    setVoucher({
                      ...Voucher,
                      PercentDiscount: Number(e.target.value),
                    })
                  }
                />
              </div>
            </div>
            <div className="grid grid-cols-12 items-center bg-[#c6d6ff] text-[#3775A2] pl-4 rounded-lg h-12">
              <div className="col-span-5">
                <label className="font-bold text-[#3775A2]">Quantity</label>
              </div>
              <div className="col-span-12">
                <input
                  placeholder={
                    Voucher.RemainQuantity == 0
                      ? "Nhập phần số lượng voucher"
                      : Voucher.RemainQuantity
                  }
                  className="border-2 placeholder-[#5b91de] border-[#c6d6ff] outline-none px-2 py-2 h-full w-full rounded-lg bg-white"
                  type="number"
                  onChange={(e) =>
                    setVoucher({
                      ...Voucher,
                      RemainQuantity: Number(e.target.value),
                    })
                  }
                />
              </div>
            </div>
          </div>

          <div className="mt-10 grid grid-cols-12 items-center bg-[#c6d6ff] text-[#3775A2] py-1 pl-4 rounded-lg h-12">
            <div className="col-span-12">
              <label className="font-bold text-[#3775A2]">Image</label>
            </div>
            <div className="col-span-12">
              <input
                type="file"
                accept="image/*"
                onChange={(e) =>
                  setVoucher({ ...Voucher, Image: e.target.files[0] })
                }
                className="file-input outline-none file:border-0 file:rounded-full file:shadow-md file:shadow-[#ffffff] file:text-[#5b91de] file:bg-[#ffffff] w-full bg-[#ffffff] shadow-md shadow-[#ffffff] text-[#5b91de] placeholder-[#5b91de] text-lg rounded-full"
              />
            </div>
          </div>
          <div className="mt-10 pt-5 grid grid-cols-1 lg:grid-cols-2 gap-10 item-center border border-transparent border-t-[#c0e6ba]">
            <div className="grid grid-cols-12 items-center bg-[#c6d6ff] text-[#3775A2] py-1 pl-4 rounded-lg h-12">
              <div className="col-span-4">
                <label className="font-bold w-full text-[#3775A2] line-clamp-1">
                  Số tiền tối thiểu
                </label>
              </div>
              <div className="col-span-12">
                <input
                  placeholder="Nhập giá trị đơn hàng tối thiểu để giám giá"
                  className="border-2 placeholder-[#5b91de] border-[#c6d6ff] outline-none px-2 py-2 h-full w-full rounded-lg bg-white"
                  type="number"
                  name="MinValue"
                  value={condition.MinValue}
                  onChange={handleConditionChange}
                />
              </div>
            </div>
            <div className="grid grid-cols-12 items-center bg-[#c6d6ff] text-[#3775A2] py-1 pl-4 rounded-lg h-12">
              <div className="col-span-4">
                <label className="font-bold text-[#3775A2] line-clamp-1">
                  Số tiền tối đa giảm
                </label>
              </div>
              <div className="col-span-12">
                <input
                  placeholder="Nhập giá trị tối đa được giảm"
                  className="border-2 placeholder-[#5b91de] border-[#c6d6ff] outline-none px-2 py-2 h-full w-full rounded-lg bg-white"
                  type="number"
                  name="MaxValue"
                  value={condition.MaxValue}
                  onChange={handleConditionChange}
                />
              </div>
            </div>
          </div>

          <div className="mt-20 grid grid-cols-1 lg:grid-cols-2 gap-10 item-center">
            <div className="border-8 border-[#4c89a7] rounded-lg h-fit">
              <div className="grid grid-cols-2 items-center">
                <div>
                  <h2 className="text-xl font-bold text-[#3775A2] ml-4">
                    Conditions:
                  </h2>
                </div>
                <div className="flex justify-end">
                  <button
                    type="button"
                    className="lg:col-span-2 border-2 border-[#4c83a7] bg-[#4c84a7] hover:bg-[#e7f3f9] text-[#e7f1f9] hover:text-[#4c83a7] px-4 py-2 rounded-bl-lg"
                    onClick={addCondition}
                  >
                    Add Condition
                  </button>
                </div>
              </div>
              <div className="mt-5 px-4">
                <ul>
                  {Voucher.Conditions.map((cond, index) => (
                    <li
                      key={index}
                      className="mb-2 text-[#4c84a7] font-semibold"
                    >
                      <span className="text-[#2F4F4F] font-bold text-xl">
                        •{" "}
                      </span>
                      Giảm {Voucher.PercentDiscount}%, tối đa {cond.MaxValue}đ
                      cho đơn hàng từ {cond.MinValue}đ
                      <button
                        className="float-right"
                        onClick={() => deleteCondition(index)}
                      >
                        <FontAwesomeIcon icon={faTrash} />
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
            <div>
              <div className="collapse">
                <input type="checkbox" />
                <div className="collapse-title text-lg text-[#eaf9e7] font-bold bg-[#4c84a7] w-fit rounded-t-2xl px-10">
                  Select Services:
                </div>
                <div className="collapse-content bg-[#4c84a7] rounded-r-2xl">
                  <div className="bg-gradient-to-r from-[#eaf9e7] to-[#5ca0ca] p-4 rounded-xl text-lg mt-4 max-h-36 overflow-scroll">
                    <div className="flex items-center text-[#2F4F4F]">
                      <input
                        type="checkbox"
                        id={services.id}
                        value={services.id}
                        checked={selectedServices.includes(services.id)}
                        onChange={handleServiceChange}
                        className="accent-[#4ac771]"
                      />
                      <label
                        htmlFor={services.id}
                        className="ml-2 text-[#2e6bb1]"
                      >
                        {services.name}
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-10 grid grid-cols-12 gap-10 w-full justify-center">
            {/* <div className="col-span-1"></div> */}
            <div className="col-span-6">
              <button className="bg-[#3B7097] hover:bg-[#e7eef9] font-bold text-lg text-[#e7eef9] hover:text-[#3B7097] border-2 border-[#3B7097] p-2 rounded-lg flex items-center justify-center w-full">
                Create
              </button>
            </div>
            <div className="col-span-3">
              <Link
                to="/Partner/Listvoucher"
                className="bg-[#2f414f] hover:bg-[#eaf9e7] font-bold text-lg text-[#eaf9e7] hover:text-[#2F4F4F] border-2 border-[#2F4F4F] p-2 rounded-lg flex items-center justify-center w-full"
              >
                Back
              </Link>
            </div>
            <div className="col-span-3">
              <div>
                <div
                  className="hover:bg-[#d0f0ff] bg-[#74bce8] font-bold text-lg hover:text-[#68b1ff] text-[#ffffff] border-2 border-[#74bce8] p-2 rounded-lg flex items-center justify-center w-full"
                  onClick={() =>
                    document.getElementById("my_modal_1").showModal()
                  }
                >
                  <span className="ml-2">Report</span>
                </div>
                <dialog id="my_modal_1" className="modal">
                  <div className="modal-box bg-[#2F4F4F]">
                    <h3 className="font-bold text-xl text-[#eaf9e7]">
                      What's wrong?
                    </h3>
                    <div className="grid grid-cols-4 items-center bg-gradient-to-r from-[#eaf9e7] from-10% to-[#2F4F4F] text-[#2F4F4F] py-1 pl-4 rounded-lg h-12">
                      <div className="col-span-4">
                        <label className="font-bold">Lỗi gặp phải</label>
                      </div>
                      <div className="col-span-2 h-24">
                        <textarea
                          className="border-l-4 border-[#2F4F4F] bg-[#eaf9e7] outline-none px-2 py-2 h-full w-full rounded-2xl text-wrap resize-none"
                          placeholder="Mô tả vấn đề"
                          rows={5}
                          onChange={() => {}}
                        />
                      </div>
                    </div>
                    <div className="modal-action mt-7">
                      <form method="dialog">
                        <button className="btn bg-[#eaf9e7] hover:bg-[#2F4F4F] border-2 border-[#eaf9e7] text-[#2F4F4F] hover:text-[#eaf9e7]">
                          Close
                        </button>
                      </form>
                    </div>
                  </div>
                </dialog>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateVoucher;

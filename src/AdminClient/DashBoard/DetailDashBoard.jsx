import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faXmark } from "@fortawesome/free-solid-svg-icons";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
} from "chart.js";

ChartJS.register(
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title
);

const DetailDashBoard = () => {
  const { id } = useParams();
  const { month } = useParams();
  const { year } = useParams();
  const [history, setHistory] = useState([]);
  const [voucher, setVoucher] = useState(null);
  const [totalUse, settotalUse] = useState(0);
  const [totalDiscount, settotalDiscount] = useState(0);
  const [firstdate, setfirstdate] = useState("");
  const [lastdate, setlastdate] = useState("");
  const [totalCus, settotalCus] = useState(0);
  const [customer, setCustomer] = useState([]);
  const [serviceNames, setServiceNames] = useState({});

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const URL = "https://server-voucher.vercel.app/api";

  const formattedPrice = (price) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(price);
  };

  const aggregateDataByDate = (data) => {
    const result = data.reduce((acc, item) => {
      const { Date: dateString, TotalDiscount } = item;

      const date = new Date(dateString).toISOString().split("T")[0];

      const existingEntry = acc.find((entry) => entry.date === date);

      if (existingEntry) {
        existingEntry.totalDiscount += TotalDiscount;
      } else {
        acc.push({
          date,
          totalDiscount: TotalDiscount,
        });
      }

      return acc;
    }, []);

    return result.map(({ date, totalDiscount }) => ({
      date,
      totalDiscount,
    }));
  };

  const aggregatedData = aggregateDataByDate(history);

  const chartData = {
    labels: aggregatedData.map((item) => item.date),
    datasets: [
      {
        label: "Total Discount",
        data: aggregatedData.map((item) => item.totalDiscount),
        fill: false,
        borderColor: "#0040ff",
        tension: 0.4,
      },
    ],
  };

  const date = (a) => {
    return new Date(a).toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  const fetchDetailHistory = async () => {
    try {
      const response = await fetch(
        `${URL}/Statistical_ID/${id}/${month}/${year}`
      );
      const data = await response.json();
      setHistory(data.history);
      setVoucher(data.voucher);
      console.log("his", data.history);
      console.log("vou", data.voucher);
    } catch (error) {
      setError(error);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchDetailHistory();
  }, [id]);

  useEffect(() => {
    if (history.length > 0) {
      setfirstdate(history[0].Date);
      setlastdate(history[history.length - 1].Date);

      let discountSum = 0;
      let uniqueCustomers = new Set();

      for (let i = 0; i < history.length; i++) {
        discountSum += history[i].TotalDiscount;
        uniqueCustomers.add(history[i].CusID);
      }

      settotalDiscount(discountSum);
      settotalCus(uniqueCustomers.size);
      setCustomer(Array.from(uniqueCustomers));
      settotalUse(history.length);
    }
  }, [history]);

  const fetchServiceID = async (serviceId) => {
    try {
      const response = await fetch(`${URL}/getServiceID/${serviceId}`);
      if (response.ok) {
        const data = await response.json();
        return data.name;
      } else {
        throw new Error("Failed to fetch service name");
      }
    } catch (error) {
      console.error("Error fetching service name:", error);
      return "Unknown Service";
    }
  };

  useEffect(() => {
    if (voucher) {
      const fetchServiceNames = async () => {
        const names = {};
        for (const haveVoucher of voucher[0].haveVouchers) {
          names[haveVoucher.Service_ID] = await fetchServiceID(
            haveVoucher.Service_ID
          );
        }
        setServiceNames(names);
      };
      if (voucher[0].haveVouchers.length > 0) {
        fetchServiceNames();
      }
    }
  }, [voucher]);

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: "top",
      },
      title: {
        font: { size: "20px" },
        display: true,
        text: "Biểu đồ thống kê số tiền giảm giá theo tháng",
      },
    },
    scales: {
      y: {
        beginAtZero: true,
      },
    },
  };

  if (loading) {
    return (
      <div className="bg-gradient-to-bl to-[#5ec964] from-[#eeeeee] h-full flex items-center justify-center">
        <span className="font-extrabold text-black text-4xl text-center">
          Loading...
        </span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center w-full text-4xl translate-y-1/2 h-full font-extrabold">
        {error}
      </div>
    );
  }

  return (
    <div className="text-[#2F4F4F] p-4 w-full h-full bg-[#EAF8E6] ">
      <h1 className="text-3xl text-black font-bold text-center">
        DETAIL DASHBOARD OF VOUCHER
      </h1>
      <div className="col-span-1 float-right mr-4  flex items-center ">
        <Link to={`/Admin/ChartVoucher`}>
          <button className="bg-[#eaf9e7] hover:bg-[#55bc66] w-10 h-10 border-4 border-[#57bc55] hover:text-[#eaf9e7] font-bold rounded-full">
            <FontAwesomeIcon icon={faXmark} />
          </button>
        </Link>
      </div>
      <p className="text-3xl text-[#5b9551] font-bold lg:ml-0 ml-12 text-center">
        {id}
      </p>
      <div className="grid lg:grid-cols-4 grid-cols-2 gap-[30px] mt-[25px] pb-[15px]">
        <div className="h-[100px] rounded-[8px] bg-white border-l-[4px] border-[#4edf58] flex items-center justify-between px-[30px] cursor-pointer hover:shadow-lg transform hover:scale-[103%] transition duration-300 ease-out">
          <div>
            <h2 className="text-[#B589DF] text-[11px] leading-[17px] font-bold">
              TỔNG TIỀN ĐƯỢC GIẢM GIÁ
            </h2>
            <h1 className="text-[20px] leading-[24px] font-bold text-[#5a5c69] mt-[5px]">
              {formattedPrice(totalDiscount)}
            </h1>
          </div>
        </div>
        <div className="h-[100px] rounded-[8px] bg-white border-l-[4px] border-[#1CC88A] flex items-center justify-between px-[30px] cursor-pointer hover:shadow-lg transform hover:scale-[103%] transition duration-300 ease-out">
          <div>
            <h2 className="text-[#1cc88a] text-[11px] leading-[17px] font-bold">
              SỐ KHÁCH HÀNG SỬ DỤNG
            </h2>
            <h1 className="text-[20px] leading-[24px] font-bold text-[#5a5c69] mt-[5px]">
              {totalCus}
            </h1>
          </div>
        </div>
        <div className="h-[100px] rounded-[8px] bg-white border-l-[4px] border-[#36B9CC] flex items-center justify-between px-[30px] cursor-pointer hover:shadow-lg transform hover:scale-[103%] transition duration-300 ease-out">
          <div className="w-full">
            <h2 className="text-[#1cc88a] lg:block hidden text-[11px] leading-[17px] font-bold">
              NGÀY BẮT ĐẦU-NGÀY KẾT THÚC
            </h2>
            <h1 className="text-[17px] leading-[24px] font-bold text-[#5a5c69] mt-[5px]">
              <span>{date(firstdate)}</span>
              <span className="text-[10px] pb-10 px-2">-</span>
              <span>{date(lastdate)}</span>
            </h1>
          </div>
        </div>
        <div className="h-[100px] rounded-[8px] bg-white border-l-[4px] border-[#F6C23E] flex items-center justify-between px-[30px] cursor-pointer hover:shadow-lg transform hover:scale-[103%] transition duration-300 ease-out">
          <div>
            <h2 className="text-[#1cc88a] text-[11px] leading-[17px] font-bold">
              SỐ LƯỢNG VOUCHER SỬ DỤNG
            </h2>
            <h1 className="text-[20px] leading-[24px] font-bold text-[#5a5c69] mt-[5px]">
              {totalUse}
            </h1>
          </div>
        </div>
      </div>
      <div className="grid lg:grid-cols-2 grid-cols-1">
        <div className="p-10">
          <img
            className="w-full rounded-xl h-auto object-cover"
            src={voucher[0].Image}
            alt="Voucher"
            onError={(e) => {
              e.target.onerror = null;
              e.target.src =
                "https://www.thermaxglobal.com/wp-content/uploads/2020/05/image-not-found.jpg";
            }}
          />
        </div>
        <div className="w-full mt-9 text-[#3b9747]">
          <h1 className="text-3xl font-bold mb-2">{voucher[0].Name}</h1>
          <div className="w-full border-b border-[#3b9740] mb-10">
            <span className="text-xl text-[#3f8945]">{voucher[0]._id}</span>
            <span className="float-right font-bold text-xl text-[#3f8943]">
              Trạng thái:{" "}
              <span
                className={`font-normal ${
                  voucher[0].States === "Enable"
                    ? "text-green-500"
                    : "text-red-500"
                }`}
              >
                {voucher[0].States}
              </span>
            </span>
          </div>
          <div>
            <p className="text-xl my-2 flex justify-between pr-10">
              <span className="font-bold text-[#3f8943]">
                Số lượng sử dụng:{" "}
              </span>
              <span className=" text-[#000]">
                {voucher[0].AmountUsed || totalUse}
              </span>
            </p>
            <p className="text-xl my-2 flex justify-between pr-10">
              <span className="font-bold text-[#3f8943]">Mức giảm: </span>
              <span className=" text-[#000]">
                {voucher[0].PercentDiscount || "N/A"}%
              </span>
            </p>
            <p className="text-xl my-2 flex justify-between pr-10">
              <span className="font-bold text-[#3f8943]">Mô tả: </span>
              <span className=" text-[#000]">
                {voucher[0].Description || "N/A"}
              </span>
            </p>
            <div className="my-4 bg-[#c5ebc9] shadow-inner shadow-[#82df87] rounded-lg p-2 mb-5">
              {voucher[0].haveVouchers && voucher[0].haveVouchers.length > 0 ? (
                voucher[0].haveVouchers.map((haveVoucher) => (
                  <div key={haveVoucher._id}>
                    <p>
                      <span className="text-[#3f8943] text-xl font-semibold">
                        Service:
                      </span>{" "}
                      <span className="text-[#000] text-xl font-normal">
                        {serviceNames[haveVoucher.Service_ID] || "Loading..."}
                      </span>
                    </p>
                  </div>
                ))
              ) : (
                <p className="text-[#3f8943] font-semibold">Toàn bộ service</p>
              )}
            </div>
            <div className="my-4 bg-[#c8ebc5] h-[150px] overflow-auto  shadow-inner shadow-[#82df87] rounded-lg p-2 mb-5">
              <h1 className="text-xl text-center py-2  font-semibold text-[#3f8943]">
                DANH SÁCH KHÁCH HÀNG SỬ DỤNG
              </h1>
              {customer.map((cus, index) => (
                <div key={cus}>
                  <p>
                    <span className="text-[#3f8943] text-xl font-semibold">
                      {index + 1}.
                    </span>{" "}
                    <span className="text-[#080d30] text-xl font-normal">
                      {cus}
                    </span>
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
      <div className="my-4">
        <div className="relative h-[300px] overflow-auto shadow-md sm:rounded-lg">
          <div className="relative lg:w-full w-[700px] p-4 shadow-md rounded-lg text-lg text-[#2F4F4F]">
            <div className="w-full grid grid-cols-12 font-bold py-3 px-2 bg-[#4ca771] rounded-t-md text-[#fff]">
              <div className="col-span-1 text-center">STT</div>
              <div className="col-span-4 text-center">Total Discount</div>
              <div className="col-span-4 text-center">Customer</div>
              <div className="col-span-3 text-center">Date</div>
            </div>
            {history.map((item, index) => (
              <div
                key={(item._id, index)}
                className="w-full grid grid-cols-12  py-3 px-2 odd:bg-[#C9E9CC] odd:dark:bg-[#a5e0ab] even:bg-gray-50 even:dark:bg-[#DAEAD8]"
              >
                <div className="px-6 py-4 text-center col-span-1">
                  {index + 1}
                </div>

                <div className="col-span-4 py-4 text-center">
                  {formattedPrice(item.TotalDiscount)}
                </div>
                <div className="col-span-4 flex items-center justify-center">
                  {item.CusID}
                </div>
                <div className="col-span-3 flex items-center justify-center">
                  {date(item.Date)}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      <div>
        <Line data={chartData} options={options}></Line>
      </div>
    </div>
  );
};

export default DetailDashBoard;

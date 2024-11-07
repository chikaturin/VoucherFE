import { memo, useState, useEffect } from "react";
import { Pie, Line } from "react-chartjs-2";
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

const DashBoardPartner = () => {
  const [history, setHistory] = useState([]);
  const [error, setError] = useState(null);
  const [service, setService] = useState([]);
  const [year, setYear] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedMonth, setSelectedMonth] = useState(null);
  const [selectedYear, setSelectedYear] = useState(null);
  const [selectedService, setSelectedService] = useState(null);
  const [filteredData, setFilteredData] = useState([]);
  const [noDataFound, setNoDataFound] = useState(false);
  const [voucherStatistics, setVoucherStatistics] = useState({});
  const [noFilterData, setNoFilterData] = useState(false);

  const [showServiceDropdown, setShowServiceDropdown] = useState(false);
  const [showMonthDropdown, setShowMonthDropdown] = useState(false);
  const [showYearDropdown, setShowYearDropdown] = useState(false);
  const formattedPrice = (price) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(price);
  };

  const fetchHistory = async () => {
    try {
      const res = await fetch(
        "http://localhost:3000/api/Staitstical_PartnerService",
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("Token")}`,
          },
        }
      );
      if (!res.ok) {
        throw new Error("Failed to fetch data");
      }
      const data = await res.json();
      setHistory(data);

      const serviceIds = data.flatMap((item) =>
        item.haveVouchers.map((voucher) => voucher.Service_ID)
      );
      setService([...new Set(serviceIds)]);

      const uniqueYears = [
        ...new Set(data.map((item) => new Date(item.Date).getFullYear())),
      ];
      setYear(uniqueYears);
    } catch (error) {
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  const filterData = () => {
    if (history.length === 0) return;

    const filtered = history.filter((item) => {
      const voucherDate = new Date(item.Date);
      const matchesMonthYear =
        (!selectedMonth ||
          voucherDate.getMonth() + 1 === parseInt(selectedMonth)) &&
        (!selectedYear || voucherDate.getFullYear() === parseInt(selectedYear));

      const matchesService =
        !selectedService ||
        item.haveVouchers.some(
          (voucher) => voucher.Service_ID === selectedService
        );

      return matchesMonthYear && matchesService;
    });

    setFilteredData(filtered);
    updateVoucherStatistics(filtered);
    setNoDataFound(filtered.length === 0);
    setNoFilterData(
      filtered.length === 0 &&
        !selectedMonth &&
        !selectedYear &&
        !selectedService
    );
  };

  useEffect(() => {
    if (!selectedMonth || !selectedYear || !selectedService) {
      filterData();
    }
    filterData();
  }, [selectedMonth, selectedYear, selectedService, history]);

  const updateVoucherStatistics = (filteredData) => {
    const voucherStats = {};

    filteredData.forEach((item) => {
      const { Voucher_ID, TotalDiscount } = item;
      const validTotalDiscount = Number(TotalDiscount) || 0;

      if (!voucherStats[Voucher_ID]) {
        voucherStats[Voucher_ID] = {
          totalDiscount: validTotalDiscount,
          totalUsed: 1,
          partnerID: item.Partner_ID,
          serviceIDs: item.haveVouchers.map((v) => v.Service_ID).join(", "),
          date: new Date(item.Date).toLocaleDateString(),
        };
      } else {
        voucherStats[Voucher_ID].totalDiscount += validTotalDiscount;
        voucherStats[Voucher_ID].totalUsed += 1;
      }
    });

    setVoucherStatistics(voucherStats);
  };

  const pieData = {
    labels: Object.keys(voucherStatistics),
    datasets: [
      {
        label: "Total Used",
        data: Object.values(voucherStatistics).map(
          (voucher) => voucher.totalUsed
        ),
        backgroundColor: [
          "rgba(255, 99, 132, 0.6)",
          "rgba(54, 162, 235, 0.6)",
          "rgba(255, 206, 86, 0.6)",
          "rgba(75, 192, 192, 0.6)",
          "rgba(153, 102, 255, 0.6)",
          "rgba(255, 159, 64, 0.6)",
        ],
        borderColor: [
          "rgba(255, 99, 132, 1)",
          "rgba(54, 162, 235, 1)",
          "rgba(255, 206, 86, 1)",
          "rgba(75, 192, 192, 1)",
          "rgba(153, 102, 255, 1)",
          "rgba(255, 159, 64, 1)",
        ],
        borderWidth: 1,
      },
    ],
  };

  const lineData = {
    labels: Object.keys(voucherStatistics),
    datasets: [
      {
        label: "Total Discount",
        data: Object.values(voucherStatistics).map(
          (voucher) => voucher.totalDiscount
        ),
        fill: false,
        borderColor: "rgba(75, 192, 192, 1)",
        tension: 0.1,
      },
    ],
  };

  const months = Array.from({ length: 12 }, (_, index) => index + 1);

  if (isLoading) {
    return (
      <div className="bg-gradient-to-bl to-[#75bde0] from-[#eeeeee] h-full flex items-center justify-center">
        <span className="font-extrabold text-4xl text-center">Loading...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center text-4xl translate-y-1/2 h-full font-extrabold">
        Error: {error}
      </div>
    );
  }

  return (
    <div className="text-[#2F4F4F] w-full h-full bg-gradient-to-bl to-[#75bde0] from-30%  from-[#eeeeee]">
      <div className="w-full grid grid-cols-3 p-6 gap-6">
        <div className="col-span-1">
          <div
            onClick={() => setShowServiceDropdown(!showServiceDropdown)}
            tabIndex={0}
            role="button"
            className="font-semibold bg-[#3775A2] hover:bg-[#eaf9e7] text-[#eaf9e7] hover:text-[#3775A2] border-2 border-[#3775A2] outline-none px-4 py-2 rounded-lg"
          >
            Select Service
          </div>
          {showServiceDropdown && (
            <ul
              tabIndex={0}
              className="dropdown-content menu absolute bg-[#eaf9e7] rounded-box z-[1] w-[300px] p-2 shadow-inner shadow-[#3775A2] mt-2"
            >
              <li className="flex items-center w-full text-[#3775A2] text-lg">
                <a
                  onClick={() => {
                    setSelectedService(null), setShowServiceDropdown(false);
                  }}
                  className="w-[275px] hover:bg-[#4c83a7] hover:text-[#eaf9e7] bg-[#eaf9e7] active:font-bold border-2 border-transparent active:border-[#4ca771]"
                >
                  All services
                </a>
              </li>
              {service.map((service) => (
                <li
                  key={service}
                  className="flex items-center text-[#3775A2] text-lg"
                >
                  <a
                    onClick={() => {
                      setSelectedService(service),
                        setShowServiceDropdown(false);
                    }}
                    className="w-full line-clamp-1 hover:bg-[#4c83a7] hover:text-[#eaf9e7] bg-[#eaf9e7] active:font-bold border-2 border-transparent active:border-[#4ca771]"
                  >
                    {service}
                  </a>
                </li>
              ))}
            </ul>
          )}
        </div>
        <div className="col-span-1">
          <div
            onClick={() => setShowMonthDropdown(!showMonthDropdown)}
            className="font-semibold bg-[#3775A2] hover:bg-[#eaf9e7] text-[#eaf9e7] hover:text-[#3775A2] border-2 border-[#3775A2] outline-none px-4 py-2 rounded-lg"
          >
            Select Month
          </div>
          {showMonthDropdown && (
            <ul
              tabIndex={0}
              className="dropdown-content menu absolute bg-[#eaf9e7] rounded-box z-[1] w-52 p-2 shadow-inner shadow-[#3775A2] mt-2"
            >
              {months.map((month) => (
                <li
                  key={month}
                  className="flex items-center text-[#3775A2] text-lg"
                >
                  <a
                    onClick={() => {
                      setSelectedMonth(month.toString()),
                        setShowMonthDropdown(false);
                    }}
                    className="w-full hover:bg-[#4c83a7] hover:text-[#eaf9e7] bg-[#eaf9e7] active:font-bold border-2 border-transparent active:border-[#4ca771]"
                  >
                    {month}
                  </a>
                </li>
              ))}
            </ul>
          )}
        </div>
        <div className="col-span-1">
          <div
            onClick={() => setShowYearDropdown(!showYearDropdown)}
            className="font-semibold bg-[#3775A2] hover:bg-[#eaf9e7] text-[#eaf9e7] hover:text-[#3775A2] border-2 border-[#3775A2] outline-none px-4 py-2 rounded-lg"
          >
            Select Year
          </div>
          {showYearDropdown && (
            <ul
              tabIndex={0}
              className="dropdown-content menu absolute bg-[#eaf9e7] rounded-box z-[1] w-52 p-2 shadow-inner shadow-[#3775A2] mt-2"
            >
              {year.map((yr) => (
                <li
                  key={yr}
                  className="flex items-center text-[#3775A2] text-lg"
                >
                  <a
                    onClick={() => {
                      setSelectedYear(yr.toString()),
                        setShowYearDropdown(false);
                    }}
                    className="w-full hover:bg-[#4c83a7] hover:text-[#eaf9e7] bg-[#eaf9e7] active:font-bold border-2 border-transparent active:border-[#4ca771]"
                  >
                    {yr}
                  </a>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {noDataFound && !noFilterData && (
        <div className=" h-full flex items-center justify-center">
          <p className="font-extrabold text-4xl text-center">
            Không tìm thấy dữ liệu, vui lòng chọn lại
          </p>
        </div>
      )}

      <div className="grid grid-cols-12">
        <div className="col-span-4 w-full">
          {filteredData.length > 0 && !noDataFound && !noFilterData && (
            <div className="w-full h-full">
              <div className="w-full">
                <Pie data={pieData} />
              </div>
            </div>
          )}
        </div>
        <div className="col-span-8">
          <div className="p-6">
            <h1 className="text-4xl text-[#3775A2] mb-4 w-full text-center font-bold">
              chỗ này lỏ thông cảm từ fix
            </h1>
            {filteredData.length > 0 && (
              <table className="bg-yellow-300">
                <thead>
                  <tr className="text-left">
                    <th>Voucher ID</th>
                    <th>Service IDs</th>
                    <th>Total Used</th>
                    <th>Total Discount</th>
                    <th>Date</th>
                  </tr>
                </thead>
                <tbody>
                  {Object.keys(voucherStatistics).map((voucherId) => (
                    <tr key={voucherId}>
                      <td>{voucherId}</td>
                      <td>{voucherStatistics[voucherId].serviceIDs}</td>
                      <td>{voucherStatistics[voucherId].totalUsed}</td>
                      <td>{voucherStatistics[voucherId].totalDiscount}</td>
                      <td>{voucherStatistics[voucherId].date}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>

      {filteredData.length > 0 && !noDataFound && !noFilterData && (
        <div className="w-full p-8">
          {/* Line Chart - Voucher ID vs Total Discount */}
          <div className="w-full">
            <Line data={lineData} />
          </div>
        </div>
      )}
    </div>
  );
};

export default memo(DashBoardPartner);

import { useState, useEffect, useCallback } from "react";
import {
  FaFileDownload,
  FaBox,
  FaClipboardList,
  FaUsers,
  FaChartBar,
} from "react-icons/fa";
import { getAllOrders } from "../../service/api/orderService";
import { formatCurrency, formatCompactCurrency } from "../../lib/lib";
import { jsPDF } from "jspdf";
import { autoTable } from "jspdf-autotable";
import * as XLSX from "xlsx";
import { SummaryCard } from "../../components/SummaryCard";
import { DateRangeFilter } from "../../components/DateRangeFilter";
import { SalesTable } from "../../components/SalesTable";

function Reports() {
  const [dateRange, setDateRange] = useState({ startDate: "", endDate: "" });
  const [salesData, setSalesData] = useState([]);
  const [summaryCards, setSummaryCards] = useState([
    {
      title: "Total Revenue",
      value: "Rp0",
      icon: <FaChartBar />,
      color: "bg-purple-500",
    },
    {
      title: "Total Orders",
      value: "0",
      icon: <FaClipboardList />,
      color: "bg-green-500",
    },
    {
      title: "Products Sold",
      value: "0",
      icon: <FaBox />,
      color: "bg-blue-500",
    },
    {
      title: "New Customers",
      value: "0",
      icon: <FaUsers />,
      color: "bg-yellow-500",
    },
  ]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchReportData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const ordersResponse = await getAllOrders();
      const orders = Array.isArray(ordersResponse)
        ? ordersResponse
        : ordersResponse?.orders || [];

      let filteredOrders = orders;
      if (dateRange.startDate && dateRange.endDate) {
        const startDate = new Date(dateRange.startDate);
        const endDate = new Date(dateRange.endDate);
        endDate.setHours(23, 59, 59, 999);

        filteredOrders = orders.filter((order) => {
          if (!order || !order.createdAt) return false;
          const orderDate = new Date(order.createdAt);
          return orderDate >= startDate && orderDate <= endDate;
        });
      }

      const salesByDate = {};
      filteredOrders.forEach((order) => {
        if (!order || !order.createdAt) return;
        const orderDate = new Date(order.createdAt).toISOString().split("T")[0];
        if (!salesByDate[orderDate]) {
          salesByDate[orderDate] = {
            date: orderDate,
            revenue: 0,
            orders: 0,
            items: 0,
          };
        }
        const orderTotal = order.total || order.totalPrice || 0;
        salesByDate[orderDate].revenue += orderTotal;
        salesByDate[orderDate].orders += 1;
        if (order.items && Array.isArray(order.items)) {
          salesByDate[orderDate].items += order.items.reduce(
            (sum, item) => sum + (item.quantity || 0),
            0
          );
        }
      });

      const salesDataArray = Object.values(salesByDate).sort(
        (a, b) => new Date(a.date) - new Date(b.date)
      );
      setSalesData(salesDataArray);

      const currentRevenue = salesDataArray.reduce(
        (sum, day) => sum + day.revenue,
        0
      );
      const currentOrders = salesDataArray.reduce(
        (sum, day) => sum + day.orders,
        0
      );
      const currentItems = salesDataArray.reduce(
        (sum, day) => sum + day.items,
        0
      );
      const uniqueCustomers = new Set(
        filteredOrders
          .filter((order) => order && order.customerId)
          .map((order) => order.customerId)
      ).size;

      const formatCompactNumber = (number) => {
        return new Intl.NumberFormat("en-US", {
          notation: "compact",
          compactDisplay: "short",
        }).format(number);
      };

      setSummaryCards([
        {
          title: "Total Revenue",
          value: formatCompactCurrency(currentRevenue),
          icon: <FaChartBar />,
          color: "bg-purple-500",
        },
        {
          title: "Total Orders",
          value: formatCompactNumber(currentOrders),
          icon: <FaClipboardList />,
          color: "bg-green-500",
        },
        {
          title: "Products Sold",
          value: formatCompactNumber(currentItems),
          icon: <FaBox />,
          color: "bg-blue-500",
        },
        {
          title: "New Customers",
          value: formatCompactNumber(uniqueCustomers),
          icon: <FaUsers />,
          color: "bg-yellow-500",
        },
      ]);

      setLoading(false);
    } catch (error) {
      console.error("Error fetching report data:", error);
      setError("Failed to load report data. Please try again later.");
      setLoading(false);
    }
  }, [dateRange]);

  useEffect(() => {
    fetchReportData();
  }, [fetchReportData]);

  const handleDateChange = (e) => {
    setDateRange({ ...dateRange, [e.target.name]: e.target.value });
  };

  const handleApplyFilter = () => {
    fetchReportData();
  };

  const handleExport = (format) => {
    if (salesData.length === 0) {
      alert("No data available to export");
      return;
    }

    try {
      switch (format) {
        case "pdf":
          exportToPDF();
          break;
        case "excel":
          exportToExcel();
          break;
        case "csv":
          exportToCSV();
          break;
        default:
          console.error("Unsupported export format");
      }
    } catch (error) {
      console.error(`Error exporting to ${format}:`, error);
      alert(`Failed to export as ${format}. Please try again.`);
    }
  };

  const exportToPDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.text("Sales Report", 105, 15, { align: "center" });

    if (dateRange.startDate && dateRange.endDate) {
      doc.setFontSize(12);
      doc.text(
        `Period: ${dateRange.startDate} to ${dateRange.endDate}`,
        105,
        25,
        { align: "center" }
      );
    }

    doc.setFontSize(14);
    doc.text("Summary", 14, 40);

    doc.setFontSize(10);
    summaryCards.forEach((card, index) => {
      doc.text(`${card.title}: ${card.value}`, 14, 50 + index * 7);
    });

    doc.setFontSize(14);
    doc.text("Sales Data", 14, 85);

    const tableColumn = [
      "Date",
      "Revenue",
      "Orders",
      "Items Sold",
      "Avg. Order Value",
    ];
    const tableRows = salesData.map((day) => [
      day.date,
      formatCurrency(day.revenue),
      day.orders,
      day.items,
      formatCurrency(day.orders > 0 ? day.revenue / day.orders : 0),
    ]);

    autoTable(doc, {
      startY: 90,
      head: [tableColumn],
      body: tableRows,
      headStyles: { fillColor: [41, 128, 185], textColor: 255 },
      alternateRowStyles: { fillColor: [240, 240, 240] },
    });

    const fileName =
      dateRange.startDate && dateRange.endDate
        ? `sales_report_${dateRange.startDate}_to_${dateRange.endDate}.pdf`
        : "sales_report.pdf";

    doc.save(fileName);
  };

  const exportToExcel = () => {
    const wb = XLSX.utils.book_new();
    wb.Props = {
      Title: "Sales Report",
      Subject: "Sales Data",
      Author: "System",
      CreatedDate: new Date(),
    };

    const summaryData = [
      ["Sales Report Summary"],
      dateRange.startDate && dateRange.endDate
        ? [`Date Range: ${dateRange.startDate} to ${dateRange.endDate}`]
        : ["All Time Data"],
      [""],
      ["Metric", "Value"],
      ...summaryCards.map((card) => [card.title, card.value]),
    ];

    const summaryWs = XLSX.utils.aoa_to_sheet(summaryData);
    const summaryColWidth = [{ wch: 20 }, { wch: 15 }];
    summaryWs["!cols"] = summaryColWidth;
    XLSX.utils.book_append_sheet(wb, summaryWs, "Summary");

    const salesHeaders = [
      "Date",
      "Revenue",
      "Orders",
      "Items Sold",
      "Avg. Order Value",
    ];
    const salesRows = salesData.map((day) => [
      day.date,
      day.revenue,
      day.orders,
      day.items,
      day.orders > 0 ? day.revenue / day.orders : 0,
    ]);

    const salesWs = XLSX.utils.aoa_to_sheet([salesHeaders, ...salesRows]);
    const salesColWidth = [
      { wch: 12 }, // Date
      { wch: 15 }, // Revenue
      { wch: 10 }, // Orders
      { wch: 10 }, // Items Sold
      { wch: 15 }, // Avg Order Value
    ];
    salesWs["!cols"] = salesColWidth;
    XLSX.utils.book_append_sheet(wb, salesWs, "Sales Data");

    const fileName =
      dateRange.startDate && dateRange.endDate
        ? `sales_report_${dateRange.startDate}_to_${dateRange.endDate}.xlsx`
        : "sales_report.xlsx";

    XLSX.writeFile(wb, fileName);
  };

  const exportToCSV = () => {
    const salesHeaders = [
      '"Date"',
      '"Revenue"',
      '"Orders"',
      '"Items Sold"',
      '"Avg. Order Value"',
    ];
    const salesRows = salesData.map((day) => [
      `"${day.date}"`,
      `"${formatCurrency(day.revenue)}"`,
      `"${day.orders}"`,
      `"${day.items}"`,
      `"${formatCurrency(day.orders > 0 ? day.revenue / day.orders : 0)}"`,
    ]);

    const title = ['"Sales Report"'];
    const dateInfo =
      dateRange.startDate && dateRange.endDate
        ? [`"Period: ${dateRange.startDate} to ${dateRange.endDate}"`]
        : ['"All Time Data"'];
    const emptyRow = ['""', '""', '""', '""', '""'];

    const csvContent = [
      title.join(","),
      dateInfo.join(","),
      emptyRow.join(","),
      salesHeaders.join(","),
      ...salesRows.map((row) => row.join(",")),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob);
      link.setAttribute("href", url);

      const fileName =
        dateRange.startDate && dateRange.endDate
          ? `sales_report_${dateRange.startDate}_to_${dateRange.endDate}.csv`
          : "sales_report.csv";

      link.setAttribute("download", fileName);
      link.style.visibility = "hidden";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    }
  };

  if (loading && !salesData.length) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-800">Sales Reports</h1>
        <div className="dropdown dropdown-end">
          <label tabIndex={0} className="btn btn-primary">
            <FaFileDownload className="mr-2" />
            Export Report
          </label>
          <ul
            tabIndex={0}
            className="dropdown-content z-[1] menu p-2 shadow bg-base-100 rounded-box w-52"
          >
            <li>
              <button
                onClick={() => handleExport("pdf")}
                disabled={salesData.length === 0}
                className="flex items-center gap-2 py-2"
              >
                <FaFileDownload className="text-red-500" />
                Export as PDF
              </button>
            </li>
            <li>
              <button
                onClick={() => handleExport("excel")}
                disabled={salesData.length === 0}
                className="flex items-center gap-2 py-2"
              >
                <FaFileDownload className="text-green-500" />
                Export as Excel
              </button>
            </li>
            <li>
              <button
                onClick={() => handleExport("csv")}
                disabled={salesData.length === 0}
                className="flex items-center gap-2 py-2"
              >
                <FaFileDownload className="text-blue-500" />
                Export as CSV
              </button>
            </li>
          </ul>
        </div>
      </div>

      <DateRangeFilter
        dateRange={dateRange}
        onDateChange={handleDateChange}
        onApplyFilter={handleApplyFilter}
      />

      {error && (
        <div
          className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-8"
          role="alert"
        >
          <p className="font-bold">Error</p>
          <p>{error}</p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {summaryCards.map((card, index) => (
          <SummaryCard key={index} {...card} />
        ))}
      </div>

      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-800">Sales Report</h2>
        </div>
        <SalesTable salesData={salesData} />
      </div>
    </div>
  );
}

export default Reports;

import { useState, useEffect, useCallback } from "react";
import { FaFileDownload, FaBox, FaClipboardList, FaUsers, FaChartBar } from "react-icons/fa";
import { getAllOrders } from "../../service/api/orderService";
import { formatCurrency, formatCompactCurrency } from "../../lib/lib";
import { jsPDF } from "jspdf";
import { autoTable } from "jspdf-autotable";
import * as XLSX from "xlsx";
import { SummaryCard } from "../../components/SummaryCard";
import { DateRangeFilter } from "../../components/DateRangeFilter";
import { SalesTable } from "../../components/SalesTable";
import logoImage from "../../assets/logoscreamble.png";

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
         const orders = Array.isArray(ordersResponse) ? ordersResponse : ordersResponse?.orders || [];

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

         // Filter hanya order dengan status Dikonfirmasi, Dikirim, atau Sampai untuk revenue
         const validRevenueStatuses = ["Dikonfirmasi", "Dikirim", "Sampai"];
         const filteredRevenueOrders = filteredOrders.filter(
            (order) => order && validRevenueStatuses.includes(order.status)
         );

         const salesByDate = {};
         filteredRevenueOrders.forEach((order) => {
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
            let orderTotal = 0;
            if (typeof order.totalPrice !== "undefined") orderTotal = Number(order.totalPrice);
            else if (typeof order.total_price !== "undefined") orderTotal = Number(order.total_price);
            else if (typeof order.total !== "undefined") orderTotal = Number(order.total);
            salesByDate[orderDate].revenue += isNaN(orderTotal) ? 0 : orderTotal;
            salesByDate[orderDate].orders += 1;
            if (order.orderItems && Array.isArray(order.orderItems)) {
               salesByDate[orderDate].items += order.orderItems.reduce((sum, item) => sum + (item.quantity || 0), 0);
            }
         });

         const salesDataArray = Object.values(salesByDate).sort((a, b) => new Date(a.date) - new Date(b.date));
         setSalesData(salesDataArray);

         const currentRevenue = salesDataArray.reduce((sum, day) => sum + day.revenue, 0);
         const currentOrders = salesDataArray.reduce((sum, day) => sum + day.orders, 0);
         const currentItems = salesDataArray.reduce((sum, day) => sum + day.items, 0);
         const uniqueCustomers = new Set(
            filteredOrders.filter((order) => order && order.userId).map((order) => order.userId)
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

      // Set page dimensions
      const pageWidth = doc.internal.pageSize.width;
      const pageHeight = doc.internal.pageSize.height;

      // ===== HEADER SECTION =====
      // Header background with gradient effect
      doc.setFillColor(245, 247, 250);
      doc.rect(0, 0, pageWidth, 45, "F");

      // Top border line
      doc.setDrawColor(41, 128, 185);
      doc.setLineWidth(3);
      doc.line(0, 0, pageWidth, 0);

      // Logo section
      try {
         doc.addImage(logoImage, "PNG", 20, 12, 30, 25);
      } catch (error) {
         console.error("Error adding logo:", error);
         // Fallback: create a professional placeholder
         doc.setFillColor(41, 128, 185);
         doc.rect(20, 12, 30, 25, "F");
         doc.setTextColor(255, 255, 255);
         doc.setFontSize(10);
         doc.text("LOGO", 35, 26, { align: "center" });
      }

      // Company information (right side of header)
      doc.setTextColor(41, 128, 185);
      doc.setFontSize(20);
      doc.setFont(undefined, "bold");
      doc.text("TOKO SCREAMBLE", pageWidth - 20, 20, { align: "right" });

      doc.setTextColor(100, 100, 100);
      doc.setFontSize(11);
      doc.setFont(undefined, "normal");
      doc.text("Jl. Pandawa Blok D No.22", pageWidth - 20, 30, { align: "right" });
      doc.text("Kab. Bandung 40375", pageWidth - 20, 37, { align: "right" });

      // ===== REPORT TITLE SECTION =====
      doc.setFillColor(255, 255, 255);
      doc.rect(0, 45, pageWidth, 25, "F");

      doc.setTextColor(41, 128, 185);
      doc.setFontSize(24);
      doc.setFont(undefined, "bold");
      doc.text("SALES REPORT", pageWidth / 2, 60, { align: "center" });

      // Date period with better styling
      if (dateRange.startDate && dateRange.endDate) {
         doc.setTextColor(100, 100, 100);
         doc.setFontSize(12);
         doc.setFont(undefined, "normal");
         doc.text(`Period: ${dateRange.startDate} to ${dateRange.endDate}`, pageWidth / 2, 75, { align: "center" });
      }

      // ===== SUMMARY SECTION =====
      let currentY = 75;

      // Summary title with background
      doc.setFillColor(41, 128, 185);
      doc.rect(20, currentY, pageWidth - 40, 12, "F");
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(14);
      doc.setFont(undefined, "bold");
      doc.text("SUMMARY OVERVIEW", pageWidth / 2, currentY + 8, { align: "center" });

      currentY += 20;

      // Summary table with better styling
      const summaryHeaders = ["Metrik", "Nilai", "Deskripsi"];
      const summaryData = [
         ["Total Pendapatan", summaryCards[0]?.value || "Rp0", "Total pendapatan dari semua pesanan"],
         ["Total Pesanan", summaryCards[1]?.value || "0", "Jumlah pesanan yang selesai"],
         ["Produk Terjual", summaryCards[2]?.value || "0", "Total item yang terjual"],
         ["Pelanggan Baru", summaryCards[3]?.value || "0", "Jumlah pelanggan unik"],
      ];

      autoTable(doc, {
         startY: currentY,
         head: [summaryHeaders],
         body: summaryData,
         headStyles: {
            fillColor: [41, 128, 185],
            textColor: 255,
            fontSize: 11,
            fontStyle: "bold",
            halign: "center",
         },
         bodyStyles: {
            fontSize: 10,
            textColor: 80,
         },
         alternateRowStyles: {
            fillColor: [248, 249, 250],
         },
         margin: { left: 20, right: 20 },
         tableWidth: pageWidth - 40,
         columnStyles: {
            0: { cellWidth: 40, halign: "left" },
            1: { cellWidth: 35, halign: "center" },
            2: { cellWidth: "auto", halign: "left" },
         },
      });

      currentY = doc.lastAutoTable.finalY + 20;

      // ===== SALES DATA SECTION =====
      // Sales data title with background
      doc.setFillColor(41, 128, 185);
      doc.rect(20, currentY, pageWidth - 40, 12, "F");
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(14);
      doc.setFont(undefined, "bold");
      doc.text("DETAILED SALES DATA", pageWidth / 2, currentY + 8, { align: "center" });

      currentY += 20;

      // Sales data table with enhanced styling - using same width as summary table
      const tableColumn = ["Tanggal", "Pendapatan", "Pesanan", "Item Terjual", "Rata-rata Nilai Pesanan"];
      const tableRows = salesData.map((day) => [
         day.date,
         formatCurrency(day.revenue),
         day.orders.toString(),
         day.items.toString(),
         formatCurrency(day.orders > 0 ? day.revenue / day.orders : 0),
      ]);

      autoTable(doc, {
         startY: currentY,
         head: [tableColumn],
         body: tableRows,
         headStyles: {
            fillColor: [41, 128, 185],
            textColor: 255,
            fontSize: 11,
            fontStyle: "bold",
            halign: "center",
         },
         bodyStyles: {
            fontSize: 9,
            textColor: 80,
         },
         alternateRowStyles: {
            fillColor: [248, 249, 250],
         },
         margin: { left: 20, right: 20 },
         tableWidth: pageWidth - 40,
         columnStyles: {
            0: { cellWidth: 28, halign: "center" }, // Tanggal - center aligned
            1: { cellWidth: 32, halign: "right" }, // Pendapatan - right aligned for currency
            2: { cellWidth: 22, halign: "center" }, // Pesanan - center aligned for numbers
            3: { cellWidth: 22, halign: "center" }, // Item Terjual - center aligned for numbers
            4: { cellWidth: "auto", halign: "right" }, // Rata-rata Nilai Pesanan - right aligned for currency
         },
      });

      // ===== FOOTER SECTION =====
      const tableEndY = doc.lastAutoTable.finalY || currentY;
      const footerY = Math.max(tableEndY + 25, pageHeight - 60);

      // Footer background
      doc.setFillColor(245, 247, 250);
      doc.rect(0, footerY - 10, pageWidth, 60, "F");

      // Top border line for footer
      doc.setDrawColor(200, 200, 200);
      doc.setLineWidth(1);
      doc.line(20, footerY - 10, pageWidth - 20, footerY - 10);

      // Signature section on the right (tanpa border)
      doc.setTextColor(41, 128, 185);
      doc.setFontSize(10);
      doc.setFont(undefined, "bold");
      doc.text("OWNER SCREAMBLE", pageWidth - 50, footerY + 35, { align: "center" });

      // Report generation info
      doc.setTextColor(100, 100, 100);
      doc.setFontSize(8);
      doc.setFont(undefined, "normal");
      doc.text(`Dibuat pada: ${new Date().toLocaleDateString("id-ID")}`, 20, footerY + 45);
      doc.text(`Halaman 1 dari 1`, pageWidth - 20, footerY + 45, { align: "right" });

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

      const salesHeaders = ["Date", "Revenue", "Orders", "Items Sold", "Avg. Order Value"];
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
      const salesHeaders = ['"Date"', '"Revenue"', '"Orders"', '"Items Sold"', '"Avg. Order Value"'];
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
               <ul tabIndex={0} className="dropdown-content z-[1] menu p-2 shadow bg-base-100 rounded-box w-52">
                  <li>
                     <button
                        onClick={() => handleExport("pdf")}
                        disabled={salesData.length === 0}
                        className="flex items-center gap-2 py-2">
                        <FaFileDownload className="text-red-500" />
                        Export as PDF
                     </button>
                  </li>
                  <li>
                     <button
                        onClick={() => handleExport("excel")}
                        disabled={salesData.length === 0}
                        className="flex items-center gap-2 py-2">
                        <FaFileDownload className="text-green-500" />
                        Export as Excel
                     </button>
                  </li>
                  <li>
                     <button
                        onClick={() => handleExport("csv")}
                        disabled={salesData.length === 0}
                        className="flex items-center gap-2 py-2">
                        <FaFileDownload className="text-blue-500" />
                        Export as CSV
                     </button>
                  </li>
               </ul>
            </div>
         </div>

         <DateRangeFilter dateRange={dateRange} onDateChange={handleDateChange} onApplyFilter={handleApplyFilter} />

         {error && (
            <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-8" role="alert">
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
            <div className="px-6 py-1 border-b border-gray-200">
               <h2 className="text-xl font-semibold text-gray-800">Sales Report</h2>
            </div>
            <SalesTable salesData={salesData} />
         </div>
      </div>
   );
}

export default Reports;

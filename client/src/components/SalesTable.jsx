import { formatCurrency } from "../lib/lib";

export function SalesTable({ salesData }) {
  if (salesData.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        No sales data available for the selected period
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Date
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Revenue
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Orders
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Items Sold
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Avg. Order Value
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {salesData.map((day, index) => (
            <tr key={index}>
              <td className="px-6 py-4 whitespace-nowrap">{day.date}</td>
              <td className="px-6 py-4 whitespace-nowrap">
                {formatCurrency(day.revenue)}
              </td>
              <td className="px-6 py-4 whitespace-nowrap">{day.orders}</td>
              <td className="px-6 py-4 whitespace-nowrap">{day.items}</td>
              <td className="px-6 py-4 whitespace-nowrap">
                {formatCurrency(day.orders > 0 ? day.revenue / day.orders : 0)}
              </td>
            </tr>
          ))}
        </tbody>
        <tfoot className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Total
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              {formatCurrency(
                salesData.reduce((sum, day) => sum + day.revenue, 0)
              )}
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              {salesData.reduce((sum, day) => sum + day.orders, 0)}
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              {salesData.reduce((sum, day) => sum + day.items, 0)}
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              {formatCurrency(
                salesData.reduce((sum, day) => sum + day.revenue, 0) /
                  Math.max(
                    salesData.reduce((sum, day) => sum + day.orders, 0),
                    1
                  )
              )}
            </th>
          </tr>
        </tfoot>
      </table>
    </div>
  );
}

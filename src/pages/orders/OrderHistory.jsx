import React, { useState, useEffect } from "react";
import {
  Card,
  CardHeader,
  CardBody,
  Typography,
  Button,
  Chip,
  IconButton,
} from "@material-tailwind/react";
import { CreateOrderForm } from "@/components/orders/CreateOrder";
import { getOrders, updateBillTypePartWise } from "@/services/orderService";
import { EditOrderForm } from "@/components/orders/EditOrder";
import { ChevronDownIcon, ChevronUpIcon } from '@heroicons/react/24/solid';
import { toast } from "react-toastify";
import Datepicker from "react-tailwindcss-datepicker";
import * as XLSX from 'xlsx';
import excel from "../../assets/excel.png";

export function OrderTable() {
  const [showCreateOrderForm, setShowCreateOrderForm] = useState(false);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showEditOrderForm, setShowEditOrderForm] = useState(false);
  const [openOrder, setOpenOrder] = useState(null); // Manage open order dropdown
  const [transferQuantities, setTransferQuantities] = useState({});
  const [quantityErrors, setQuantityErrors] = useState({});
  const [statusFilter, setStatusFilter] = useState("All"); // State for status filter
  const [startDate, setStartDate] = useState(""); // State for start date
  const [endDate, setEndDate] = useState(""); // State for end date
  const [timePeriod, setTimePeriod] = useState("All");
  const [dateRange, setDateRange] = useState({
    startDate: null,
    endDate: null,
  });

  const handleCreateOrderClick = () => {
    setShowCreateOrderForm(true);
  };

useEffect(() => {
    const fetchOrders = async () => {
      try {
        const response = await getOrders();
        const ordersData = response.filter((item) => item.warehouse === localStorage.getItem("warehouse"));

        // Filter orders based on status
        let filteredOrders = statusFilter === "All"
          ? ordersData
          : ordersData.filter(order => order.status === statusFilter);

        // Filter orders based on time period
        const now = new Date();
        let filterDate;

        if (timePeriod === "last7Days") {
          filterDate = new Date();
          filterDate.setDate(now.getDate() - 7);
          filteredOrders = filteredOrders.filter(order => new Date(order.companyBargainDate) >= filterDate);
        } else if (timePeriod === "last30Days") {
          filterDate = new Date();
          filterDate.setDate(now.getDate() - 30);
          filteredOrders = filteredOrders.filter(order => new Date(order.companyBargainDate) >= filterDate);
        } else if (timePeriod === "custom" && dateRange.startDate && dateRange.endDate) {
          const start = new Date(dateRange.startDate);
          const end = new Date(dateRange.endDate);
          filteredOrders = filteredOrders.filter(order => {
            const orderDate = new Date(order.companyBargainDate);
            return orderDate >= start && orderDate <= end;
          });
        }

        // Sort orders by companyBargainDate in descending order
        filteredOrders.sort((a, b) => new Date(b.companyBargainDate) - new Date(a.companyBargainDate));

        console.log(filteredOrders)

        setOrders(filteredOrders);
      } catch (error) {
        setError('Failed to fetch orders');
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [statusFilter, timePeriod, dateRange]);  
  const formatDate = (date) => {
    const d = new Date(date);
    if (isNaN(d.getTime())) {
      throw new Error('Invalid date');
    }
    const day = d.getDate().toString().padStart(2, '0');
    const month = (d.getMonth() + 1).toString().padStart(2, '0');
    const year = d.getFullYear();
    return `${day}-${month}-${year}`;
  };

  const handleToggleOrder = (orderId) => {
    setOpenOrder(openOrder === orderId ? null : orderId);
  };

  const handleTransferQuantityChange = (itemName, value, availableQuantity) => {
    const quantity = parseInt(value, 10) || 0;
    const error = quantity > availableQuantity ? `Quantity exceeds available virtual quantity of ${availableQuantity}` : '';

    setTransferQuantities(prev => ({
      ...prev,
      [itemName]: value
    }));

    setQuantityErrors(prev => ({
      ...prev,
      [itemName]: error
    }));
  };

  const hasErrors = Object.values(quantityErrors).some(error => error !== '');

  const handleTransferSubmit = async (order) => {
    if (hasErrors) {
      toast.error('Please correct the errors before submitting.');
      return;
    }

    try {
      const latestOrder = await getOrders(order._id);

      const itemsToUpdate = order.items.map(item => {
        const currentItem = latestOrder?.items?.find(i => i.name === item.name);
        const currentBilledQuantity = currentItem?.billedQuantity || 0;

        return {
          name: item.name,
          quantity: (parseInt(transferQuantities[item.name], 10) || 0),
          billType: 'Virtual Billed',
        };
      });

      console.log(itemsToUpdate);
      await updateBillTypePartWise(order._id, { items: itemsToUpdate });
      toast.success("Items Billed!");

      const response = await getOrders();
      const ordersData = response.filter((item) => item.warehouse === localStorage.getItem("warehouse"));
      
      // Filter orders based on status
      const filteredOrders = statusFilter === "All"
        ? ordersData
        : ordersData.filter(order => order.status === statusFilter);
      
      filteredOrders.sort((a, b) => new Date(b.companyBargainDate) - new Date(a.companyBargainDate));

      setOrders(filteredOrders);

      setOpenOrder(null);
      setTransferQuantities({});
      setQuantityErrors({});
    } catch (error) {
      setError('Failed to update order');
    }
  };

  const handleDownloadExcel = () => {
    const formattedOrders = orders.map(order => ({
      'Company Bargain No': order.companyBargainNo,
      'Company Bargain Date': formatDate(order.companyBargainDate),
      'Seller Name': order.sellerName,
      'Seller Location': order.sellerLocation,
      'Seller Contact': order.sellerContact,
      'Status': order.status,
      'Transport Type': order.transportType,
      'Transport Location': order.transportLocation,
      'Bill Type': order.billType,
      'Description': order.description,
      'Created At': formatDate(order.createdAt),
      'Updated At': formatDate(order.updatedAt),
      'Payment Days': order.paymentDays,
      'Reminder Days': order.reminderDays.join(', '),
    }));

    const worksheet = XLSX.utils.json_to_sheet(formattedOrders);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Orders");
    XLSX.writeFile(workbook, 'orders.xlsx');
  };

return (
  <div className="mt-12 mb-8 flex flex-col gap-12">
    {!showCreateOrderForm ? (
      <Card>
        <CardHeader
          variant="gradient"
          color="gray"
          className="mb-8 p-6 flex justify-between items-center"
        >
          <Typography variant="h6" color="white">
            Order History
          </Typography>
          <Button variant="gradient" color="blue" onClick={handleCreateOrderClick}>
            Create Order
          </Button>
        </CardHeader>
        <CardBody className="overflow-x-scroll px-0 pt-0 pb-2">
          <div className="mb-4 flex flex-row gap-4 px-8 justify-between">
            <div className="flex gap-4">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="border rounded px-2 py-2"
              >
                <option value="All">All Statuses</option>
                <option value="created">Created</option>
                <option value="billed">Billed</option>
                <option value="payment pending">Payment Pending</option>
                <option value="completed">Completed</option>
              </select>
              <select
                value={timePeriod}
                onChange={(e) => {
                  setTimePeriod(e.target.value);
                  if (e.target.value !== "custom") {
                    setStartDate("");
                    setEndDate("");
                  }
                }}
                className="border rounded px-2 py-2"
              >
                <option value="All">All Time</option>
                <option value="last7Days">Last 7 Days</option>
                <option value="last30Days">Last 30 Days</option>
                <option value="custom">Custom</option>
              </select>
              {timePeriod === "custom" && (
                  <Datepicker
                    value={dateRange}
                    onChange={newValue => setDateRange(newValue)}
                    showShortcuts={true}
                    className="w-full max-w-sm"
                />
              )}
            </div>
            <Button onClick={handleDownloadExcel} className="w-fit px-8 flex flex-row items-center justify-center gap-1">
              <img className="w-5" src={excel} />
              Download as Excel
            </Button>
          </div>
          {loading ? (
            <Typography className="text-center text-blue-gray-600">Loading...</Typography>
          ) : error ? (
            <Typography className="text-center text-red-600">{error}</Typography>
          ) : (
            orders.length > 0 ? (
              <table className="w-full min-w-[640px] table-auto">
                <thead>
                  <tr>
                    {["Company Bargain Date", "Company Bargain No", "Seller Name", "Seller Location", "Seller Contact", "Status", "Transport Type", "Transport Location", "Actions"].map((el) => (
                      <th
                        key={el}
                        className="border-b border-blue-gray-50 py-3 px-5 text-left"
                      >
                        <Typography
                          variant="small"
                          className="text-[11px] font-bold text-center uppercase text-blue-gray-400"
                        >
                          {el}
                        </Typography>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {orders.map((order) => {
                    const className = `py-3 px-3 border-b border-blue-gray-50 text-center`;
                    const isOpen = openOrder === order._id;

                    return (
                      <React.Fragment key={order._id}>
                        <tr>
                          <td className={className}>
                            <Typography className="text-xs font-semibold text-center text-blue-gray-600">
                              {formatDate(order.companyBargainDate)}
                            </Typography>
                          </td>
                          <td className={className}>
                            <Typography className="text-xs font-semibold text-center text-blue-gray-600">
                              {order.companyBargainNo}
                            </Typography>
                          </td>
                          <td className={className}>
                            <Typography className="text-xs font-semibold text-center text-blue-gray-600">
                              {order.sellerName}
                            </Typography>
                          </td>
                          <td className={className}>
                            <Typography className="text-xs font-semibold text-center text-blue-gray-600">
                              {order.sellerLocation}
                            </Typography>
                          </td>
                          <td className={className}>
                            <Typography className="text-xs font-semibold text-center text-blue-gray-600">
                              {order.sellerContact}
                            </Typography>
                          </td>
                          <td className={className}>
                            <Chip
                              variant="ghost"
                              value={order.status}
                              color={order.status === "created" ? "blue" : order.status === "payment pending" ? "yellow" : order.status === "billed" ? "green" : "red"}
                            />
                          </td>
                          <td className={className}>
                            <Typography className="text-xs font-semibold text-center text-blue-gray-600">
                              {order.transportType}
                            </Typography>
                          </td>
                          <td className={className}>
                            <Typography className="text-xs font-semibold text-center text-blue-gray-600">
                              {order.transportLocation}
                            </Typography>
                          </td>
                          <td className={className}>
                            <div className="flex justify-center gap-4">
                              <IconButton
                                variant="text"
                                onClick={() => handleToggleOrder(order._id)}
                                className="bg-gray-300"
                              >
                                {isOpen ? <ChevronUpIcon className="h-5 w-5" /> : <ChevronDownIcon className="h-5 w-5" />}
                              </IconButton>
                              <Button
                                color="blue"
                                onClick={() => {
                                  setSelectedOrder(order);
                                  setShowEditOrderForm(true);
                                }}
                              >
                                Edit
                              </Button>
                            </div>
                          </td>
                        </tr>
                          {isOpen && (
                            <tr className="bg-gray-100">
                              <td colSpan="11">
                                <div className="p-4 border-t border-blue-gray-200">
                                  <Typography variant="h6" className="mb-4">
                                    Items
                                  </Typography>
                                  <table className="w-full table-auto">
                                    <thead>
                                      <tr>
                                        {["Item Name", "Packaging", "Weight", "Static Price (Rs.)", "Virtual Quantity", "Billed Quantity", "Transfer Quantity to Billed"].map((header) => (
                                          <th key={header} className="border-b border-blue-gray-50 py-3 px-5 text-left">
                                            <Typography variant="small" className="text-[11px] font-bold text-center uppercase text-blue-gray-400">
                                              {header}
                                            </Typography>
                                          </th>
                                        ))}
                                      </tr>
                                    </thead>
                                    <tbody>
                                      {order.items.map((item) => (
                                        <tr key={item.name}>
                                          <td className="border-b border-blue-gray-50 py-3 px-5 text-center text-blue-gray-600">{item.name}</td>
                                          <td className="border-b border-blue-gray-50 py-3 px-5 text-center text-blue-gray-600">{item.packaging}</td>
                                          <td className="border-b border-blue-gray-50 py-3 px-5 text-center text-blue-gray-600">{item.weight}</td>
                                          <td className="border-b border-blue-gray-50 py-3 px-5 text-center text-blue-gray-600">{item.staticPrice}</td>
                                          <td className="border-b border-blue-gray-50 py-3 px-5 text-center text-blue-gray-600">{item.quantity}</td>
                                          <td className="border-b border-blue-gray-50 py-3 px-5 text-center text-blue-gray-600">{item.billedQuantity ? item.billedQuantity : "0"}</td>
                                          <td className="border-b border-blue-gray-50 py-3 px-5 text-center">
                                              {item.quantity > 0 && (
                                                <>
                                                <input
                                                  type="number"
                                                  value={transferQuantities[item.name] || ''}
                                                  onChange={(e) => handleTransferQuantityChange(item.name, e.target.value, item.quantity)}
                                                  className="border rounded px-2 py-1 w-[300px]"
                                                />
                                                {quantityErrors[item.name] && (
                                                    <Typography variant="small" className="text-red-600 mt-1">
                                                      {quantityErrors[item.name]}
                                                    </Typography>
                                                )}
                                              </>
                                            )}
                                          </td>
                                        </tr>
                                      ))}
                                    </tbody>
                                  </table>
                                  <div className="mt-4 flex justify-end">
                                      <Button
                                      variant="gradient"
                                      color="green"
                                      onClick={() => handleTransferSubmit(order)}
                                      disabled={hasErrors}
                                    >
                                      Submit Transfer
                                    </Button>
                                  </div>
                                </div>
                              </td>
                            </tr>
                          )}
                      </React.Fragment>
                    );
                  })}
                </tbody>
              </table>
            ) : (
              <Typography className="text-center text-blue-gray-600">No orders found</Typography>
            ))}
          </CardBody>
        </Card>
      ) : (
        <CreateOrderForm setShowCreateOrderForm={setShowCreateOrderForm} close={() => setShowCreateOrderForm(false)} />
      )}
      {showEditOrderForm && selectedOrder && (
        <EditOrderForm
          close={() => setShowEditOrderForm(false)}
          order={selectedOrder}
        />
      )}
    </div>
  );
}

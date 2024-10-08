import React, { useState, useEffect } from "react";
import {
  Card,
  CardHeader,
  CardBody,
  Typography,
  Button,
  Chip,
  IconButton,
  Tooltip,
} from "@material-tailwind/react";
import { updateBillTypePartWise } from "@/services/orderService";
import { ChevronDownIcon, ChevronUpIcon } from "@heroicons/react/24/solid";
import { toast } from "react-toastify";
import Datepicker from "react-tailwindcss-datepicker";
import * as XLSX from "xlsx";
import excel from "../../assets/excel.png";
import { deleteBooking, getBookings } from "@/services/bookingService";
import { EditOrderForm } from "@/components/orders/EditOrder";
import CreateBookingForm from "@/components/bookings/CreateBooking";
import { MdDeleteOutline } from "react-icons/md";

export function Booking() {
  const [showBookingForm, setBookingForm] = useState(false);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [showEditBookingForm, setEditBookingForm] = useState(false);
  const [openBooking, setOpenBooking] = useState(null);
  const [transferQuantities, setTransferQuantities] = useState({});
  const [quantityErrors, setQuantityErrors] = useState({});
  const [statusFilter, setStatusFilter] = useState("All");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [timePeriod, setTimePeriod] = useState("All");
  const [dateRange, setDateRange] = useState({
    startDate: null,
    endDate: null,
  });

  const handleCreateBookingClick = () => {
    setBookingForm(true);
  };

  const fetchBookings = async () => {
    try {
      const response = await getBookings();
      const bookingsData = response;
      let filteredBookings =
        statusFilter === "All"
          ? bookingsData
          : bookingsData.filter((booking) => booking.status === statusFilter);

      const now = new Date();
      let filterDate;

      if (timePeriod === "last7Days") {
        filterDate = new Date();
        filterDate.setDate(now.getDate() - 7);
        filteredBookings = filteredBookings.filter(
          (booking) => new Date(booking.companyBargainDate) >= filterDate
        );
      } else if (timePeriod === "last30Days") {
        filterDate = new Date();
        filterDate.setDate(now.getDate() - 30);
        filteredBookings = filteredBookings.filter(
          (booking) => new Date(booking.companyBargainDate) >= filterDate
        );
      } else if (
        timePeriod === "custom" &&
        dateRange.startDate &&
        dateRange.endDate
      ) {
        const start = new Date(dateRange.startDate);
        const end = new Date(dateRange.endDate);
        filteredBookings = filteredBookings.filter((booking) => {
          const bookingDate = new Date(booking.companyBargainDate);
          return bookingDate >= start && bookingDate <= end;
        });
      }

      // Sort bookings by companyBargainDate in descending booking
      filteredBookings.sort(
        (a, b) =>
          new Date(b.companyBargainDate) - new Date(a.companyBargainDate)
      );

      console.log(filteredBookings);

      setBookings(filteredBookings);
    } catch (error) {
      setError("Failed to fetch bookings");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, [statusFilter, timePeriod, dateRange]);

  const formatDate = (date) => {
    const d = new Date(date);
    if (isNaN(d.getTime())) {
      throw new Error("Invalid date");
    }
    const day = d.getDate().toString().padStart(2, "0");
    const month = (d.getMonth() + 1).toString().padStart(2, "0");
    const year = d.getFullYear();
    return `${day}-${month}-${year}`;
  };

  const handleToggleBooking = (bookingId) => {
    setOpenBooking(openBooking === bookingId ? null : bookingId);
  };

  const handleTransferQuantityChange = (itemName, value, availableQuantity) => {
    const quantity = parseInt(value, 10) || 0;
    const error =
      quantity > availableQuantity
        ? `Quantity exceeds available virtual quantity of ${availableQuantity}`
        : "";

    setTransferQuantities((prev) => ({
      ...prev,
      [itemName]: value,
    }));

    setQuantityErrors((prev) => ({
      ...prev,
      [itemName]: error,
    }));
  };

  const hasErrors = Object.values(quantityErrors).some((error) => error !== "");

  const handleTransferSubmit = async (booking) => {
    if (hasErrors) {
      toast.error("Please correct the errors before submitting.");
      return;
    }

    try {
      const latestbooking = await getBookings(booking._id);

      const itemsToUpdate = booking.items.map((item) => {
        const currentItem = latestbooking?.items?.find(
          (i) => i.name === item.name
        );
        const currentBilledQuantity = currentItem?.billedQuantity || 0;

        return {
          name: item.name,
          quantity: parseInt(transferQuantities[item.name], 10) || 0,
          billType: "Virtual Billed",
        };
      });

      console.log(itemsToUpdate);
      await updateBillTypePartWise(booking._id, { items: itemsToUpdate });
      toast.success("Items Billed!");

      const response = await getbookings();
      const bookingsData = response.filter(
        (item) => item.warehouse === localStorage.getItem("warehouse")
      );

      // Filter bookings based on status
      const filteredBookings =
        statusFilter === "All"
          ? bookingsData
          : bookingsData.filter((booking) => booking.status === statusFilter);

      filteredBookings.sort(
        (a, b) =>
          new Date(b.companyBargainDate) - new Date(a.companyBargainDate)
      );

      setBookings(filteredBookings);

      setOpenBooking(null);
      setTransferQuantities({});
      setQuantityErrors({});
    } catch (error) {
      setError("Failed to update booking");
    }
  };

  console.log(bookings);

  const handleDownloadExcel = () => {
    const formattedbookings = bookings.map((booking) => ({
      "Company Bargain No": booking.BargainNo,
      // "Company Bargain Date": formatDate(booking.BargainDate),
      "Buyer Name": booking.buyer?.buyer,
      "Buyer Location": booking.buyer?.buyerLocation,
      "Buyer Contact": booking.buyer?.buyerContact,
      Status: booking.status,
      "Delivery Type": booking.deliveryOption,
      "Delivery Location":
        booking.deliveryAddress?.addressLine1 +
        ", " +
        booking.deliveryAddress?.addressLine2 +
        ", " +
        booking.deliveryAddress?.city +
        ", " +
        booking.deliveryAddress?.state +
        ", " +
        booking.deliveryAddress?.pinCode,
      "Bill Type": booking.billType,
      Description: booking.description,
      // "Created At": formatDate(booking.createdAt),
      // "Updated At": formatDate(booking.updatedAt),
      "Payment Days": booking.paymentDays,
      "Reminder Days": booking.reminderDays.join(", "),
    }));

    const worksheet = XLSX.utils.json_to_sheet(formattedbookings);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "bookings");
    XLSX.writeFile(workbook, "bookings.xlsx");
  };

  const handleDelete = async (id) => {
    try {
      await deleteBooking(id);
      fetchBookings();
      toast.error("Booking Deleted");
    } catch (err) {
      console.log("Error:", err);
    }
  };

  return (
    <div className="mt-12 mb-8 flex flex-col gap-12">
      <Card>
        <CardHeader
          variant="gradient"
          color="gray"
          className="mb-8 p-6 flex justify-between items-center"
        >
          <Typography variant="h6" color="white">
            Booking History
          </Typography>
        </CardHeader>
        <div className="sticky top-[0px] z-[100] mb-5 bg-white">
          <CreateBookingForm fetchBookings={fetchBookings} />
        </div>
        <CardBody className="overflow-x-scroll px-0 pt-0 pb-2">
          <div className="mb-4 flex flex-row gap-4 px-8 justify-between">
            <div className="flex gap-4">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="bbooking rounded px-2 py-2"
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
                className="bbooking rounded px-2 py-2"
              >
                <option value="All">All Time</option>
                <option value="last7Days">Last 7 Days</option>
                <option value="last30Days">Last 30 Days</option>
                <option value="custom">Custom</option>
              </select>
              {timePeriod === "custom" && (
                <Datepicker
                  value={dateRange}
                  onChange={(newValue) => setDateRange(newValue)}
                  showShortcuts={true}
                  className="w-full max-w-sm"
                />
              )}
            </div>
            <Button
              onClick={handleDownloadExcel}
              className="w-fit px-8 flex flex-row items-center justify-center gap-1"
            >
              <img className="w-5" src={excel} />
              Download as Excel
            </Button>
          </div>
          {loading ? (
            <Typography className="text-center text-blue-gray-600">
              Loading...
            </Typography>
          ) : error ? (
            <Typography className="text-center text-red-600">
              {error}
            </Typography>
          ) : bookings.length > 0 ? (
            <table className="w-full min-w-[640px] table-auto">
              <thead>
                <tr>
                  {[
                    "Bargain Date",
                    "Bargain No",
                    "Buyer Name",
                    "Buyer Location",
                    "Buyer Contact",
                    "Status",
                    "Delivery Type",
                    "Delivery Location",
                    "Actions",
                  ].map((el) => (
                    <th
                      key={el}
                      className="bbooking-b bbooking-blue-gray-50 py-3 px-5 text-left"
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
                {bookings?.map((booking) => {
                  const className = `py-3 px-3 bbooking-b bbooking-blue-gray-50 text-center`;
                  const isOpen = openBooking === booking._id;

                  return (
                    <React.Fragment key={booking._id}>
                      <tr>
                        <td className={className}>
                          <Typography className="text-xs font-semibold text-center text-blue-gray-600">
                            {booking.BargainDate &&
                              formatDate(booking?.BargainDate)}
                          </Typography>
                        </td>
                        <td className={className}>
                          <Typography className="text-xs font-semibold text-center text-blue-gray-600">
                            {booking?.BargainNo}
                          </Typography>
                        </td>
                        <td className={className}>
                          <Typography className="text-xs font-semibold text-center text-blue-gray-600">
                            {booking.buyer?.buyer}
                          </Typography>
                        </td>
                        <td className={className}>
                          <Typography className="text-xs font-semibold text-center text-blue-gray-600">
                            {booking.buyer?.buyerdeliveryAddress.addressLine1 &&
                              booking.buyer?.buyerdeliveryAddress.addressLine1 +
                                ", "}
                            {booking.buyer?.buyerdeliveryAddress.addressLine2 &&
                              booking.buyer?.buyerdeliveryAddress.addressLine2 +
                                ", "}
                            {booking.buyer?.buyerdeliveryAddress.city &&
                              booking.buyer?.buyerdeliveryAddress.city + ", "}
                            {booking.buyer?.buyerdeliveryAddress.state &&
                              booking.buyer?.buyerdeliveryAddress.state + ", "}
                            {booking.buyer?.buyerdeliveryAddress.pinCode}
                          </Typography>
                        </td>
                        <td className={className}>
                          <Typography className="text-xs font-semibold text-center text-blue-gray-600">
                            {booking.buyer?.buyerContact}
                          </Typography>
                        </td>
                        <td className={className}>
                          <Chip
                            variant="ghost"
                            value={booking.status}
                            color={
                              booking.status === "created"
                                ? "blue"
                                : booking.status === "partially sold"
                                ? "yellow"
                                : booking.status === "fully sold"
                                ? "green"
                                : "red"
                            }
                          />
                        </td>
                        <td className={className}>
                          <Typography className="text-xs font-semibold text-center text-blue-gray-600">
                            {booking.deliveryOption}
                          </Typography>
                        </td>
                        <td className={className}>
                          <Typography className="text-xs font-semibold text-center text-blue-gray-600">
                            {booking.deliveryOption === "Pickup" && (
                              <span>Pickup</span>
                            )}
                            {booking.deliveryAddress?.addressLine1 &&
                              booking.deliveryAddress?.addressLine1 + ", "}
                            {booking.deliveryAddress?.addressLine2 &&
                              booking.deliveryAddress?.addressLine2 + ", "}
                            {booking.deliveryAddress?.city &&
                              booking.deliveryAddress?.city + ", "}
                            {booking.deliveryAddress?.state &&
                              booking.deliveryAddress?.state + ", "}
                            {booking.deliveryAddress?.pinCode}
                          </Typography>
                        </td>
                        <td className={className}>
                          <div className="flex justify-center gap-4">
                            <IconButton
                              variant="text"
                              onClick={() => handleToggleBooking(booking._id)}
                              className="bg-gray-300"
                            >
                              {isOpen ? (
                                <ChevronUpIcon className="h-5 w-5" />
                              ) : (
                                <ChevronDownIcon className="h-5 w-5" />
                              )}
                            </IconButton>
                            {booking.status === "created" && (
                              <Tooltip content="Delete Booking">
                                <span className="w-fit h-fit">
                                  <MdDeleteOutline
                                    onClick={() => handleDelete(booking._id)}
                                    className="text-[2rem] text-red-700 border border-2 border-red-700 rounded-md hover:bg-red-700 hover:text-white transition-all cursor-pointer"
                                  />
                                </span>
                              </Tooltip>
                            )}
                          </div>
                        </td>
                      </tr>
                      {isOpen && (
                        <tr className="bg-gray-100">
                          <td colSpan="11">
                            <div className="p-4 bbooking-t bbooking-blue-gray-200">
                              <Typography variant="h6" className="mb-4">
                                Items
                              </Typography>
                              <table className="w-full table-auto">
                                <thead>
                                  <tr>
                                    {[
                                      "Item Name",
                                      "Packaging",
                                      "Weight",
                                      "Static Price (Rs.)",
                                      "Virtual Quantity",
                                      "Billed Quantity",
                                    ].map((header) => (
                                      <th
                                        key={header}
                                        className="bbooking-b bbooking-blue-gray-50 py-3 px-5 text-left"
                                      >
                                        <Typography
                                          variant="small"
                                          className="text-[11px] font-bold text-center uppercase text-blue-gray-400"
                                        >
                                          {header}
                                        </Typography>
                                      </th>
                                    ))}
                                  </tr>
                                </thead>
                                <tbody>
                                  {booking.items.map((item) => (
                                    <tr key={item.name}>
                                      <td className="bbooking-b bbooking-blue-gray-50 py-3 px-5 text-center text-blue-gray-600">
                                        {item.item.name}
                                      </td>
                                      <td className="bbooking-b bbooking-blue-gray-50 py-3 px-5 text-center text-blue-gray-600">
                                        {item.item.packaging}
                                      </td>
                                      <td className="bbooking-b bbooking-blue-gray-50 py-3 px-5 text-center text-blue-gray-600">
                                        {item.item.weight}
                                      </td>
                                      <td className="bbooking-b bbooking-blue-gray-50 py-3 px-5 text-center text-blue-gray-600">
                                        {item.item.staticPrice}
                                      </td>
                                      <td className="bbooking-b bbooking-blue-gray-50 py-3 px-5 text-center text-blue-gray-600">
                                        {item.virtualQuantity
                                          ? item.virtualQuantity
                                          : "0"}{" "}
                                      </td>
                                      <td className="bbooking-b bbooking-blue-gray-50 py-3 px-5 text-center text-blue-gray-600">
                                        {item.billedQuantity
                                          ? item.billedQuantity
                                          : "0"}
                                      </td>
                                      {/* <td className="bbooking-b bbooking-blue-gray-50 py-3 px-5 text-center">
                                              {item.quantity > 0 && (
                                                <>
                                                <input
                                                  type="number"
                                                  value={transferQuantities[item.name] || ''}
                                                  onChange={(e) => handleTransferQuantityChange(item.name, e.target.value, item.quantity)}
                                                  className="bbooking rounded px-2 py-1 w-[300px]"
                                                />
                                                {quantityErrors[item.name] && (
                                                    <Typography variant="small" className="text-red-600 mt-1">
                                                      {quantityErrors[item.name]}
                                                    </Typography>
                                                )}
                                              </>
                                            )}
                                          </td> */}
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                              {/* <div className="mt-4 flex justify-end">
                                      <Button
                                      variant="gradient"
                                      color="green"
                                      onClick={() => handleTransferSubmit(booking)}
                                      disabled={hasErrors}
                                    >
                                      Submit Transfer
                                    </Button>
                                  </div> */}
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
            <Typography className="text-center text-blue-gray-600">
              No bookings found
            </Typography>
          )}
        </CardBody>
      </Card>
      {showEditBookingForm && selectedBooking && (
        <EditOrderForm
          close={() => setShowEditbookingForm(false)}
          booking={selectedBooking}
        />
      )}
    </div>
  );
}

import React, { useState, useEffect } from "react";
import {
  Card,
  CardHeader,
  CardBody,
  Typography,
  Button,
  Chip,
  IconButton,
  Input,
} from "@material-tailwind/react";
import { updateBillTypePartWise } from "@/services/orderService";
import { ChevronDownIcon, ChevronUpIcon } from "@heroicons/react/24/solid";
import { toast } from "react-toastify";
import Datepicker from "react-tailwindcss-datepicker";
import * as XLSX from "xlsx";
import excel from "../../assets/excel.png";
import { getBookings } from "@/services/bookingService";
import { EditOrderForm } from "@/components/orders/EditOrder";
import CreateBookingForm from "@/components/bookings/CreateBooking";
import SalesModal from "@/components/sales/SalesModal";

export function Sales() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [openBooking, setOpenBooking] = useState(null);
  const [statusFilter, setStatusFilter] = useState("All");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [timePeriod, setTimePeriod] = useState("All");
  const [dateRange, setDateRange] = useState({
    startDate: null,
    endDate: null,
  });
  const [salesModal, setSalesModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

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

      if (searchQuery) {
        filteredBookings = filteredBookings.filter((booking) =>
          booking.BargainNo
            .toLowerCase()
            .includes(searchQuery.toLowerCase())
        );
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
  }, [statusFilter, timePeriod, dateRange, searchQuery]);

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

  return (
    <>
      <div className="mt-12 mb-8 flex flex-col gap-12">
        <Card>
          <CardHeader
            variant="gradient"
            color="gray"
            className="mb-8 p-6 flex justify-between items-center"
          >
            <Typography variant="h6" color="white">
              Manage Sales
            </Typography>
          </CardHeader>
          <CardBody className="overflow-x-scroll px-0 pt-0 pb-2">
            <Typography variant="h5" className="sm:ml-8 mb-4 mt-5">
              Bookings
            </Typography>
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
                <Input
                  type="text"
                  value={searchQuery}
                  label="Search by Bargain No"
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="border rounded px-2 py-2"
                />
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
                              {booking.buyer?.buyerdeliveryAddress
                                .addressLine1 &&
                                booking.buyer?.buyerdeliveryAddress
                                  .addressLine1 + ", "}
                              {booking.buyer?.buyerdeliveryAddress
                                .addressLine2 &&
                                booking.buyer?.buyerdeliveryAddress
                                  .addressLine2 + ", "}
                              {booking.buyer?.buyerdeliveryAddress.city &&
                                booking.buyer?.buyerdeliveryAddress.city + ", "}
                              {booking.buyer?.buyerdeliveryAddress.state &&
                                booking.buyer?.buyerdeliveryAddress.state +
                                  ", "}
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
                              {booking.status !== "fully sold" && (
                                <Button
                                  to="/dashboard/sales/history"
                                  color="blue"
                                  onClick={() => {
                                    setSelectedBooking(booking);
                                    setSalesModal(true);
                                  }}
                                >
                                  Create
                                </Button>
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
      </div>
      {salesModal && (
        <SalesModal
          fetchBooking={fetchBookings}
          setModal={setSalesModal}
          booking={selectedBooking}
        />
      )}
    </>
  );
}

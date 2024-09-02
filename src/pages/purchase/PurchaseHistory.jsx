import { getPurchases } from "@/services/purchaseService";
import React from "react";
import {
  Button,
  Card,
  CardBody,
  CardHeader,
  IconButton,
  Typography,
} from "@material-tailwind/react";
import { useEffect, useState } from "react";
import { ChevronDownIcon, ChevronUpIcon } from "@heroicons/react/24/solid";
import { Link } from "react-router-dom";

const PurchaseHistory = () => {
  const [purchases, setPurchases] = useState([]);
  const [purchaseLoading, setPurchaseLoading] = useState(true);
  const [purchaseError, setPurchaseError] = useState(null);
  const [openOrder, setOpenOrder] = useState(null);
  const [statusFilter, setStatusFilter] = useState("All");
  const [timePeriod, setTimePeriod] = useState("All");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const [dateRange, setDateRange] = useState({
    startDate: null,
    endDate: null,
  });

  useEffect(() => {
    const fetchPurchases = async () => {
      try {
        const response = await getPurchases();
        const purchaseData = response.data;

        // // Filter purchases based on status
        // let filteredPurchases =
        //   statusFilter === "All"
        //     ? purchaseData
        //     : purchaseData.filter(
        //         (purchase) => purchase.status === statusFilter
        //       );

        // // Filter purchases based on time period
        // const now = new Date();
        // let filterDate;

        // if (timePeriod === "last7Days") {
        //   filterDate = new Date();
        //   filterDate.setDate(now.getDate() - 7);
        //   filteredPurchases = filteredPurchases.filter(
        //     (purchase) => new Date(purchase.companyBargainDate) >= filterDate
        //   );
        // } else if (timePeriod === "last30Days") {
        //   filterDate = new Date();
        //   filterDate.setDate(now.getDate() - 30);
        //   filteredPurchases = filteredPurchases.filter(
        //     (purchase) => new Date(purchase.companyBargainDate) >= filterDate
        //   );
        // } else if (
        //   timePeriod === "custom" &&
        //   dateRange.startDate &&
        //   dateRange.endDate
        // ) {
        //   const start = new Date(dateRange.startDate);
        //   const end = new Date(dateRange.endDate);
        //   filteredPurchases = filteredPurchases.filter((purchase) => {
        //     const purchaseDate = new Date(purchase.companyBargainDate);
        //     return purchaseDate >= start && purchaseDate <= end;
        //   });
        // }

        // // Sort purchases by companyBargainDate in descending purchase
        // filteredPurchases.sort(
        //   (a, b) =>
        //     new Date(b.companyBargainDate) - new Date(a.companyBargainDate)
        // );

        // console.log(filteredPurchases);

        setPurchases(purchaseData);
      } catch (error) {
        setError("Failed to fetch purchases");
      } finally {
        setLoading(false);
      }
    };

    fetchPurchases();
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

  const handleToggleOrder = (orderId) => {
    setOpenOrder(openOrder === orderId ? null : orderId);
  };

  const handleDownloadExcel = () => {
    const formattedpurchases = purchases.map((purchase) => ({
      "Company Bargain No": purchase.companyBargainNo,
      "Company Bargain Date": formatDate(purchase.companyBargainDate),
      "Seller Name": purchase.sellerName,
      "Seller Location": purchase.sellerLocation,
      "Seller Contact": purchase.sellerContact,
      Status: purchase.status,
      "Transport Type": purchase.transportType,
      "Transport Location": purchase.transportLocation,
      "Bill Type": purchase.billType,
      Description: purchase.description,
      "Created At": formatDate(purchase.createdAt),
      "Updated At": formatDate(purchase.updatedAt),
      "Payment Days": purchase.paymentDays,
      "Reminder Days": purchase.reminderDays.join(", "),
    }));

    const formattedPurchases = purchases.map((purchase) => ({
      "Invoice Number": purchase.invoiceNumber,
      "Invoice Date": formatDate(purchase.invoiceDate),
      "Warehouse ID": purchase.warehouseId,
      "Transporter ID": purchase.transporterId,
      "purchase ID": purchase.purchaseId,
      Items: purchase.items
        .map((item) => `${item.name} - ${item.quantity}`)
        .join(", "),
    }));

    const worksheetpurchases = XLSX.utils.json_to_sheet(formattedpurchases);
    const worksheetPurchases = XLSX.utils.json_to_sheet(formattedPurchases);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheetpurchases, "purchases");
    XLSX.utils.book_append_sheet(
      workbook,
      worksheetPurchases,
      "Purchase History"
    );
    XLSX.writeFile(workbook, "purchases_and_purchases.xlsx");
  };

  return (
    <Card className="mt-12">
      <CardHeader
        variant="gradient"
        color="gray"
        className="p-6 flex justify-between items-center"
      >
        <Typography variant="h6" color="white">
          Manage Purchase History
        </Typography>
        <Link to="/dashboard/purchase/create">
          <Button color="blue">Create New Purchase</Button>
        </Link>
      </CardHeader>
      <CardBody className="overflow-x-scroll px-0 pt-0 pb-2">
        <Typography variant="h5" className="sm:ml-8 mb-4 mt-5">
          Purchase History
        </Typography>
        {loading ? (
          <Typography className="text-center text-blue-gray-600">
            Loading...
          </Typography>
        ) : error ? (
          <Typography className="text-center text-red-600">{error}</Typography>
        ) : purchases.length > 0 ? (
          <table className="w-full min-w-[640px] table-auto">
            <thead>
              <tr>
                {[
                  "Invoice Number",
                  "Invoice Date",
                  "Transporter",
                  "Warehouse",
                  "Order",
                  "Actions",
                ].map((el) => (
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
              {purchases.map((purchase) => {
                const className = `py-3 px-3 border-b border-blue-gray-50 text-center`;
                const isOpen = openOrder === purchase._id;

                return (
                  <React.Fragment key={purchase._id}>
                    <tr>
                      <td className={className}>
                        <Typography className="text-xs font-semibold text-center text-blue-gray-600">
                          {purchase.invoiceNumber}
                        </Typography>
                      </td>
                      <td className={className}>
                        <Typography className="text-xs font-semibold text-center text-blue-gray-600">
                          {formatDate(purchase.invoiceDate)}
                        </Typography>
                      </td>
                      <td className={className}>
                        <Typography className="text-xs font-semibold text-center text-blue-gray-600">
                          {purchase.transporterId}
                        </Typography>
                      </td>
                      <td className={className}>
                        <Typography className="text-xs font-semibold text-center text-blue-gray-600">
                          {purchase.warehouse}
                        </Typography>
                      </td>
                      <td className={className}>
                        <Typography className="text-xs font-semibold text-center text-blue-gray-600">
                          {purchase.orderId}
                        </Typography>
                      </td>
                      <td className={className}>
                        <div className="flex justify-center gap-4">
                          <IconButton
                            variant="text"
                            onClick={() => handleToggleOrder(purchase._id)}
                            className="bg-gray-300"
                          >
                            {isOpen ? (
                              <ChevronUpIcon className="h-5 w-5" />
                            ) : (
                              <ChevronDownIcon className="h-5 w-5" />
                            )}
                          </IconButton>
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
                                  {["Item Name", "Quantity"].map((header) => (
                                    <th
                                      key={header}
                                      className="border-b border-blue-gray-50 py-3 px-5 text-left"
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
                                {purchase.items.map((item) => (
                                  <tr key={item.name}>
                                    <td className="border-b border-blue-gray-50 py-3 px-5 text-center text-blue-gray-600">
                                      {item.name}
                                    </td>
                                    <td className="border-b border-blue-gray-50 py-3 px-5 text-center text-blue-gray-600">
                                      {item.quantity}
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
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
            No purchase found
          </Typography>
        )}
      </CardBody>
    </Card>
  );
};

export default PurchaseHistory;

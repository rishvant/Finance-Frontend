import { getPurchases } from "@/services/purchaseService";
import React from "react";
import {
  Button,
  Card,
  CardBody,
  CardHeader,
  IconButton,
  Input,
  Tooltip,
  Typography,
} from "@material-tailwind/react";
import { useEffect, useState } from "react";
import { ChevronDownIcon, ChevronUpIcon } from "@heroicons/react/24/solid";
import { Link } from "react-router-dom";
import { generateInvoicePDF } from "@/utils/generateInvoicePdf";
import { FaDownload } from "react-icons/fa";

const PurchaseHistory = () => {
  const [purchases, setPurchases] = useState([]);
  const [openOrder, setOpenOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const fetchPurchases = async () => {
      try {
        const response = await getPurchases();
        const purchaseData = response.data;
        setPurchases(purchaseData);
      } catch (error) {
        setError("Failed to fetch purchases");
      } finally {
        setLoading(false);
      }
    };

    fetchPurchases();
  }, []);

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

  // Filter purchases by search query
  const filteredPurchases = purchases.filter((purchase) =>
    purchase.invoiceNumber.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleDownloadInvoice = async (purchase) => {
    await generateInvoicePDF(purchase);
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

        {/* Search Input */}
        <div className="flex flex-row justify-center px-8 mb-4 w-fit">
          <Input
            type="text"
            label="Search by Invoice Number"
            className="border border-gray-300 p-2 rounded"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {loading ? (
          <Typography className="text-center text-blue-gray-600">
            Loading...
          </Typography>
        ) : error ? (
          <Typography className="text-center text-red-600">{error}</Typography>
        ) : filteredPurchases.length > 0 ? (
          <table className="w-full min-w-[640px] table-auto">
            <thead>
              <tr>
                {[
                  "Invoice Number",
                  "Invoice Date",
                  "Transport",
                  "Transport Agency",
                  "Transport Contact",
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
              {filteredPurchases.map((purchase) => {
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
                          {purchase.transporterId.transport}
                        </Typography>
                      </td>
                      <td className={className}>
                        <Typography className="text-xs font-semibold text-center text-blue-gray-600">
                          {purchase.transporterId.transportAgency}
                        </Typography>
                      </td>
                      <td className={className}>
                        <Typography className="text-xs font-semibold text-center text-blue-gray-600">
                          {purchase.transporterId.transportContact}
                        </Typography>
                      </td>
                      <td className={className}>
                        <Typography className="text-xs font-semibold text-center text-blue-gray-600">
                          {purchase.warehouseId.name}
                        </Typography>
                      </td>
                      <td className={className}>
                        <Typography className="text-xs font-semibold text-center text-blue-gray-600">
                          {purchase.orderId?.companyBargainNo}
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
                          <Tooltip content="Download Invoice">
                            <span className="w-fit h-fit">
                              <FaDownload
                                className="text-[1.2rem] mt-2 cursor-pointer"
                                onClick={() => handleDownloadInvoice(purchase)}
                              />
                            </span>
                          </Tooltip>
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
                                  {[
                                    "Item Name",
                                    "Packaging",
                                    "Static Price",
                                    "Type",
                                    "Weight",
                                    "Quantity",
                                  ].map((header) => (
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
                                  <tr key={item._id}>
                                    <td className="border-b border-blue-gray-50 py-3 px-5 text-center text-blue-gray-600">
                                      {item.itemId.name}
                                    </td>
                                    <td className="border-b border-blue-gray-50 py-3 px-5 text-center text-blue-gray-600">
                                      {item.itemId.packaging}
                                    </td>
                                    <td className="border-b border-blue-gray-50 py-3 px-5 text-center text-blue-gray-600">
                                      {item.itemId.staticPrice}
                                    </td>
                                    <td className="border-b border-blue-gray-50 py-3 px-5 text-center text-blue-gray-600">
                                      {item.itemId.type}
                                    </td>
                                    <td className="border-b border-blue-gray-50 py-3 px-5 text-center text-blue-gray-600">
                                      {item.itemId.weight}
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

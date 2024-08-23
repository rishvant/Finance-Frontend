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
import { ChevronDownIcon, ChevronUpIcon } from '@heroicons/react/24/solid'; // Add icons for dropdown
import { toast } from "react-toastify";

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

  const handleCreateOrderClick = () => {
    setShowCreateOrderForm(true);
  };

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const response = await getOrders();
        const ordersData = response.filter((item) => item.warehouse === localStorage.getItem("warehouse"));
        setOrders(ordersData);
      } catch (error) {
        setError('Failed to fetch orders');
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

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
    setOrders(ordersData);

    setOpenOrder(null);
    setTransferQuantities({});
    setQuantityErrors({});
  } catch (error) {
    setError('Failed to update order');
  }
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
                      const className = `py-3 px-3 border-b border-blue-gray-50`;
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
                                variant="gradient"
                                color={order.status === 'completed' ? 'green' : 'blue-gray'}
                                value={order.status}
                                className="py-0.5 px-2 text-[11px] font-medium w-fit"
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
                              <div className="flex items-center justify-end gap-2">
                                  <IconButton onClick={() => handleToggleOrder(order._id)}>
                                    {isOpen ? <ChevronUpIcon className="h-5 w-5 text-blue-gray-600" /> : <ChevronDownIcon className="h-5 w-5 text-blue-gray-600" />}
                                  </IconButton>
                                <Typography
                                  as="a"
                                  href="#"
                                  className="text-xs font-semibold text-blue-gray-600"
                                  onClick={() => {
                                    setSelectedOrder(order);
                                    setShowEditOrderForm(true);
                                  }}
                                >
                                  Edit
                                </Typography>
                              </div>
                            </td>
                          </tr>
                          {isOpen && (
                            <tr>
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
                                      disabled={hasErrors} // Disable the button if there are errors
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
              )
            )}
          </CardBody>
        </Card>
      ) : (
        <CreateOrderForm setShowCreateOrderForm={setShowCreateOrderForm} />
      )}
      {showEditOrderForm && selectedOrder && (
        <EditOrderForm
          order={selectedOrder}
          onClose={() => {
            setShowEditOrderForm(false);
            setSelectedOrder(null);
          }}
        />
      )}
    </div>
  );
}

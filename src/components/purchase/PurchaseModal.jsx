import {
  Button,
  Input,
  Spinner,
  IconButton,
  Select,
  Option,
} from "@material-tailwind/react";
import { useState, useEffect } from "react";
import { toast } from "react-toastify";
import { FaPlus, FaTrashAlt } from "react-icons/fa";
import { createOrder, getOrders } from "@/services/orderService";
import {
  getItems,
  getManufacturer,
  getTransport,
} from "@/services/masterService";
import { fetchWarehouse, getWarehouses } from "@/services/warehouseService";
import { createPurchase } from "@/services/purchaseService";

const PurchaseModal = ({ setModal, order, fetchOrder }) => {
  const [loading, setLoading] = useState(false);
  const [itemsOptions, setItemsOptions] = useState([]);
  const [transportOptions, setTransportOptions] = useState([]);
  const [manufacturerOptions, setManufacturerOptions] = useState([]);
  const [warehouseOptions, setWarehouseOptions] = useState([]);

  const getCurrentDate = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, "0");
    const day = String(today.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
  };

  const [form, setForm] = useState({
    items: order.items.map((item) => ({
      itemId: item.item?._id,
      quantity: item.quantity,
    })),
    transporterId: "",
    orderId: order._id,
    invoiceNumber: "",
    invoiceDate: "",
    warehouseId: "",
  });

  useEffect(() => {
    // fetchItemsOptions();
    fetchTransportOptions();
    // fetchManufacturerOptions();
    fetchWarehouseOptions();
  }, []);

  //   const fetchOrders = async () => {
  //     try {
  //       const response = await getOrders();
  //       setOrders(response);
  //     } catch (error) {
  //       toast.error("Error fetching orders!");
  //       console.error(error);
  //     }
  //   };

  //   const fetchItemsOptions = async () => {
  //     try {
  //       const response = await getItems();
  //       setItemsOptions(response);
  //     } catch (error) {
  //       toast.error("Error fetching items!");
  //       console.error(error);
  //     }
  //   };

  const fetchTransportOptions = async () => {
    try {
      const response = await getTransport();
      setTransportOptions(response);
    } catch (error) {
      toast.error("Error fetching transport options!");
      console.error(error);
    }
  };

  //   const fetchManufacturerOptions = async () => {
  //     try {
  //       const response = await getManufacturer();
  //       setManufacturerOptions(response);
  //     } catch (error) {
  //       toast.error("Error fetching manufacturers!");
  //       console.error(error);
  //     }
  //   };

  const fetchWarehouseOptions = async () => {
    try {
      const response = await getWarehouses();
      setWarehouseOptions(response);
    } catch (error) {
      toast.error("Error fetching warehouses!");
      console.error(error);
    }
  };

  // const handleSubmit = async (e) => {
  //   e.preventDefault();
  //   setLoading(true);
  //   try {
  //     //   const paymentDays = calculateDaysDifference(
  //     //     form.companyBargainDate,
  //     //     form.paymentDays
  //     //   );
  //     //   const updatedForm = { ...form, paymentDays };
  //     //   console.log(updatedForm);

  //     // const response = await createOrder(form);
  //     console.log(form);
  //     toast.success("Order added successfully!");
  //     // setForm({
  //     //   items: [{ itemId: "", quantity: 0 }],
  //     //   transporterId: "",
  //     //   orderId: "",
  //     //   invoiceNumber: "",
  //     //   invoiceDate: "",
  //     //   warehouseId: "",
  //     // });
  //     //   fetchOrders();
  //   } catch (error) {
  //     toast.error("Error adding order!");
  //     console.error(error);
  //   } finally {
  //     setLoading(false);
  //   }
  // };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const finalData = {
        warehouseId: form.warehouseId,
        transporterId: form.transporterId,
        orderId: form.orderId,
        invoiceDate: form.invoiceDate,
        items: form.items.map((item) => ({
          itemId: item.itemId,
          quantity: item.quantity,
        })),
      };

      const response = await createPurchase(finalData);
      setModal(false);
      toast.success("Purchase added successfully!");
      setForm({
        items: order.items.map((item) => ({
          itemId: item.itemId,
          quantity: item.quantity,
        })),
        transporterId: "",
        orderId: order._id,
        invoiceNumber: "",
        invoiceDate: "",
        warehouseId: "",
      });
      fetchOrder();
    } catch (error) {
      toast.error("Error adding order!");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  console.log(order.items);

  const handleFormChange = (index, fieldName, value) => {
    if (fieldName === "items") {
      const updatedItems = [...form.items];
      const maxQuantity = order.items[index].quantity;

      // Ensure the quantity does not exceed the available quantity in the order
      if (value.quantity > maxQuantity) {
        toast.error(`Quantity cannot exceed ${maxQuantity}`);
        return;
      }

      updatedItems[index] = value;
      setForm((prevData) => ({
        ...prevData,
        items: updatedItems,
      }));
    } else {
      setForm((prevData) => ({
        ...prevData,
        [fieldName]: value,
      }));
    }
  };

  return (
    <div
      id="default-modal"
      tabIndex="-1"
      aria-hidden="true"
      className="fixed inset-0 z-[1000] flex items-center justify-center w-full h-full overflow-y-auto overflow-x-hidden bg-gray-900 bg-opacity-50"
    >
      <div className="relative p-4 w-fit max-w-[700px] h-fit">
        <form
          onSubmit={handleSubmit}
          className="flex flex-col gap-4 p-5 bg-white shadow-md rounded-xl"
        >
          <div className="flex flex-col gap-4">
            {order.items.length > 0 &&
              order?.items.map((item, index) => (
                <div key={index} className="grid grid-cols-3 gap-2">
                  <Input
                    name="itemId"
                    label={`${item.item?.name}`}
                    value={form.items[index]?._id || ""}
                    disabled
                  />
                  <Input
                    name="quantity"
                    label="Quantity"
                    type="number"
                    value={form.items[index]?.quantity}
                    onChange={(e) =>
                      handleFormChange(index, "items", {
                        ...form.items[index],
                        quantity: parseInt(e.target.value, 10),
                      })
                    }
                    required
                  />
                </div>
              ))}

            <div className="grid grid-cols-3 gap-2">
              <Input
                name="invoiceDate"
                label="Invoice Date"
                type="date"
                value={form.invoiceDate}
                onChange={(e) =>
                  handleFormChange(0, "invoiceDate", e.target.value)
                }
              />

              {warehouseOptions?.length > 0 && (
                <Select
                  name="warehouseId"
                  label="Select Warehouse"
                  value={form.warehouseId}
                  onChange={(value) =>
                    handleFormChange(0, "warehouseId", value)
                  }
                  required
                >
                  {warehouseOptions?.map((option) => (
                    <Option key={option._id} value={option._id}>
                      {option.name}
                    </Option>
                  ))}
                </Select>
              )}

              {transportOptions?.length > 0 && (
                <Select
                  name="transporterId"
                  label="Select Transporter"
                  value={form.transporterId}
                  onChange={(value) =>
                    handleFormChange(0, "transporterId", value)
                  }
                  required
                >
                  {transportOptions?.map((option) => (
                    <Option key={option._id} value={option._id}>
                      {option.transport}
                    </Option>
                  ))}
                </Select>
              )}

              <Input
                name="companyBargainNo"
                label="Company Bargain No."
                type="text"
                value={order.companyBargainNo}
                onChange={(e) =>
                  handleFormChange(0, "companyBargainNo", e.target.value)
                }
                disabled
              />

              {manufacturerOptions.length > 0 && (
                <Select
                  name="manufacturer"
                  label="Select Manufacturer"
                  value={form.manufacturer}
                  onChange={(value) =>
                    handleFormChange(0, "manufacturer", value)
                  }
                  required
                >
                  {manufacturerOptions.map((option) => (
                    <Option key={option._id} value={option._id}>
                      {option.manufacturer}
                    </Option>
                  ))}
                </Select>
              )}

              <Select
                name="billType"
                label="Select Bill Type"
                value={order.billType}
                onChange={(value) => handleFormChange(0, "billType", value)}
                disabled
              >
                <Option value="Virtual Billed">Virtual Billed</Option>
                <Option value="Billed">Billed</Option>
              </Select>
            </div>

            <div className="grid grid-cols-3 gap-2">
              <Select
                name="transportCatigory"
                label="Select Transport Category"
                value={form.transportCatigory}
                onChange={(value) =>
                  handleFormChange(0, "transportCatigory", value)
                }
                required
              >
                <Option value="Depo">Depo</Option>
                <Option value="Rack">Rack</Option>
              </Select>

              <Input
                name="description"
                label="Description"
                type="text"
                value={order.description}
                onChange={(e) =>
                  handleFormChange(0, "description", e.target.value)
                }
                disabled
              />
            </div>
            <div className="flex flex-row gap-2 mt-5">
              <Button color="blue" type="submit">
                {loading ? <Spinner /> : <span>Create Purchase</span>}
              </Button>
              <Button color="red" onClick={() => setModal(false)}>
                <span>Cancel</span>
              </Button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PurchaseModal;

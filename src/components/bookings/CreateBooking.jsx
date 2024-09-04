import { useState, useEffect } from "react";
import { toast } from "react-toastify";
import { FaPlus, FaTrashAlt } from "react-icons/fa";
import {
  Button,
  Input,
  Spinner,
  IconButton,
  Select,
  Option,
} from "@material-tailwind/react";
import { createOrder, getOrders } from "@/services/orderService";
import {
  getBuyer,
  getItems,
  getManufacturer,
  getTransport,
} from "@/services/masterService";
import { getWarehouses, getWarehouseById } from "@/services/warehouseService";

// Add state for selected warehouse data
const CreateOrderForm = ({ fetchOrdersData }) => {
  const [loading, setLoading] = useState(false);
  const [orders, setOrders] = useState([]);
  const [itemsOptions, setItemsOptions] = useState([]);
  const [buyerOptions, setBuyerOptions] = useState([]);
  const [warehouseOptions, setWarehouseOptions] = useState([]);
  const [selectedWarehouse, setSelectedWarehouse] = useState(null);
  const [form, setForm] = useState({
    items: [{ item: "", quantity: 0, virtualQuantity: 0, billedQuantity: 0 }],
    BargainDate: "",
    BargainNo: "",
    validity: "",
    description: "",
    warehouse: "",
    deliveryOption: "",
    buyer: "",
    deliveryOption: "",
    deliveryAddress: {
      addressLine1: "",
      addressLine2: "",
      city: "",
      state: "",
      pinCode: "",
    },
  });

  useEffect(() => {
    fetchItemsOptions();
    fetchWarehouseOptions();
    fetchBuyerOptions();
  }, []);

  const fetchItemsOptions = async () => {
    try {
      const response = await getItems();
      setItemsOptions(response);
    } catch (error) {
      toast.error("Error fetching items!");
      console.error(error);
    }
  };

  const fetchWarehouseOptions = async () => {
    try {
      const response = await getWarehouses();
      setWarehouseOptions(response);
    } catch (error) {
      toast.error("Error fetching warehouses!");
      console.error(error);
    }
  };

  const fetchBuyerOptions = async () => {
    try {
      const response = await getBuyer();
      setBuyerOptions(response);
    } catch (error) {
      toast.error("Error fetching buyers!");
      console.error(error);
    }
  };

  const fetchWarehouseData = async (warehouseId) => {
    try {
      const response = await getWarehouseById(warehouseId);
      console.log(response);
      setSelectedWarehouse(response);
    } catch (error) {
      toast.error("Error fetching warehouse data!");
      console.error(error);
    }
  };

  useEffect(() => {
    if (form.warehouse) {
      fetchWarehouseData(form.warehouse);
    }
  }, [form.warehouse]);

  const calculateDaysDifference = (date1, date2) => {
    const diffTime = Math.abs(new Date(date2) - new Date(date1));
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const validity = calculateDaysDifference(form.BargainDate, form.validity);
      const updatedForm = {
        ...form,
        validity,
        organization: "64d22f5a8b3b9f47a3b0e7f1",
      };
      console.log(updatedForm);

      // const response = await createOrder(updatedForm);
      // toast.success("Order added successfully!");
      // setForm({
      //   items: [
      //     { item: "", quantity: 1, virtualQuantity: 0, billedQuantity: 0 },
      //   ],
      //   transportCatigory: "",
      //   BargainDate: "",
      //   BargainNo: "",
      //   manufacturer: "",
      //   validity: null,
      //   description: "",
      //   billType: "",
      //   warehouse: "",
      //   organization: "",
      // });
      // fetchOrdersData();
    } catch (error) {
      toast.error("Error adding booking!");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleFormChange = (index, fieldName, value) => {
    if (fieldName === "items") {
      const updatedItems = [...form.items];
      updatedItems[index] = value;
      setForm((prevData) => ({
        ...prevData,
        items: updatedItems,
      }));
    } else if (fieldName === "BargainDate") {
      const formattedDate = value.split("T")[0];
      setForm((prevData) => ({
        ...prevData,
        BargainDate: formattedDate,
      }));
    } else if (fieldName === "validity") {
      const formattedDate = value.split("T")[0];
      setForm((prevData) => ({
        ...prevData,
        validity: formattedDate,
      }));
    } else if (fieldName.includes("deliveryAddress")) {
      const addressField = fieldName.split(".")[1];
      setForm((prevData) => ({
        ...prevData,
        deliveryAddress: {
          ...prevData.deliveryAddress,
          [addressField]: value,
        },
      }));
    } else {
      setForm((prevData) => ({
        ...prevData,
        [fieldName]: value,
      }));
    }
  };

  const handleAddItem = () => {
    setForm((prevData) => ({
      ...prevData,
      items: [
        ...prevData.items,
        { item: "", quantity: 1, virtualQuantity: 0, billedQuantity: 0 },
      ],
    }));
  };

  const handleRemoveItem = (index) => {
    const updatedItems = form.items.filter((_, i) => i !== index);
    setForm((prevData) => ({
      ...prevData,
      items: updatedItems,
    }));
  };

  return (
    <div>
      <form
        onSubmit={handleSubmit}
        className="flex flex-col gap-4 p-5 bg-white shadow-md rounded-xl"
      >
        <div className="flex flex-col gap-4">
          {form.items.map((item, index) => (
            <div key={index} className="grid grid-cols-4 gap-2">
              {itemsOptions?.length > 0 && (
                <Select
                  name="item"
                  label={`Select Item ${index + 1}`}
                  value={item.item}
                  onChange={(value) =>
                    handleFormChange(index, "items", {
                      ...item,
                      item: value,
                    })
                  }
                  required
                >
                  {itemsOptions?.map((option) => (
                    <Option key={option._id} value={option._id}>
                      {option.name}
                    </Option>
                  ))}
                </Select>
              )}
              <Input
                name="quantity"
                label="Quantity"
                type="number"
                value={item.quantity}
                onChange={(e) =>
                  handleFormChange(index, "items", {
                    ...item,
                    quantity: e.target.value,
                  })
                }
                min={1}
                required
              />
              <div>
                <Input
                  name="virtualQuantity"
                  label="Virtual Quantity"
                  type="number"
                  value={item.virtualQuantity}
                  onChange={(e) =>
                    handleFormChange(index, "items", {
                      ...item,
                      virtualQuantity: e.target.value,
                    })
                  }
                  min={0}
                  required
                />
                <p className="text-sm text-gray-500">
                  Available Virtual Quantity:{" "}
                  {selectedWarehouse?.virtualInventory.find(
                    (inv) => inv.item.toString() === item.item
                  )?.quantity || 0}
                </p>
              </div>
              <div>
                <Input
                  name="billedQuantity"
                  label="Billed Quantity"
                  type="number"
                  value={item.billedQuantity}
                  onChange={(e) =>
                    handleFormChange(index, "items", {
                      ...item,
                      billedQuantity: e.target.value,
                    })
                  }
                  min={0}
                  required
                />
                <p className="text-sm text-gray-500">
                  Available Billed Quantity:{" "}
                  {selectedWarehouse?.billedInventory.find(
                    (inv) => inv.item.toString() === item.item
                  )?.quantity || 0}
                </p>
              </div>
              {index > 0 && (
                <IconButton color="red" onClick={() => handleRemoveItem(index)}>
                  <FaTrashAlt />
                </IconButton>
              )}
            </div>
          ))}

          <Button
            color="green"
            type="button"
            onClick={handleAddItem}
            className="w-fit flex flex-row gap-2 items-center"
          >
            <FaPlus /> Add Another Item
          </Button>

          <div className="grid grid-cols-4 gap-4">
            {warehouseOptions?.length > 0 && (
              <Select
                name="warehouse"
                label="Select Warehouse"
                value={form.warehouse}
                onChange={(value) => handleFormChange(null, "warehouse", value)}
                required
              >
                {warehouseOptions?.map((option) => (
                  <Option key={option._id} value={option._id}>
                    {option.name}
                  </Option>
                ))}
              </Select>
            )}
            {buyerOptions?.length > 0 && (
              <Select
                name="buyer"
                label="Select Buyer"
                value={form.buyer}
                onChange={(value) => handleFormChange(null, "buyer", value)}
                required
              >
                {buyerOptions?.map((option) => (
                  <Option key={option._id} value={option._id}>
                    {option.buyer}
                  </Option>
                ))}
              </Select>
            )}
            <Input
              name="BargainNo"
              label="Company Bargain No"
              type="text"
              value={form.BargainNo}
              onChange={(e) =>
                handleFormChange(null, "BargainNo", e.target.value)
              }
              required
            />
            <Input
              name="BargainDate"
              label="Company Bargain Date"
              type="date"
              value={form.BargainDate}
              onChange={(e) =>
                handleFormChange(null, "BargainDate", e.target.value)
              }
              required
            />
            <Input
              name="validity"
              label="Payment Date"
              type="date"
              value={form.validity}
              onChange={(e) =>
                handleFormChange(null, "validity", e.target.value)
              }
              required
            />
            <Input
              name="description"
              label="Description"
              type="text"
              value={form.description}
              onChange={(e) =>
                handleFormChange(null, "description", e.target.value)
              }
            />

            <Select
              name="deliveryOption"
              label="Select Delivery Option"
              value={form.deliveryOption}
              onChange={(value) => handleFormChange(0, "deliveryOption", value)}
              required
            >
              <Option value="Pickup">Pickup</Option>
              <Option value="Delivery">Delivery</Option>
            </Select>
          </div>
          {form.deliveryOption === "Delivery" && (
            <div className="grid grid-cols-5 gap-2">
              <Input
                name="deliveryAddress.addressLine1"
                label="Address Line 1"
                type="text"
                value={form.deliveryAddress.addressLine1}
                onChange={(e) =>
                  handleFormChange(
                    0,
                    "deliveryAddress.addressLine1",
                    e.target.value
                  )
                }
                required
              />
              <Input
                name="deliveryAddress.addressLine2"
                label="Address Line 2"
                type="text"
                value={form.deliveryAddress.addressLine2}
                onChange={(e) =>
                  handleFormChange(
                    0,
                    "deliveryAddress.addressLine2",
                    e.target.value
                  )
                }
                required
              />
              <Input
                name="deliveryAddress.city"
                label="City"
                type="text"
                value={form.deliveryAddress.city}
                onChange={(e) =>
                  handleFormChange(0, "deliveryAddress.city", e.target.value)
                }
                required
              />
              <Input
                name="deliveryAddress.state"
                label="State"
                type="text"
                value={form.deliveryAddress.state}
                onChange={(e) =>
                  handleFormChange(0, "deliveryAddress.state", e.target.value)
                }
                required
              />
              <Input
                name="deliveryAddress.pinCode"
                label="Pin Code"
                type="number"
                value={form.deliveryAddress.pinCode}
                onChange={(e) =>
                  handleFormChange(0, "deliveryAddress.pinCode", e.target.value)
                }
                required
              />
            </div>
          )}
        </div>
        <Button
          type="submit"
          color="blue"
          className="w-full"
          disabled={loading}
        >
          {loading ? <Spinner /> : "Submit Order"}
        </Button>
      </form>
    </div>
  );
};

export default CreateOrderForm;

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

const PurchaseModal = ({ setModal, order }) => {
  const [loading, setLoading] = useState(false);
  const [itemsOptions, setItemsOptions] = useState([]);
  const [transportOptions, setTransportOptions] = useState([]);
  const [manufacturerOptions, setManufacturerOptions] = useState([]);
  const [form, setForm] = useState({
    items: [{ itemId: "", quantity: 0 }],
    transporterId: "",
    orderId: "",
    invoiceNumber: "",
    invoiceDate: "",
    warehouseId: "",
  });

  useEffect(() => {
    // fetchItemsOptions();
    // fetchTransportOptions();
    // fetchManufacturerOptions();
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

  //   const fetchTransportOptions = async () => {
  //     try {
  //       const response = await getTransport();
  //       setTransportOptions(response);
  //     } catch (error) {
  //       toast.error("Error fetching transport options!");
  //       console.error(error);
  //     }
  //   };

  //   const fetchManufacturerOptions = async () => {
  //     try {
  //       const response = await getManufacturer();
  //       setManufacturerOptions(response);
  //     } catch (error) {
  //       toast.error("Error fetching manufacturers!");
  //       console.error(error);
  //     }
  //   };

  const calculateDaysDifference = (date1, date2) => {
    const diffTime = Math.abs(new Date(date2) - new Date(date1));
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      //   const paymentDays = calculateDaysDifference(
      //     form.companyBargainDate,
      //     form.paymentDays
      //   );
      //   const updatedForm = { ...form, paymentDays };
      //   console.log(updatedForm);

      const response = await createOrder(form);
      toast.success("Order added successfully!");
      setForm({
        items: [{ itemId: "", quantity: 0 }],
        transporterId: "",
        orderId: "",
        invoiceNumber: "",
        invoiceDate: "",
        warehouseId: "",
      });
    //   fetchOrders();
    } catch (error) {
      toast.error("Error adding order!");
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
    } else if (fieldName === "companyBargainDate") {
      const formattedDate = value.split("T")[0];
      setForm((prevData) => ({
        ...prevData,
        companyBargainDate: formattedDate,
      }));
    } else if (fieldName === "paymentDays") {
      const formattedDate = value.split("T")[0];
      setForm((prevData) => ({
        ...prevData,
        paymentDays: formattedDate,
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
      className="fixed inset-0 z-50 flex items-center justify-center w-full h-full overflow-y-auto overflow-x-hidden bg-gray-900 bg-opacity-50"
    >
      <div className="relative p-4 w-fit h-fit">
        <form
          onSubmit={handleSubmit}
          className="flex flex-col gap-4 p-5 bg-white shadow-md rounded-xl"
        >
          <div className="flex flex-col gap-4">
            {order?.items.map((item, index) => (
              <div key={index} className="grid grid-cols-3 gap-2">
                {itemsOptions?.length > 0 && (
                  <Select
                    name="itemId"
                    label={`Select Item ${index + 1}`}
                    value={item.itemId}
                    onChange={(value) =>
                      handleFormChange(index, "items", {
                        ...item,
                        itemId: value,
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
                {index > 0 && (
                  <IconButton
                    color="red"
                    onClick={() => handleRemoveItem(index)}
                  >
                    <FaTrashAlt />
                  </IconButton>
                )}
              </div>
            ))}

            <div className="grid grid-cols-4 gap-2">
              <Input
                name="companyBargainDate"
                label="Company Bargain Date"
                type="date"
                value={form.companyBargainDate}
                onChange={(e) =>
                  handleFormChange(0, "companyBargainDate", e.target.value)
                }
                required
              />
              <Input
                name="companyBargainNo"
                label="Company Bargain No."
                type="text"
                value={form.companyBargainNo}
                onChange={(e) =>
                  handleFormChange(0, "companyBargainNo", e.target.value)
                }
                required
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
                value={form.billType}
                onChange={(value) => handleFormChange(0, "billType", value)}
                required
              >
                <Option value="Virtual Billed">Virtual Billed</Option>
                <Option value="Billed">Billed</Option>
              </Select>
            </div>

            <div className="grid grid-cols-5 gap-2">
              {transportOptions?.length > 0 && (
                <Select
                  name="transportCatigory"
                  label="Select Transport"
                  value={form.transportCatigory}
                  onChange={(value) =>
                    handleFormChange(0, "transportCatigory", value)
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
                name="paymentDays"
                label="Payment Date"
                type="date"
                value={form.paymentDays}
                onChange={(e) =>
                  handleFormChange(0, "paymentDays", e.target.value)
                }
                min={1}
                required
              />
              <Input
                name="description"
                label="Description"
                type="text"
                value={form.description}
                onChange={(e) =>
                  handleFormChange(0, "description", e.target.value)
                }
              />
              <Button color="blue" type="submit">
                {loading ? <Spinner /> : <span>Add Order</span>}
              </Button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PurchaseModal;

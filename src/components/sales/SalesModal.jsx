import {
  Button,
  Input,
  Spinner,
  Select,
  Option,
} from "@material-tailwind/react";
import { useState, useEffect } from "react";
import { toast } from "react-toastify";
import { getTransport } from "@/services/masterService";
import { getWarehouses } from "@/services/warehouseService";
import { createSales } from "@/services/salesService";

const SalesModal = ({ setModal, booking, fetchBooking }) => {
  const [loading, setLoading] = useState(false);
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
    items: booking.items.map((item) => ({
      itemId: item.item?._id,
      quantity: item.quantity,
    })),
    transporterId: "",
    bookingId: booking._id,
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

  //   const fetchBookings = async () => {
  //     try {
  //       const response = await getbookings();
  //       setbookings(response);
  //     } catch (error) {
  //       toast.error("Error fetching bookings!");
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

  //     // const response = await createbooking(form);
  //     console.log(form);
  //     toast.success("booking added successfully!");
  //     // setForm({
  //     //   items: [{ itemId: "", quantity: 0 }],
  //     //   transporterId: "",
  //     //   bookingId: "",
  //     //   invoiceNumber: "",
  //     //   invoiceDate: "",
  //     //   warehouseId: "",
  //     // });
  //     //   fetchBookings();
  //   } catch (error) {
  //     toast.error("Error adding booking!");
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
        bookingId: form.bookingId,
        invoiceDate: form.invoiceDate,
        items: form.items.map((item) => ({
          itemId: item.itemId,
          quantity: item.quantity,
        })),
      };

      const response = await createSales(finalData);
      console.log(response);
      setModal(false);
      toast.success("Sales added successfully!");
      setForm({
        items: booking.items.map((item) => ({
          itemId: item.itemId,
          quantity: item.quantity,
        })),
        transporterId: "",
        bookingId: booking._id,
        invoiceNumber: "",
        invoiceDate: "",
        warehouseId: "",
      });
      fetchBooking();
    } catch (error) {
      toast.error("Error adding booking!");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  console.log(booking.items);

  const handleFormChange = (index, fieldName, value) => {
    if (fieldName === "items") {
      const updatedItems = [...form.items];
      const maxQuantity = booking.items[index].quantity;

      // Ensure the quantity does not exceed the available quantity in the booking
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
            {booking.items.length > 0 &&
              booking?.items.map((item, index) => (
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
                name="BargainNo"
                label="Bargain No."
                type="text"
                value={booking.BargainNo}
                onChange={(e) =>
                  handleFormChange(0, "BargainNo", e.target.value)
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
              <Input
                name="description"
                label="Description"
                type="text"
                value={booking.description}
                onChange={(e) =>
                  handleFormChange(0, "description", e.target.value)
                }
                disabled
              />
            </div>

            <div className="flex flex-row gap-2 mt-5">
              <Button color="blue" type="submit">
                {loading ? <Spinner /> : <span>Create Sales</span>}
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

export default SalesModal;

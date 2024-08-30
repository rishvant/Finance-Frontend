import {
  Button,
  Input,
  Spinner,
  IconButton,
  Select,
  Option,
  Typography,
} from "@material-tailwind/react";
import { useState, useEffect } from "react";
import { toast } from "react-toastify";
import { FaEdit, FaTrashAlt, FaPlus } from "react-icons/fa";
import { createOrder, updateOrder, getOrders } from "@/services/orderService";
import { getItems, getTransport } from "@/services/masterService";

const CreateOrderForm = () => {
  const [loading, setLoading] = useState(false);
  const [orders, setOrders] = useState([]);
  const [itemsOptions, setItemsOptions] = useState([]);
  const [transportOptions, setTransportOptions] = useState([]);
  const [form, setForm] = useState({
    items: [{ itemId: "", quantity: 0 }],
    transportId: "",
    companyBargainNo: "",
    description: "",
  });
  const [editingId, setEditingId] = useState(null);

  useEffect(() => {
    fetchOrders();
    fetchItemsOptions();
    fetchTransportOptions();
  }, []);

  const fetchOrders = async () => {
    try {
      const response = await getOrders();
      setOrders(response);
    } catch (error) {
      toast.error("Error fetching orders!");
      console.error(error);
    }
  };

  const fetchItemsOptions = async () => {
    try {
      const response = await getItems();
      setItemsOptions(response);
    } catch (error) {
      toast.error("Error fetching items!");
      console.error(error);
    }
  };

  const fetchTransportOptions = async () => {
    try {
      const response = await getTransport();
      setTransportOptions(response);
    } catch (error) {
      toast.error("Error fetching transport options!");
      console.error(error);
    }
  };

  const toggleEditing = async (id) => {
    const orderToEdit = orders.find((order) => order._id === id);
    if (orderToEdit.isEditing) {
      try {
        const data = {
          items: orderToEdit.items,
          transportId: orderToEdit.transportId,
          companyBargainNo: orderToEdit.companyBargainNo,
          description: orderToEdit.description,
        };
        await updateOrder(data, id);
        toast.success("Order updated successfully!");
        fetchOrders();
      } catch (error) {
        toast.error("Error updating order!");
        console.error(error);
      }
    } else {
      setOrders((prevOrders) =>
        prevOrders.map((order) =>
          order._id === id ? { ...order, isEditing: !order.isEditing } : order
        )
      );
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await createOrder(form);
      toast.success("Order added successfully!");
      setForm({
        items: [{ itemId: "", quantity: 1 }],
        transportId: "",
        companyBargainNo: "",
        description: "",
      });
      fetchOrders();
    } catch (error) {
      toast.error("Error adding order!");
      console.error(error);
    } finally {
      setLoading(false);
      setEditingId(null);
    }
  };

  const handleFormChange = (index, fieldName, value) => {
    const updatedItems = [...form.items];
    updatedItems[index][fieldName] = value;
    setForm((prevData) => ({
      ...prevData,
      items: updatedItems,
    }));
  };

  const handleAddItem = () => {
    setForm((prevData) => ({
      ...prevData,
      items: [...prevData.items, { itemId: "", quantity: 1 }],
    }));
  };

  const handleRemoveItem = (index) => {
    const updatedItems = form.items.filter((_, i) => i !== index);
    setForm((prevData) => ({
      ...prevData,
      items: updatedItems,
    }));
  };

  const handleOrderChange = (index, id, fieldName, value) => {
    const updatedOrders = [...orders];
    const updatedItems = [...updatedOrders[index].items];
    updatedItems[index][fieldName] = value;
    updatedOrders[index].items = updatedItems;

    setOrders(updatedOrders);
  };

  const handleDelete = async (id) => {
    try {
      await deleteOrder(id);
      toast.error("Order deleted successfully!");
      fetchOrders();
    } catch (error) {
      toast.error("Error deleting order!");
      console.error(error);
    }
  };

  return (
    <div>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4 p-5">
        <div className="flex flex-col items-end">
          <div className="w-full flex flex-col items-end gap-2">
            <div className="w-full flex flex-col gap-2">
              {form?.items?.map((item, index) => (
                <div key={index} className="grid grid-cols-3 gap-2">
                  {itemsOptions?.length > 0 && (
                    <Select
                      name="itemId"
                      label={`Select Item ${index + 1}`}
                      value={item.itemId}
                      onChange={(value) =>
                        handleFormChange(index, "itemId", value)
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
                      handleFormChange(index, "quantity", e.target.value)
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
            </div>

            <Button
              color="green"
              type="button"
              onClick={handleAddItem}
              className="w-fit flex flex-row gap-2 items-center"
            >
              <FaPlus /> Add Another Item
            </Button>
          </div>
          <div className="w-full grid grid-cols-3 gap-2 my-2">
            {transportOptions?.length > 0 && (
              <Select
                name="transportId"
                label="Select Transport"
                value={form.transportId}
                onChange={(value) => handleFormChange(0, "transportId", value)}
                required
                className="col-span-6"
              >
                {transportOptions.map((option) => (
                  <Option key={option._id} value={option._id}>
                    {option.name}
                  </Option>
                ))}
              </Select>
            )}

            <Input
              name="companyBargainNo"
              label="Company Bargain No."
              type="number"
              value={form.companyBargainNo}
              onChange={(e) =>
                handleFormChange(0, "companyBargainNo", e.target.value)
              }
              required
              className="col-span-6"
            />

            <Input
              name="description"
              label="Description"
              type="text"
              value={form.description}
              onChange={(e) =>
                handleFormChange(0, "description", e.target.value)
              }
              className="col-span-6"
            />
          </div>
          <Button color="blue" type="submit" className="col-span-6">
            {loading ? <Spinner /> : <span>Add Order</span>}
          </Button>
        </div>
      </form>

      {/* Orders Table */}
      {/* <div className="mt-8">
        {orders?.length > 0 ? (
          <table className="min-w-full bg-white">
            <thead>
              <tr>
                <th className="py-2 px-4 border-b text-start">Items</th>
                <th className="py-2 px-4 border-b text-start">Transport</th>
                <th className="py-2 px-4 border-b text-start">
                  Company Bargain No.
                </th>
                <th className="py-2 px-4 border-b text-start">Description</th>
                <th className="py-2 px-4 border-b text-start">Actions</th>
              </tr>
            </thead>
            <tbody>
              {orders?.map((order) => (
                <tr key={order._id}>
                  <td className="py-2 px-4 border-b">
                    {order.items.map((item, index) => (
                      <div key={index} className="flex items-center gap-2">
                        {order.isEditing ? (
                          <>
                            <Select
                              name={`itemId-${index}`}
                              value={item.itemId}
                              onChange={(value) =>
                                handleOrderChange(
                                  index,
                                  order._id,
                                  "itemId",
                                  value
                                )
                              }
                            >
                              {itemsOptions.map((option) => (
                                <Option key={option._id} value={option._id}>
                                  {option.name}
                                </Option>
                              ))}
                            </Select>
                            <Input
                              name={`quantity-${index}`}
                              type="number"
                              value={item.quantity}
                              onChange={(e) =>
                                handleOrderChange(
                                  index,
                                  order._id,
                                  "quantity",
                                  e.target.value
                                )
                              }
                              min={1}
                            />
                          </>
                        ) : (
                          <span>
                            {item.name} - {item.quantity}
                          </span>
                        )}
                      </div>
                    ))}
                  </td>
                  <td className="py-2 px-4 border-b">
                    {order.isEditing ? (
                      <Select
                        name="transportId"
                        value={order.transportId}
                        onChange={(value) =>
                          handleOrderChange(
                            index,
                            order._id,
                            "transportId",
                            value
                          )
                        }
                      >
                        {transportOptions.map((option) => (
                          <Option key={option._id} value={option._id}>
                            {option.name}
                          </Option>
                        ))}
                      </Select>
                    ) : (
                      <span>{order.transportName}</span>
                    )}
                  </td>
                  <td className="py-2 px-4 border-b">
                    {order.isEditing ? (
                      <Input
                        name="companyBargainNo"
                        type="number"
                        value={order.companyBargainNo}
                        onChange={(e) =>
                          handleOrderChange(
                            index,
                            order._id,
                            "companyBargainNo",
                            e.target.value
                          )
                        }
                      />
                    ) : (
                      <span>{order.companyBargainNo}</span>
                    )}
                  </td>
                  <td className="py-2 px-4 border-b">
                    {order.isEditing ? (
                      <Input
                        name="description"
                        type="text"
                        value={order.description}
                        onChange={(e) =>
                          handleOrderChange(
                            index,
                            order._id,
                            "description",
                            e.target.value
                          )
                        }
                      />
                    ) : (
                      <span>{order.description}</span>
                    )}
                  </td>
                  <td className="py-2 px-4 border-b flex gap-2">
                    {order.isEditing ? (
                      <Button
                        color="green"
                        onClick={() => toggleEditing(order._id)}
                      >
                        Save
                      </Button>
                    ) : (
                      <IconButton
                        color="blue"
                        onClick={() => toggleEditing(order._id)}
                      >
                        <FaEdit />
                      </IconButton>
                    )}
                    <IconButton
                      color="red"
                      onClick={() => handleDelete(order._id)}
                    >
                      <FaTrashAlt />
                    </IconButton>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <Typography variant="h5">No orders found.</Typography>
        )}
      </div> */}
    </div>
  );
};

export default CreateOrderForm;

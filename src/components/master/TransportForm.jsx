import {
  Button,
  Input,
  Spinner,
  IconButton,
  Typography,
} from "@material-tailwind/react";
import { useState, useEffect } from "react";
import { toast } from "react-toastify";
import { FaEdit, FaTrashAlt } from "react-icons/fa";
import {
  createTransport,
  deleteTransport,
  getTransport,
  updateTransport,
} from "@/services/masterService";

const TransportForm = () => {
  const [loading, setLoading] = useState(false);
  const [transport, setTransport] = useState([]);
  const [form, setForm] = useState({
    transport: "",
    transportType: "",
    transportContact: "",
    transportAgency: "",
  });
  const [editingId, setEditingId] = useState(null);

  useEffect(() => {
    fetchTransport();
  }, []);

  const fetchTransport = async () => {
    try {
      const response = await getTransport();
      const transportsWithEditingState = response.map((item) => ({
        ...item,
        isEditing: false,
      }));
      setTransport(transportsWithEditingState);
    } catch (error) {
      toast.error("Error fetching transports!");
      console.error(error);
    }
  };

  const toggleEditing = async (id) => {
    const transportToEdit = items.find((item) => item._id === id);
    if (transportToEdit.isEditing) {
      try {
        const data = {
          name: transportToEdit.name,
          packaging: transportToEdit.packaging,
          type: transportToEdit.type,
          weight: transportToEdit.weight,
          staticPrice: transportToEdit.staticPrice,
        };
        await updateTransport(data, id);
        toast.success("Transport updated successfully!");
        fetchTransport();
      } catch (error) {
        toast.error("Error updating transport!");
        console.error(error);
      }
    } else {
      setTransport((prevItems) =>
        prevItems.map((item) =>
          item._id === id ? { ...item, isEditing: !item.isEditing } : item
        )
      );
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await createTransport(form);
      console.log(response);
      toast.success("Transport added successfully!");
      setForm({
        transport: "",
        transportType: "",
        transportContact: "",
        transportAgency: "",
      });
      fetchTransport();
    } catch (error) {
      toast.error("Error adding transport!");
      console.error(error);
    } finally {
      setLoading(false);
      setEditingId(null);
    }
  };

  const handleChange = (e, fieldName) => {
    if (e && e.target) {
      const { name, value } = e.target;
      setForm((prevData) => ({
        ...prevData,
        [name]: value,
      }));
    } else {
      setForm((prevData) => ({
        ...prevData,
        [fieldName]: e,
      }));
    }
  };

  const handleUpdateChange = (e, id, fieldName) => {
    let name, value;

    if (e && e.target) {
      name = e.target.name;
      value = e.target.value;
    } else {
      name = fieldName;
      value = e;
    }
    setTransport((prevItems) =>
      prevItems.map((item) =>
        item._id === id
          ? {
              ...item,
              [name]: value,
            }
          : item
      )
    );
  };

  const handleDelete = async (id) => {
    try {
      await deleteTransport(id);
      toast.error("Transport deleted successfully!");
      fetchTransport();
    } catch (error) {
      toast.error("Error deleting transport!");
      console.error(error);
    }
  };

  return (
    <div>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div className="grid grid-cols-5 gap-2">
          <Input
            name="transport"
            label="Transport Name"
            type="text"
            value={form.transport}
            onChange={handleChange}
            required
          />
          <Input
            name="transportType"
            label="Transport Type"
            type="text"
            value={form.transportType}
            onChange={handleChange}
            required
          />
          <Input
            name="transportContact"
            label="Transport Contact"
            type="tel"
            value={form.transportContact}
            onChange={handleChange}
            required
          />
          <Input
            name="transportAgency"
            label="Transport Agency"
            type="text"
            value={form.transportAgency}
            onChange={handleChange}
            required
          />
          <Button color="blue" type="submit">
            {loading ? <Spinner /> : <span>Add Transport</span>}
          </Button>
        </div>
      </form>

      {/* Transport Table */}
      <div className="mt-8">
        {transport?.length > 0 ? (
          <table className="min-w-full bg-white">
            <thead>
              <tr>
                <th className="py-2 px-4 border-b text-start">Transport</th>
                <th className="py-2 px-4 border-b text-start">Type</th>
                <th className="py-2 px-4 border-b text-start">Contact</th>
                <th className="py-2 px-4 border-b text-start">Agency</th>
                <th className="py-2 px-4 border-b text-start">Actions</th>
              </tr>
            </thead>
            <tbody>
              {transport?.map((item) => (
                <tr key={item._id}>
                  <td className="py-2 px-4 border-b">
                    {item.isEditing ? (
                      <Input
                        name="transport"
                        type="text"
                        value={item.transport}
                        onChange={(e) => handleUpdateChange(e, item._id)}
                      />
                    ) : (
                      <span>{item.transport}</span>
                    )}
                  </td>
                  <td className="py-2 px-4 border-b">
                    {item.isEditing ? (
                      <Input
                        name="transportType"
                        type="text"
                        value={item.transportType}
                        onChange={(e) => handleUpdateChange(e, item._id)}
                      />
                    ) : (
                      <span>{item.transportType}</span>
                    )}
                  </td>
                  <td className="py-2 px-4 border-b">
                    {item.isEditing ? (
                      <Input
                        name="transportContact"
                        type="tel"
                        value={item.transportContact}
                        onChange={(e) => handleUpdateChange(e, item._id)}
                      />
                    ) : (
                      <span>{item.transportContact}</span>
                    )}
                  </td>
                  <td className="py-2 px-4 border-b">
                    {item.isEditing ? (
                      <Input
                        name="transportAgency"
                        type="text"
                        value={item.transportAgency}
                        onChange={(e) => handleUpdateChange(e, item._id)}
                      />
                    ) : (
                      <span>{item.transportAgency}</span>
                    )}
                  </td>
                  <td className="py-2 px-4 border-b flex gap-2">
                    {item.isEditing ? (
                      <IconButton
                        color="green"
                        onClick={() => toggleEditing(item._id)}
                      >
                        Save
                      </IconButton>
                    ) : (
                      <IconButton
                        color="blue"
                        onClick={() => toggleEditing(item._id)}
                      >
                        <FaEdit />
                      </IconButton>
                    )}
                    <IconButton
                      color="red"
                      onClick={() => handleDelete(item._id)}
                    >
                      <FaTrashAlt />
                    </IconButton>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <Typography className="text-xl text-center font-bold">
            No Transport!
          </Typography>
        )}
      </div>
    </div>
  );
};

export default TransportForm;

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
  createWarehouse,
  deleteWarehouse,
  getWarehouses,
} from "@/services/warehouseService";

const WarehouseForm = () => {
  const [loading, setLoading] = useState(false);
  const [warehouses, setWarehouses] = useState([]);
  const [form, setForm] = useState({
    name: "",
    location: {
      state: "",
      city: "",
    },
    warehouseManager: "",
    organization: "64d22f5a8b3b9f47a3b0e7f1",
  });
  const [editingId, setEditingId] = useState(null);

  useEffect(() => {
    fetchWarehouses();
  }, []);

  const fetchWarehouses = async () => {
    try {
      const response = await getWarehouses();
      const warehousesWithEditingState = response.map((warehouse) => ({
        ...warehouse,
        isEditing: false,
      }));
      setWarehouses(warehousesWithEditingState);
    } catch (error) {
      toast.error("Error fetching warehouses!");
      console.error(error);
    }
  };

  const toggleEditing = async (id) => {
    const warehouseToEdit = warehouses.find(
      (warehouse) => warehouse._id === id
    );
    if (warehouseToEdit.isEditing) {
      try {
        const data = {
          name: warehouseToEdit.name,
          location: {
            state: warehouseToEdit.location.state,
            city: warehouseToEdit.location.city,
          },
        };
        await updateWarehouse(data, id);
        toast.success("Warehouse updated successfully!");
        fetchWarehouses();
      } catch (error) {
        toast.error("Error updating warehouse!");
        console.error(error);
      }
    } else {
      setWarehouses((prevWarehouses) =>
        prevWarehouses.map((warehouse) =>
          warehouse._id === id
            ? { ...warehouse, isEditing: !warehouse.isEditing }
            : warehouse
        )
      );
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await createWarehouse(form);
      toast.success("Warehouse added successfully!");
      setForm({
        name: "",
        location: {
          state: "",
          city: "",
        },
        warehouseManager: "",
        organization: "",
      });
      fetchWarehouses();
    } catch (error) {
      toast.error("Error adding warehouse!");
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

  const handleWarehouseChange = (e, id) => {
    const { name, value } = e.target;

    setWarehouses((prevWarehouses) =>
      prevWarehouses.map((warehouse) =>
        warehouse._id === id
          ? {
              ...warehouse,
              [name.includes("location.") ? "location" : name]: name.includes(
                "location."
              )
                ? {
                    ...warehouse.location,
                    [name.split(".")[1]]: value,
                  }
                : value,
            }
          : warehouse
      )
    );
  };

  const handleDelete = async (id) => {
    try {
      await deleteWarehouse(id);
      toast.error("Warehouse deleted successfully!");
      fetchWarehouses();
    } catch (error) {
      toast.error("Error deleting warehouse!");
      console.error(error);
    }
  };

  return (
    <div>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div className="grid grid-cols-4 gap-2">
          <Input
            name="name"
            label="Warehouse Name"
            type="text"
            value={form.name}
            onChange={handleChange}
            required
          />
          <Input
            name="state"
            label="State"
            type="text"
            value={form.state}
            onChange={handleChange}
            required
          />
          <Input
            name="city"
            label="City"
            type="text"
            value={form.city}
            onChange={handleChange}
            required
          />
          <Button color="blue" type="submit">
            {loading ? <Spinner /> : <span>Add Warehouse</span>}
          </Button>
        </div>
      </form>

      {/* Warehouses Table */}
      <div className="mt-8">
        {warehouses?.length > 0 ? (
          <table className="min-w-full bg-white">
            <thead>
              <tr>
                <th className="py-2 px-4 border-b text-start">Name</th>
                <th className="py-2 px-4 border-b text-start">State</th>
                <th className="py-2 px-4 border-b text-start">City</th>
                <th className="py-2 px-4 border-b text-start">Actions</th>
              </tr>
            </thead>
            <tbody>
              {warehouses?.map((warehouse) => (
                <tr key={warehouse._id}>
                  <td className="py-2 px-4 border-b">
                    {warehouse.isEditing ? (
                      <Input
                        name="name"
                        type="text"
                        value={warehouse.name}
                        onChange={(e) =>
                          handleWarehouseChange(e, warehouse._id)
                        }
                      />
                    ) : (
                      <span>{warehouse.name}</span>
                    )}
                  </td>
                  <td className="py-2 px-4 border-b">
                    {warehouse.isEditing ? (
                      <Input
                        name="state"
                        type="text"
                        value={warehouse.location.state}
                        onChange={(e) =>
                          handleWarehouseChange(e, warehouse._id)
                        }
                      />
                    ) : (
                      <span>{warehouse.location.state}</span>
                    )}
                  </td>
                  <td className="py-2 px-4 border-b">
                    {warehouse.isEditing ? (
                      <Input
                        name="city"
                        type="text"
                        value={warehouse.location.city}
                        onChange={(e) =>
                          handleWarehouseChange(e, warehouse._id)
                        }
                      />
                    ) : (
                      <span>{warehouse.location.city}</span>
                    )}
                  </td>
                  <td className="py-2 px-4 border-b flex gap-2">
                    {warehouse.isEditing ? (
                      <IconButton
                        color="green"
                        onClick={() => toggleEditing(warehouse._id)}
                      >
                        Save
                      </IconButton>
                    ) : (
                      <IconButton
                        color="blue"
                        onClick={() => toggleEditing(warehouse._id)}
                      >
                        <FaEdit />
                      </IconButton>
                    )}
                    <IconButton
                      color="red"
                      onClick={() => handleDelete(warehouse._id)}
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
            No Warehouses!
          </Typography>
        )}
      </div>
    </div>
  );
};

export default WarehouseForm;

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
import { FaEdit, FaTrashAlt } from "react-icons/fa";
import {
  createItem,
  deleteItem,
  getItems,
  updateItem,
} from "@/services/masterService";

const ItemForm = () => {
  const [loading, setLoading] = useState(false);
  const [items, setItems] = useState([]);
  const [form, setForm] = useState({
    name: "",
    packaging: "",
    type: "",
    weight: "",
    staticPrice: "",
  });
  const [editingId, setEditingId] = useState(null);

  useEffect(() => {
    fetchItems();
  }, []);

  const fetchItems = async () => {
    try {
      const response = await getItems();
      const itemsWithEditingState = response.map((item) => ({
        ...item,
        isEditing: false,
      }));
      setItems(itemsWithEditingState);
    } catch (error) {
      toast.error("Error fetching items!");
      console.error(error);
    }
  };

  const toggleEditing = async (id) => {
    const itemToEdit = items.find((item) => item._id === id);
    if (itemToEdit.isEditing) {
      try {
        const data = {
          name: itemToEdit.name,
          packaging: itemToEdit.packaging,
          type: itemToEdit.type,
          weight: itemToEdit.weight,
          staticPrice: itemToEdit.staticPrice,
        };
        await updateItem(data, id);
        toast.success("Item updated successfully!");
        fetchItems();
      } catch (error) {
        toast.error("Error updating item!");
        console.error(error);
      }
    } else {
      setItems((prevItems) =>
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
      const response = await createItem(form);
      console.log(response);
      toast.success("Item added successfully!");
      setForm({
        name: "",
        packaging: "",
        type: "",
        weight: "",
        staticPrice: "",
      });
      fetchItems();
    } catch (error) {
      toast.error("Error adding item!");
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

  const handleItemChange = (e, id, fieldName) => {
    let name, value;

    if (e && e.target) {
      name = e.target.name;
      value = e.target.value;
    } else {
      name = fieldName;
      value = e;
    }
    setItems((prevItems) =>
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
      await deleteItem(id);
      toast.error("Item deleted successfully!");
      fetchItems();
    } catch (error) {
      toast.error("Error deleting item!");
      console.error(error);
    }
  };

  return (
    <div>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div className="grid grid-cols-6 gap-2">
          <Input
            name="name"
            label="Item Name"
            type="text"
            value={form.name}
            onChange={handleChange}
            required
          />
          <Select
            name="packaging"
            label="Packaging"
            value={form.packaging}
            onChange={(value) => handleChange(value, "packaging")}
          >
            <Option value="box">Box</Option>
            <Option value="tin">Tin</Option>
          </Select>
          <Input
            name="type"
            label="Type"
            type="text"
            value={form.type}
            onChange={handleChange}
            required
          />
          <Input
            name="weight"
            label="Weight"
            type="number"
            value={form.weight}
            onChange={handleChange}
            required
          />
          <Input
            name="staticPrice"
            label="Static Price"
            type="number"
            value={form.staticPrice}
            onChange={handleChange}
            required
          />
          <Button color="blue" type="submit">
            {loading ? <Spinner /> : <span>Add Item</span>}
          </Button>
        </div>
      </form>

      {/* Items Table */}
      <div className="w-full overflow-x-scroll mt-8">
        {items?.length > 0 ? (
          <table className="w-full bg-white">
            <thead>
              <tr className="grid grid-cols-6">
                <th className="py-2 px-4 border-b text-start">Name</th>
                <th className="py-2 px-4 border-b text-start">Packaging</th>
                <th className="py-2 px-4 border-b text-start">Type</th>
                <th className="py-2 px-4 border-b text-start">Weight</th>
                <th className="py-2 px-4 border-b text-start">Static Price</th>
                <th className="py-2 px-4 border-b text-start">Actions</th>
              </tr>
            </thead>
            <tbody>
              {items?.map((item) => (
                <tr key={item._id} className="grid grid-cols-6">
                  <td className="py-2 px-4 border-b">
                    {item.isEditing ? (
                      <Input
                        name="name"
                        type="text"
                        value={item.name}
                        onChange={(e) => handleItemChange(e, item._id)}
                      />
                    ) : (
                      <span>{item.name}</span>
                    )}
                  </td>
                  <td className="py-2 px-4 border-b">
                    {item.isEditing ? (
                      <Select
                        name="packaging"
                        value={item.packaging}
                        onChange={(value) =>
                          handleItemChange(value, item._id, "packaging")
                        }
                      >
                        <Option value="box">Box</Option>
                        <Option value="tin">Tin</Option>
                      </Select>
                    ) : (
                      <span>{item.packaging}</span>
                    )}
                  </td>
                  <td className="py-2 px-4 border-b">
                    {item.isEditing ? (
                      <Input
                        name="type"
                        type="text"
                        value={item.type}
                        onChange={(e) => handleItemChange(e, item._id)}
                      />
                    ) : (
                      <span>{item.type}</span>
                    )}
                  </td>
                  <td className="py-2 px-4 border-b">
                    {item.isEditing ? (
                      <Input
                        name="weight"
                        type="number"
                        value={item.weight}
                        onChange={(e) => handleItemChange(e, item._id)}
                      />
                    ) : (
                      <span>{item.weight}</span>
                    )}
                  </td>
                  <td className="py-2 px-4 border-b">
                    {item.isEditing ? (
                      <Input
                        name="staticPrice"
                        type="number"
                        value={item.staticPrice}
                        onChange={(e) => handleItemChange(e, item._id)}
                      />
                    ) : (
                      <span>{item.staticPrice}</span>
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
            No Items!
          </Typography>
        )}
      </div>
    </div>
  );
};

export default ItemForm;

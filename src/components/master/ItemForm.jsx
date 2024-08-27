import { Button, Input, Spinner, IconButton } from "@material-tailwind/react";
import { useState, useEffect } from "react";
import { toast } from "react-toastify";
import { FaEdit, FaTrashAlt } from "react-icons/fa";

const ItemForm = () => {
  const [loading, setLoading] = useState(false);
  const [items, setItems] = useState([]);
  const [form, setForm] = useState({
    name: "",
    packaging: "box",
    type: "",
    weight: "",
    staticPrice: "",
  });
  const [editing, setEditing] = useState(false);
  const [editingId, setEditingId] = useState(null);

  useEffect(() => {
    fetchItems();
  }, []);

  const fetchItems = async () => {
    try {
      // const response = await getItems(); // Replace with your API call
      const response = []; // Dummy data for now
      setItems(response);
    } catch (error) {
      toast.error("Error fetching items!");
      console.error(error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (editing) {
        // const response = await updateItem(editingId, form); // Replace with your API call
        toast.success("Item updated successfully!");
      } else {
        // const response = await addItem(form); // Replace with your API call
        toast.success("Item added successfully!");
      }
      setForm({
        name: "",
        packaging: "box",
        type: "",
        weight: "",
        staticPrice: "",
      });
      fetchItems();
    } catch (error) {
      toast.error(editing ? "Error updating item!" : "Error adding item!");
      console.error(error);
    } finally {
      setLoading(false);
      setEditing(false);
      setEditingId(null);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prevForm) => ({
      ...prevForm,
      [name]: value,
    }));
  };

  const handleEdit = (item) => {
    setForm(item);
    setEditing(true);
    setEditingId(item.id);
  };

  const handleDelete = async (id) => {
    setLoading(true);
    try {
      // await deleteItem(id); // Replace with your API call
      toast.success("Item deleted successfully!");
      fetchItems();
    } catch (error) {
      toast.error("Error deleting item!");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const dummyItems = [
    {
      id: 1,
      name: "Item 1",
      packaging: "box",
      type: "Type A",
      weight: "500g",
      staticPrice: "$10",
    },
    {
      id: 2,
      name: "Item 2",
      packaging: "bag",
      type: "Type B",
      weight: "1kg",
      staticPrice: "$20",
    },
    {
      id: 3,
      name: "Item 3",
      packaging: "box",
      type: "Type C",
      weight: "250g",
      staticPrice: "$5",
    },
  ];

  return (
    <div>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div className="grid grid-cols-4 gap-2">
          <Input
            name="name"
            label="Item Name"
            type="text"
            value={form.name}
            onChange={handleChange}
          />
          <Input
            name="packaging"
            label="Packaging"
            type="text"
            value={form.packaging}
            onChange={handleChange}
          />
          <Input
            name="type"
            label="Type"
            type="text"
            value={form.type}
            onChange={handleChange}
          />
          <Input
            name="weight"
            label="Weight"
            type="text"
            value={form.weight}
            onChange={handleChange}
          />
          <Input
            name="staticPrice"
            label="Static Price"
            type="text"
            value={form.staticPrice}
            onChange={handleChange}
          />
        </div>
        <Button className="w-fit" color="blue" type="submit">
          {loading ? (
            <Spinner />
          ) : (
            <span>{editing ? "Update Item" : "Add Item"}</span>
          )}
        </Button>
      </form>

      {/* Items Table */}
      <div className="mt-8">
        <table className="min-w-full bg-white">
          <thead>
            <tr>
              <th className="py-2 px-4 border-b">Name</th>
              <th className="py-2 px-4 border-b">Packaging</th>
              <th className="py-2 px-4 border-b">Type</th>
              <th className="py-2 px-4 border-b">Weight</th>
              <th className="py-2 px-4 border-b">Static Price</th>
              <th className="py-2 px-4 border-b">Actions</th>
            </tr>
          </thead>
          <tbody>
            {dummyItems.map((item) => (
              <tr key={item.id}>
                <td className="py-2 px-4 border-b">{item.name}</td>
                <td className="py-2 px-4 border-b">{item.packaging}</td>
                <td className="py-2 px-4 border-b">{item.type}</td>
                <td className="py-2 px-4 border-b">{item.weight}</td>
                <td className="py-2 px-4 border-b">{item.staticPrice}</td>
                <td className="py-2 px-4 border-b flex gap-2">
                  <IconButton color="blue" onClick={() => handleEdit(item)}>
                    <FaEdit />
                  </IconButton>
                  <IconButton color="red" onClick={() => handleDelete(item.id)}>
                    <FaTrashAlt />
                  </IconButton>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ItemForm;

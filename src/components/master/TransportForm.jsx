import { Button, Input, Spinner } from "@material-tailwind/react";
import { useState } from "react";
import { toast } from "react-toastify";

const TransportForm = () => {
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: "",
    packaging: "box",
    type: "",
    weight: "",
    staticPrice: "",
    quantity: "",
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      // const response = await addWarehouse(form);
      toast.success("Item added successfully!");
      console.log(form);
      setForm({
        name: "",
        packaging: "box",
        type: "",
        weight: "",
        staticPrice: "",
      });
    } catch (error) {
      toast.error("Error adding warehouse!");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prevForm) => ({
      ...prevForm,
      [name]: value,
    }));
  };

  return (
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
        {loading ? <Spinner /> : <span>Add Transport</span>}
      </Button>
    </form>
  );
};

export default TransportForm;

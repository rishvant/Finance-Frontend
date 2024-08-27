import { Button, Input, Spinner } from "@material-tailwind/react";
import { useState } from "react";
import { toast } from "react-toastify";

const WarehouseForm = () => {
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: "",
    state: "",
    city: "",
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      // const response = await addWarehouse(form);
      toast.success("Warehouse added successfully!");
      console.log(form);
      setForm({
        name: "",
        state: "",
        city: "",
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
    <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
      <div className="grid grid-cols-4 gap-2">
        <Input
          name="name"
          label="Warehouse Name"
          type="text"
          value={form.name}
          onChange={handleChange}
        />
        <Input
          name="state"
          label="State"
          type="text"
          value={form.state}
          onChange={handleChange}
        />
        <Input
          name="city"
          label="City"
          type="text"
          value={form.city}
          onChange={handleChange}
        />
        <Button className="w-fit" color="blue" type="submit">
          {loading ? <Spinner /> : <span>Add Warehouse</span>}
        </Button>
      </div>
    </form>
  );
};

export default WarehouseForm;

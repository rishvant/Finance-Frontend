import React, { useState, useEffect } from "react";
import {
  Card,
  CardHeader,
  CardBody,
  Typography,
  Button,
  Spinner,
  Input,
  Tabs,
  TabsHeader,
  Tab,
  Select,
  Option,
} from "@material-tailwind/react";
import {
  getWarehouseById,
  getWarehouses,
  updateInventory,
} from "@/services/warehouseService";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

export function InventoryManagement() {
  const [currentWarehouse, setCurrentWarehouse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedTab, setSelectedTab] = useState("virtual");
  const [transferQuantities, setTransferQuantities] = useState({});
  const [warehouses, setWarehouses] = useState([]);
  const [selectedWarehouse, setSelectedWarehouse] = useState("");

  // const navigate = useNavigate();

  useEffect(() => {
    fetchWarehouses();
    const storedWarehouseID = selectedWarehouse;
    const response = getWarehouseById(selectedWarehouse);
    if (storedWarehouseID) {
      getWarehouseById(storedWarehouseID).then((warehouse) => {
        setCurrentWarehouse(warehouse);
        setLoading(false);
      });
    }
  }, [selectedWarehouse]);

  const fetchWarehouses = async () => {
    try {
      const response = await getWarehouses();
      console.log(response);
      setWarehouses(response);
    } catch (err) {
      console.log(err);
    }
  };

  const handleTransferChange = (index, value) => {
    setTransferQuantities({
      ...transferQuantities,
      [index]: value,
    });
  };

  const handleTransfer = async (index) => {
    const transferQty = parseFloat(transferQuantities[index] || 0);

    if (transferQty > 0) {
      const updatedVirtualInventory = [...currentWarehouse.virtualInventory];
      const item = updatedVirtualInventory[index];

      if (item.quantity >= transferQty) {
        item.quantity -= transferQty;

        // Check if the item exists in the billed inventory
        const billedItemIndex = currentWarehouse.billedInventory.findIndex(
          (billedItem) => billedItem.itemName === item.itemName
        );

        if (billedItemIndex !== -1) {
          currentWarehouse.billedInventory[billedItemIndex].quantity +=
            transferQty;
        } else {
          currentWarehouse.billedInventory.push({
            itemName: item.itemName,
            weight: item.weight,
            quantity: transferQty,
          });
        }

        // Remove the item if its quantity reaches 0
        if (item.quantity === 0) {
          updatedVirtualInventory.splice(index, 1);
        }

        setCurrentWarehouse({
          ...currentWarehouse,
          virtualInventory: updatedVirtualInventory,
        });

        // Clear the input field
        setTransferQuantities({
          ...transferQuantities,
          [index]: "",
        });
        try {
          // Call the API to update the inventory on the server
          await updateInventory(currentWarehouse._id, {
            itemName: item.itemName,
            weight: item.weight,
            quantity: transferQty,
            billType: "Billed",
          });

          toast.success("Transfer successful and inventory updated!");
        } catch (error) {
          toast.error("Failed to update inventory on the server.");
          console.error("Error updating inventory:", error);
        }
      } else {
        toast.error("Insufficient quantity to transfer.");
      }
    }
  };

  const renderInventoryTable = (inventoryType) => {
    const inventory =
      inventoryType === "virtual"
        ? currentWarehouse.virtualInventory
        : currentWarehouse.billedInventory;
    const tableTitle =
      inventoryType === "virtual" ? "Virtual Inventory" : "Billed Inventory";

    return (
      <div className="mt-8">
        <Typography variant="h6" className="mb-4">
          {tableTitle}
        </Typography>
        {inventory.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full border border-gray-300">
              <thead className="bg-gray-100">
                <tr>
                  <th className="px-4 py-2 border">Item Name</th>
                  <th className="px-4 py-2 border">Weight (kg)</th>
                  <th className="px-4 py-2 border">Quantity</th>
                </tr>
              </thead>
              <tbody>
                {inventory.map((item, index) => (
                  <tr key={index}>
                    <td className="px-4 py-2 border">{item.itemName}</td>
                    <td className="px-4 py-2 border">{item.weight}</td>
                    <td className="px-4 py-2 border">{item.quantity}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <Typography variant="body2">
            No items in {tableTitle.toLowerCase()}.
          </Typography>
        )}
      </div>
    );
  };

  return (
    <Card className="mt-12 mb-8">
      <CardHeader
        variant="gradient"
        color="gray"
        className="p-6 flex justify-between items-center"
      >
        <Typography variant="h6" color="white">
          Inventory Management
        </Typography>
        <div className="w-72">
          <Tabs value="app">
            <TabsHeader>
              <Tab value="app" onClick={() => setSelectedTab("virtual")}>
                Virtual
              </Tab>
              <Tab value="message" onClick={() => setSelectedTab("billed")}>
                Billed
              </Tab>
            </TabsHeader>
          </Tabs>
        </div>
      </CardHeader>
      <CardBody className="h-[50vh]">
        <div>
          {warehouses?.length > 0 && (
            <Select
              name="warehouse"
              label="Warehouse"
              value={selectedWarehouse}
              onChange={(value) => setSelectedWarehouse(value)}
            >
              {warehouses?.map((warehouse) => (
                <Option value={warehouse._id}>{warehouse.name}</Option>
              ))}
            </Select>
          )}
        </div>

        {currentWarehouse !== null ? (
          loading ? (
            <div className="flex justify-center items-center">
              <Spinner color="blue" size="lg" />
            </div>
          ) : currentWarehouse !== "" ? (
            selectedTab === "virtual" ? (
              renderInventoryTable("virtual")
            ) : (
              renderInventoryTable("billed")
            )
          ) : (
            <Typography variant="body2" className="mt-5 text-center">
              No warehouse selected.
            </Typography>
          )
        ) : (
          <Typography variant="body2" className="mt-5 text-center">
            No warehouse selected.
          </Typography>
        )}
      </CardBody>
    </Card>
  );
}

export default InventoryManagement;

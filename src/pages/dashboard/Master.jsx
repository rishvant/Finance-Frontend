import React, { useState, useEffect } from "react";
import {
  Card,
  CardHeader,
  CardBody,
  Typography,
  Input,
  Button,
  Spinner,
} from "@material-tailwind/react";
import {
  createWarehouse,
  fetchWarehouse,
  getWarehouseById,
} from "@/services/warehouseService";
import { useNavigate } from "react-router-dom";
import statesAndCities from "@/data/statecities.json";

export function WarehouseMaster() {
  const states = Object.keys(statesAndCities);
  const [selectedState, setSelectedState] = useState("");
  const [selectedCity, setSelectedCity] = useState("");
  const [warehouseName, setWarehouseName] = useState("");
  const [selectedWarehouseID, setSelectedWarehouseID] = useState("");
  const [filteredWarehouses, setFilteredWarehouses] = useState([]);
  const [currentWarehouse, setCurrentWarehouse] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Check if a warehouse ID is stored in local storage
  useEffect(() => {
    const storedWarehouseID = localStorage.getItem("warehouse");
    if (storedWarehouseID) {
      getWarehouseById(storedWarehouseID).then((warehouse) => {
        setCurrentWarehouse(warehouse);
        setSelectedWarehouseID(storedWarehouseID);
        setLoading(false); // Data loaded
      });
    } else {
      setLoading(false); // No warehouse ID in local storage, stop loading
    }
  }, []);

  // Update cities based on selected state
  useEffect(() => {
    setSelectedCity("");
    setFilteredWarehouses([]);
  }, [selectedState]);

  // Filter warehouses based on input
  useEffect(() => {
    const fetchFilteredWarehouses = async () => {
      if (selectedCity && selectedState) {
        setLoading(true); // Start loading
        const warehousesData = await fetchWarehouse(
          selectedState,
          selectedCity
        );
        setFilteredWarehouses(warehousesData?.warehouses);
        setLoading(false); // Data loaded
      } else {
        setFilteredWarehouses([]);
        setLoading(false); // No data to load, stop loading
      }
    };

    fetchFilteredWarehouses();
  }, [warehouseName, selectedCity]);

  const handleWarehouseSubmit = async () => {
    setLoading(true); // Start loading
    if (selectedWarehouseID) {
      alert("Existing warehouse selected. Proceeding with the selected warehouse.");
      const response = await getWarehouseById(selectedWarehouseID);
      console.log(response._id);
      localStorage.setItem("warehouse", response._id);
      navigate("/dashboard/orders");
    } else {
      alert("Proceeding with new warehouse creation!");
      const response = await createWarehouse({
        name: warehouseName,
        location: { state: selectedState, city: selectedCity },
      });
      console.log(response.warehouse._id);
      localStorage.setItem("warehouse", response.warehouse._id);
      navigate("/orders");
    }
    setLoading(false); // Stop loading
  };

  const handleChangeWarehouse = () => {
    setCurrentWarehouse(null);
    setSelectedState("");
    setSelectedCity("");
    setWarehouseName("");
    setSelectedWarehouseID("");
    localStorage.removeItem("warehouse");
  };

  return (
    <Card className="mt-12 mb-8">
      <CardHeader
        variant="gradient"
        color="gray"
        className="mb-8 p-6 flex justify-between items-center"
      >
        <Typography variant="h6" color="white">
          Warehouse Management
        </Typography>
      </CardHeader>
      <CardBody>
        <div className="flex flex-col gap-6">
          {loading ? (
            <div className="flex justify-center items-center">
              <Spinner color="blue" size="lg" /> {/* Spinner while loading */}
            </div>
          ) : currentWarehouse ? (
            <div>
              <Typography variant="small" className="mb-2">
                Current Selected Warehouse
              </Typography>
              <Typography variant="body1" className="mb-2">
                Name: {currentWarehouse.name}
              </Typography>
              <Typography variant="body1" className="mb-4">
                Location: {currentWarehouse.location.state},{" "}
                {currentWarehouse.location.city}
              </Typography>
              <Button
                variant="gradient"
                color="red"
                onClick={handleChangeWarehouse}
              >
                Change Warehouse
              </Button>
            </div>
          ) : (
            <>
              {/* State Dropdown */}
              <div>
                <Typography variant="small" className="mb-2">
                  Select State
                </Typography>
                <select
                  className="border rounded-md px-3 py-2"
                  value={selectedState}
                  onChange={(e) => setSelectedState(e.target.value)}
                >
                  <option value="">Select State</option>
                  {states.map((state) => (
                    <option key={state} value={state}>
                      {state}
                    </option>
                  ))}
                </select>
              </div>

              {/* City Dropdown */}
              <div>
                <Typography variant="small" className="mb-2">
                  Select City
                </Typography>
                <select
                  className="border rounded-md px-3 py-2"
                  value={selectedCity}
                  onChange={(e) => setSelectedCity(e.target.value)}
                  disabled={!selectedState}
                >
                  <option value="">Select City</option>
                  {statesAndCities[selectedState]?.map((city) => (
                    <option key={city} value={city}>
                      {city}
                    </option>
                  ))}
                </select>
              </div>

              {/* Warehouse Input with Dropdown */}
              <div>
                <Typography variant="small" className="mb-2">
                  Warehouse Name
                </Typography>
                <Input
                  type="text"
                  value={warehouseName}
                  onChange={(e) => setWarehouseName(e.target.value)}
                  placeholder="Enter or select a warehouse"
                  disabled={!selectedCity}
                />
                {filteredWarehouses?.length > 0 && (
                  <ul className="border rounded-md mt-2 max-h-40 overflow-y-auto">
                    {filteredWarehouses?.map((warehouse) => (
                      <li
                        key={warehouse._id}
                        className="px-3 py-2 cursor-pointer hover:bg-gray-200"
                        onClick={() => {
                          setWarehouseName(warehouse.name);
                          setSelectedWarehouseID(warehouse._id);
                        }}
                      >
                        {warehouse.name}
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              {/* Submit Button */}
              <Button
                variant="gradient"
                color="blue"
                onClick={handleWarehouseSubmit}
                disabled={!selectedState || !selectedCity || !warehouseName}
              >
                Proceed
              </Button>
            </>
          )}
        </div>
      </CardBody>
    </Card>
  );
}

export default WarehouseMaster;

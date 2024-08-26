import React, { useEffect, useState } from "react";
import {
  Card,
  CardBody,
  CardFooter,
  Button,
  Input,
  Textarea,
  Select,
  Option,
} from "@material-tailwind/react";
import { Formik, Form, Field, FieldArray, ErrorMessage } from "formik";
import * as Yup from "yup";
import { createBooking } from "@/services/bookingService";
import { getWarehouseById } from "@/services/warehouseService";

// Validation schema for form fields
const validationSchema = Yup.object().shape({
  companyBargainDate: Yup.date().required("Company Bargain Date is required"),
  companyBargainNo: Yup.string().required("Company Bargain Number is required"),
  buyer: Yup.object().shape({
    buyer: Yup.string().required("Buyer Name is required"),
    buyerLocation: Yup.string().required("Buyer Location is required"),
    buyerContact: Yup.string().required("Buyer Contact is required"),
  }),
  items: Yup.array().of(
    Yup.object().shape({
      name: Yup.string().required("Item Name is required"),
      packaging: Yup.string().oneOf(["box", "tin"], "Invalid packaging type"),
      type: Yup.string(),
      weight: Yup.number().required("Weight is required").positive(),
      staticPrice: Yup.number().required("Static Price is required").positive(),
      quantity: Yup.number().required("Quantity is required").positive().integer(),
    })
  ),
  validity: Yup.number().default(),
  deliveryOption: Yup.string().required("Delivery Option is required"),
  warehouse: Yup.string().required("Warehouse is required for Pickup option"),
  deliveryAddress: Yup.object().shape({
    addressLine1: Yup.string().required("Address Line 1 is required for Delivery option"),
    addressLine2: Yup.string(),
    city: Yup.string().required("City is required for Delivery option"),
    state: Yup.string().required("State is required for Delivery option"),
    pinCode: Yup.string().required("Pin Code is required for Delivery option"),
  }),
  virtualInventoryQuantities: Yup.array().of(
    Yup.object().shape({
      itemName: Yup.string().required("Virtual Inventory Item Name is required"),
      quantity: Yup.number().required("Virtual Inventory Quantity is required").positive().integer(),
    })
  ),
  billedInventoryQuantities: Yup.array().of(
    Yup.object().shape({
      itemName: Yup.string().required("Billed Inventory Item Name is required"),
      quantity: Yup.number().required("Billed Inventory Quantity is required").positive().integer(),
    })
  ),
  description: Yup.string(),
  status: Yup.string()
    .oneOf(["created", "payment pending", "billed", "completed"])
    .required("Status is required"),
  reminderDays: Yup.array().of(
    Yup.number().positive().integer()
  ).default([7, 3, 1]),
});

export function CreateBookingForm({ setShowCreateBookingForm }) {
  const [itemOptions, setItemOptions] = useState([]);
  
  const initialValues = {
    companyBargainDate: "",
    companyBargainNo: "",
    buyer: {
      buyer: "",
      buyerLocation: "",
      buyerContact: "",
    },
    items: [
      {
        name: "",
        packaging: "box",
        type: "",
        weight: "",
        staticPrice: "",
        quantity: "",
      },
    ],
    validity: 21,
    deliveryOption: "Pickup",
    warehouse: localStorage.getItem("warehouse") || "",
    deliveryAddress: {
      addressLine1: "",
      addressLine2: "",
      city: "",
      state: "",
      pinCode: "",
    },
    virtualInventoryQuantities: [
      {
        itemName: "",
        quantity: "",
      },
    ],
    billedInventoryQuantities: [
      {
        itemName: "",
        quantity: "",
      },
    ],
    description: "",
    status: "created",
    reminderDays: [7, 3, 1],
  };
  
  const calculateWeight = (values, index) => {
    const item = values.items[index];
    const category = parseFloat(item.quantityPerPiece || 0);
    const pieces = parseInt(item.piecesPerBox || 0);
    const boxes = parseInt(item.numberOfBoxes || 0);
    const weightPerMl = parseFloat(item.weightPerMl || 0);

    const totalMl = category * pieces * boxes;
    const totalGrams = totalMl * weightPerMl;
    const totalKg = totalGrams / 1000;
    const totalMt = totalKg / 1000;

    return totalMt;
  };

  useEffect(() => {
    const fetchItems = async () => {
      const response = await getWarehouseById(localStorage.getItem("warehouse"));
      const virtual = response.virtualInventory;
      const billed = response.billedInventory;
      const items = [...new Set([...virtual, ...billed].map(item => item.itemName))];
      setItemOptions(items);
    };

    fetchItems();
  }, []);

  const handleSubmit = async (values, { setSubmitting }) => {
    try {
      const updatedValues = {
        ...values,
        items: values.items.map((item, index) => ({
          ...item,
          weight: calculateWeight(values, index),
        })),
      };
      const response = await createBooking(updatedValues);
      console.log(response);
      console.log("Form submitted with values:", updatedValues);
      setShowCreateBookingForm(false);
    } catch (error) {
      console.error("Error creating order:", error);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Card className="w-full mx-auto">
      <Formik
        initialValues={initialValues}
        // validationSchema={validationSchema}
        onSubmit={handleSubmit}
      >
        {({ isSubmitting, values }) => (
          <Form>
            <CardBody className="flex flex-col gap-4">
              <div>
                <Field
                  name="companyBargainDate"
                  as={Input}
                  type="date"
                  label="Company Bargain Date"
                  variant="standard"
                  fullWidth
                />
                <ErrorMessage
                  name="companyBargainDate"
                  component="div"
                  className="text-red-600 text-sm"
                />
              </div>

              <FieldArray name="items">
                {({ push, remove }) => (
                  <>
                    {values.items.map((_, index) => (
                      <div key={index} className="flex flex-col gap-4 border border-black/20 border-[3px] rounded-lg p-4 pb-4 mb-4">
                        <div>
                          <Field
                        name={`items[${index}].name`}
                        as={Select}
                        label="Item Name"
                        variant="standard"
                        fullWidth
                      >
                        {itemOptions.map((itemName, idx) => (
                          <Option key={idx} value={itemName}>
                            {itemName}
                          </Option>
                        ))}
                          </Field>
                          <ErrorMessage
                            name={`items[${index}].name`}
                            component="div"
                            className="text-red-600 text-sm"
                          />
                        </div>
                        <div>
                          <Field
                            name={`items[${index}].packaging`}
                            as={Select}
                            label="Packaging"
                            variant="standard"
                            fullWidth
                          >
                            <Option value="box">Box</Option>
                            <Option value="tin">Tin</Option>
                          </Field>
                          <ErrorMessage
                            name={`items[${index}].packaging`}
                            component="div"
                            className="text-red-600 text-sm"
                          />
                        </div>
                        <div>
                          <Field
                            name={`items[${index}].weight`}
                            as={Input}
                            type="number"
                            label="Weight (kg)"
                            variant="standard"
                            fullWidth
                          />
                          <ErrorMessage
                            name={`items[${index}].weight`}
                            component="div"
                            className="text-red-600 text-sm"
                          />
                        </div>
                        <div>
                          <Field
                            name={`items[${index}].quantity`}
                            as={Input}
                            type="number"
                            label="Quantity"
                            variant="standard"
                            fullWidth
                          />
                          <ErrorMessage
                            name={`items[${index}].quantity`}
                            component="div"
                            className="text-red-600 text-sm"
                          />
                        </div>
                        <div>
                          <Field
                            name={`items[${index}].staticPrice`}
                            as={Input}
                            type="number"
                            label="Static Price"
                            variant="standard"
                            fullWidth
                          />
                          <ErrorMessage
                            name={`items[${index}].staticPrice`}
                            component="div"
                            className="text-red-600 text-sm"
                          />
                        </div>
                        <div>
                          <Field
                            name={`items[${index}].quantityPerPiece`}
                            as={Input}
                            type="number"
                            label="Quantity Per Piece"
                            variant="standard"
                            fullWidth
                          />
                          <ErrorMessage
                            name={`items[${index}].quantityPerPiece`}
                            component="div"
                            className="text-red-600 text-sm"
                          />
                        </div>
                        <div>
                          <Field
                            name={`items[${index}].piecesPerBox`}
                            as={Input}
                            type="number"
                            label="Pieces Per Box"
                            variant="standard"
                            fullWidth
                          />
                          <ErrorMessage
                            name={`items[${index}].piecesPerBox`}
                            component="div"
                            className="text-red-600 text-sm"
                          />
                        </div>
                        <div>
                          <Field
                            name={`items[${index}].numberOfBoxes`}
                            as={Input}
                            type="number"
                            label="Number of Boxes"
                            variant="standard"
                            fullWidth
                          />
                          <ErrorMessage
                            name={`items[${index}].numberOfBoxes`}
                            component="div"
                            className="text-red-600 text-sm"
                          />
                        </div>
                        <div>
                          <Field
                            name={`items[${index}].weightPerMl`}
                            as={Input}
                            type="number"
                            label="Weight of 1 Ml of Oil (grams)"
                            variant="standard"
                            fullWidth
                          />
                          <ErrorMessage
                            name={`items[${index}].weightPerMl`}
                            component="div"
                            className="text-red-600 text-sm"
                          />
                        </div>
                        <div>
                          <Field
                            name={`items[${index}].finalWeightMetric`}
                            as={Input}
                            type="number"
                            label="Final Weight in Metric Tons"
                            variant="standard"
                            fullWidth
                            disabled
                          />
                          <ErrorMessage
                            name={`items[${index}].finalWeightMetric`}
                            component="div"
                            className="text-red-600 text-sm"
                          />
                        </div>
                        <Button
                          variant="text"
                          color="red"
                          onClick={() => remove(index)}
                          disabled={values.items.length === 1}
                        >
                          Remove Item
                        </Button>
                      </div>
                    ))}
                    <Button
                      variant="outlined"
                      color="blue"
                      onClick={() => push({ 
                        name: "", 
                        packaging: "box", 
                        weight: "", 
                        quantity: "", 
                        staticPrice: "",
                        quantityPerPiece: "",
                        piecesPerBox: "",
                        numberOfBoxes: "",
                        weightPerMl: "",
                        finalWeightMetric: "",
                      })}
                    >
                      Add Item
                    </Button>
                  </>
                )}
              </FieldArray>

              <div>
                <Field
                  name="companyBargainNo"
                  as={Input}
                  type="text"
                  label="Company Bargain Number"
                  variant="standard"
                  fullWidth
                />
                <ErrorMessage
                  name="companyBargainNo"
                  component="div"
                  className="text-red-600 text-sm"
                />
              </div>
              <div>
                <Field
                  name="buyer.buyer"
                  as={Input}
                  type="text"
                  label="Buyer Name"
                  variant="standard"
                  fullWidth
                />
                <ErrorMessage
                  name="buyer.buyer"
                  component="div"
                  className="text-red-600 text-sm"
                />
              </div>
              <div>
                <Field
                  name="buyer.buyerLocation"
                  as={Input}
                  type="text"
                  label="Buyer Location"
                  variant="standard"
                  fullWidth
                />
                <ErrorMessage
                  name="buyer.buyerLocation"
                  component="div"
                  className="text-red-600 text-sm"
                />
              </div>
              <div>
                <Field
                  name="buyer.buyerContact"
                  as={Input}
                  type="text"
                  label="Buyer Contact"
                  variant="standard"
                  fullWidth
                />
                <ErrorMessage
                  name="buyer.buyerContact"
                  component="div"
                  className="text-red-600 text-sm"
                />
              </div>
              <div>
                <Field
                  name="status"
                  as={Select}
                  label="Status"
                  variant="standard"
                  fullWidth
                >
                  <Option value="created">Created</Option>
                  <Option value="payment pending">Payment Pending</Option>
                  <Option value="billed">Billed</Option>
                  <Option value="completed">Completed</Option>
                </Field>
                <ErrorMessage
                  name="status"
                  component="div"
                  className="text-red-600 text-sm"
                />
              </div>
              <div>
                <Field
                  name="deliveryOption"
                  as={Select}
                  label="Delivery Type"
                  variant="standard"
                  fullWidth
                >
                  <Option value="Pickup">Pickup</Option>
                  <Option value="Delivery">Delivery</Option>
                </Field>
                <ErrorMessage
                  name="deliveryOption"
                  component="div"
                  className="text-red-600 text-sm"
                />
              </div>
              <div>
                <Field
                  name="description"
                  as={Textarea}
                  label="Description (Optional)"
                  variant="standard"
                  fullWidth
                />
                <ErrorMessage
                  name="description"
                  component="div"
                  className="text-red-600 text-sm"
                />
              </div>
            </CardBody>
            <CardFooter className="pt-0 flex flex-row gap-5">
              <Button
                variant="gradient"
                color="black"
                fullWidth
                onClick={()=>setShowCreateBookingForm(false)}
              >
                Cancel
              </Button>
              <Button
                variant="gradient"
                color="blue"
                type="submit"
                fullWidth
                disabled={isSubmitting}
              >
                {isSubmitting ? "Creating..." : "Create Booking"}
              </Button>
            </CardFooter>
          </Form>
        )}
      </Formik>
    </Card>
  );
}

import React from "react";
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
import { createOrder } from "@/services/orderService";
import { createBooking } from "@/services/bookingService";

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
  validity: Yup.number().default(21),
  deliveryOption: Yup.string()
    .oneOf(["Pickup", "Delivery"])
    .required("Delivery Option is required"),
  warehouse: Yup.string().when('deliveryOption', {
    is: "Pickup",
    then: Yup.string().required("Warehouse is required for Pickup option"),
  }),
  deliveryAddress: Yup.object().shape({
    addressLine1: Yup.string().when('deliveryOption', {
      is: "Delivery",
      then: Yup.string().required("Address Line 1 is required for Delivery option"),
    }),
    addressLine2: Yup.string(),
    city: Yup.string().when('deliveryOption', {
      is: "Delivery",
      then: Yup.string().required("City is required for Delivery option"),
    }),
    state: Yup.string().when('deliveryOption', {
      is: "Delivery",
      then: Yup.string().required("State is required for Delivery option"),
    }),
    pinCode: Yup.string().when('deliveryOption', {
      is: "Delivery",
      then: Yup.string().required("Pin Code is required for Delivery option"),
    }),
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
      packaging: "box", // Default value
      type: "", // Optional field
      weight: "",
      staticPrice: "",
      quantity: "",
    },
  ],
  validity: 21, // Default value
  deliveryOption: "Pickup", // Default or change as needed
  warehouse: localStorage.getItem("warehouse") || "", // Conditional based on deliveryOption
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
  status: "created", // Default value
  reminderDays: [7, 3, 1], // Default value
};

  // const calculateWeight = (values, index) => {
  //   const item = values.items[index];
  //   const category = parseFloat(item.quantityPerPiece || 0);
  //   const pieces = parseInt(item.piecesPerBox || 0);
  //   const boxes = parseInt(item.numberOfBoxes || 0);
  //   const weightPerMl = parseFloat(item.weightPerMl || 0);

  //   const totalMl = category * pieces * boxes;
  //   const totalGrams = totalMl * weightPerMl;
  //   const totalKg = totalGrams / 1000;
  //   const totalMt = totalKg / 1000;

  //   return totalMt;
  // };

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
        validationSchema={validationSchema}
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
                            as={Input}
                            type="text"
                            label="Item Name"
                            variant="standard"
                            fullWidth
                          />
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
                  name="sellerName"
                  as={Input}
                  type="text"
                  label="Seller Name"
                  variant="standard"
                  fullWidth
                />
                <ErrorMessage
                  name="sellerName"
                  component="div"
                  className="text-red-600 text-sm"
                />
              </div>
              <div>
                <Field
                  name="sellerLocation"
                  as={Input}
                  type="text"
                  label="Seller Location"
                  variant="standard"
                  fullWidth
                />
                <ErrorMessage
                  name="sellerLocation"
                  component="div"
                  className="text-red-600 text-sm"
                />
              </div>
              <div>
                <Field
                  name="sellerContact"
                  as={Input}
                  type="text"
                  label="Seller Contact"
                  variant="standard"
                  fullWidth
                />
                <ErrorMessage
                  name="sellerContact"
                  component="div"
                  className="text-red-600 text-sm"
                />
              </div>
              <div>
                <Field
                  name="billType"
                  as={Select}
                  label="Bill Type"
                  variant="standard"
                  fullWidth
                >
                  <Option value="Virtual Billed">Virtual Billed</Option>
                  <Option value="Billed">Billed</Option>
                </Field>
                <ErrorMessage
                  name="billType"
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
                  name="warehouse"
                  as={Input}
                  type="text"
                  label="Warehouse"
                  variant="standard"
                  fullWidth
                />
                <ErrorMessage
                  name="warehouse"
                  component="div"
                  className="text-red-600 text-sm"
                />
              </div>
              <div>
                <Field
                  name="transportType"
                  as={Input}
                  type="text"
                  label="Transport Type"
                  variant="standard"
                  fullWidth
                />
                <ErrorMessage
                  name="transportType"
                  component="div"
                  className="text-red-600 text-sm"
                />
              </div>
              <div>
                <Field
                  name="transportLocation"
                  as={Input}
                  type="text"
                  label="Transport Location"
                  variant="standard"
                  fullWidth
                />
                <ErrorMessage
                  name="transportLocation"
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
                {isSubmitting ? "Creating..." : "Create Order"}
              </Button>
            </CardFooter>
          </Form>
        )}
      </Formik>
    </Card>
  );
}

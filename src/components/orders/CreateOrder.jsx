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

// Validation schema for form fields
const validationSchema = Yup.object().shape({
  companyBargainDate: Yup.date().required("Company Bargain Date is required"),
  items: Yup.array().of(
    Yup.object().shape({
      name: Yup.string().required("Item Name is required"),
      packaging: Yup.string().oneOf(["box", "tin"], "Invalid packaging type"),
      weight: Yup.number().required("Weight is required").positive().integer(),
      quantity: Yup.number()
        .required("Quantity is required")
        .positive()
        .integer(),
      staticPrice: Yup.number()
        .required("Static Price is required")
        .positive()
        .integer(),
      quantityPerPiece: Yup.number()
        .required("Quantity per Piece is required")
        .positive()
        .integer(),
      piecesPerBox: Yup.number()
        .required("Pieces per Box is required")
        .positive()
        .integer(),
      numberOfBoxes: Yup.number()
        .required("Number of Boxes is required")
        .positive()
        .integer(),
      weightPerMl: Yup.number()
        .required("Weight per Ml is required")
        .positive(),
      // finalWeightMetric: Yup.number().required("Final Weight in Metric Tons is required").positive(),
    })
  ),
  companyBargainNo: Yup.string().required("Company Bargain Number is required"),
  sellerName: Yup.string().required("Seller Name is required"),
  sellerLocation: Yup.string().required("Seller Location is required"),
  sellerContact: Yup.string().required("Seller Contact is required"),
  billType: Yup.string()
    .oneOf(["Virtual Billed", "Billed"])
    .required("Bill Type is required"),
  status: Yup.string()
    .oneOf(["created", "payment pending", "billed", "completed"])
    .required("Status is required"),
  description: Yup.string(),
  organization: Yup.string().required("Organization is required"),
  warehouse: Yup.string().required("Warehouse is required"),
  transportType: Yup.string().required("Transport Type is required"),
  transportLocation: Yup.string().required("Transport Location is required"),
});

export function CreateOrderForm({ setShowCreateOrderForm }) {
  const initialValues = {
    companyBargainDate: "",
    items: [
      {
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
      },
    ],
    companyBargainNo: "",
    sellerName: "",
    sellerLocation: "",
    sellerContact: "",
    billType: "Virtual Billed",
    status: "created",
    description: "",
    organization: "64d22f5a8b3b9f47a3b0e7f1",
    warehouse: localStorage.getItem("warehouse"),
    transportType: "",
    transportLocation: "",
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

  const handleSubmit = async (values, { setSubmitting }) => {
    try {
      const updatedValues = {
        ...values,
        items: values.items.map((item, index) => ({
          ...item,
          weight: calculateWeight(values, index),
        })),
      };
      const response = await createOrder(updatedValues);
      console.log(response);
      console.log("Form submitted with values:", updatedValues);
      setShowCreateOrderForm(false);
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
              <div className="flex flex-col">
                <div className="flex flex-row flex-wrap gap-5">
                  <div className="col-span-1">
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

                  <div className="col-span-1">
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
                  <div className="col-span-1">
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
                  <div className="col-span-1">
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
                  <div className="col-span-1">
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
                  <div className="col-span-1">
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
                </div>

                <FieldArray name="items">
                  {({ push, remove }) => (
                    <>
                      {values.items.map((_, index) => (
                        <div
                          key={index}
                          className="flex flex-row flex-wrap gap-x-4 gap-y-2 border border-black/20 border-[3px] rounded-lg p-4 mt-2 mb-4"
                        >
                          <div className="col-span-1">
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
                          <div className="col-span-1">
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
                          <div className="col-span-1">
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
                          <div className="col-span-1">
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
                          {/* <div className="col-span-1">
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
                          <div className="col-span-1">
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
                          <div className="col-span-1">
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
                          <div className="col-span-1">
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
                          <div className="col-span-1">
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
                          <div className="col-span-1">
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
                          </div> */}
                          <Button
                            variant="text"
                            color="red"
                            onClick={() => remove(index)}
                            disabled={values.items.length === 1}
                            className="col-span-2 w-fit h-fit"
                          >
                            Remove Item
                          </Button>
                            <Button
                              variant="outlined"
                              color="blue"
                              onClick={() =>
                                push({
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
                                })
                              }
                              className="w-fit h-fit"
                            >
                              Add Item
                            </Button>
                        </div>
                      ))}
                    </>
                  )}
                </FieldArray>
              </div>

              <div className="flex flex-row gap-5">
                <div className="col-span-1">
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
                {/* <div className="col-span-1">
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
                <div className="col-span-1">
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
                </div> */}
                <div className="flex justify-end gap-4 h-fit w-fit mt-4">
                  <Button
                    variant="outlined"
                    color="blue"
                    onClick={() => resetForm()}
                    disabled={isSubmitting}
                  >
                    Reset
                  </Button>
                  <Button
                    type="submit"
                    variant="filled"
                    color="blue"
                    disabled={isSubmitting}
                  >
                    Create Order
                  </Button>
                </div>
              </div>
            </CardBody>
          </Form>
        )}
      </Formik>
    </Card>
  );
}

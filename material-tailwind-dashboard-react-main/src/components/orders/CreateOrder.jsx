import React from "react";
import {
  Card,
  CardHeader,
  CardBody,
  CardFooter,
  Typography,
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
      quantity: Yup.number().required("Quantity is required").positive().integer(),
      staticPrice: Yup.number().required("Static Price is required").positive().integer(),
    })
  ),
  companyBargainNo: Yup.string().required("Company Bargain Number is required"),
  sellerName: Yup.string().required("Seller Name is required"),
  sellerLocation: Yup.string().required("Seller Location is required"),
  sellerContact: Yup.string().required("Seller Contact is required"),
  billType: Yup.string().oneOf(["Virtual Billed", "Billed"]).required("Bill Type is required"),
  status: Yup.string().oneOf(["created", "payment pending", "billed", "completed"]).required("Status is required"),
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
        staticPrice:""
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

  const handleSubmit = async (values, { setSubmitting }) => {
    try {
      const response = await createOrder(values);
      console.log(response);
      console.log("Form submitted with values:", values);
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
                      <div key={index} className="flex flex-col gap-4 border-b pb-4 mb-4">
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
                      onClick={() => push({ name: "", packaging: "box", weight: "", quantity: "", staticPrice:"" })}
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
                  name="organization"
                  as={Input}
                  type="text"
                  label="Organization"
                  variant="standard"
                  fullWidth
                />
                <ErrorMessage
                  name="organization"
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
                  label="Description"
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
                onClick={()=>setShowCreateOrderForm(false)}
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

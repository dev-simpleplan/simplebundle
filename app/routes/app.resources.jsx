import React, { useEffect, useState } from "react";
import { json } from "@remix-run/node";
import { useActionData, useSubmit } from "@remix-run/react";
import { useAppBridge } from "@shopify/app-bridge-react";
import ResourceUI from "../components/ResourceUI";
export async function action({ request }) {
  const formData = await request.formData();
  const email = formData.get("email");
  const message = formData.get("message");
  console.log("Server received support request:", { email, message });
  try {
    await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate network delay
    if (Math.random() < 0.3) { // 30% chance of error
      throw new Error("Failed to send support request");
    }
    return json({ success: true });
  } catch (error) {
    return json({ error: error.message }, { status: 500 });
  }
}
export default function Resources() {
  const app = useAppBridge();
  const actionData = useActionData();
  const submit = useSubmit();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [shouldResetForm, setShouldResetForm] = useState(false);
  useEffect(() => {
    if (actionData) {
      if (actionData.success) {
        app.toast.show('Support request sent successfully');
        setIsModalOpen(false);
        setShouldResetForm(true);
      } else if (actionData.error) {
        app.toast.show('Failed to send support request', { isError: true });
      }
      setIsSubmitting(false);
    }
  }, [actionData, app]);
  const handleSupportSubmit = (formData) => {
    setIsSubmitting(true);
    setShouldResetForm(false);
    submit(formData, { method: "post" });
  };
  const handleModalOpen = () => {
    setIsModalOpen(true);
    setShouldResetForm(false);
  };
  const handleModalClose = () => {
    setIsModalOpen(false);
    setShouldResetForm(true);
  };
  return (
    <ResourceUI 
      onSupportSubmit={handleSupportSubmit} 
      formErrors={actionData?.errors}
      isSubmitting={isSubmitting}
      isModalOpen={isModalOpen}
      onModalOpen={handleModalOpen}
      onModalClose={handleModalClose}
      shouldResetForm={shouldResetForm}
    />
  );
}
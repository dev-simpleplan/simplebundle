import React, { useState, useCallback, useEffect } from 'react';
import {
  Modal,
  TextField,
  Form,
  BlockStack,
  Spinner,
  ChoiceList
} from '@shopify/polaris';

export function SupportModal({ open, onClose, onSubmit, isSubmitting, formErrors, shouldResetForm, i18 }) {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [emailError, setEmailError] = useState('');
  const [requestType, setRequestType] = useState(['feature_request']);

  useEffect(() => {
    if (shouldResetForm) {
      setEmail('');
      setMessage('');
      setEmailError('');
      setRequestType(['feature_request']);
    }
  }, [shouldResetForm]);

  const validateEmail = (email) => {
    const re = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return re.test(String(email).toLowerCase());
  };

  const handleEmailChange = useCallback((value) => {
    setEmail(value);
    if (value && !validateEmail(value)) {
      setEmailError(i18.t("emailError"));
    } else {
      setEmailError('');
    }
  }, []);

  const handleSubmit = () => {
    if (!validateEmail(email)) {
      setEmailError(i18.t("emailError"));
      return;
    }
    const formData = new FormData();
    formData.append('email', email);
    formData.append('message', message);
    formData.append('requestType', requestType[0]);
    onSubmit(formData);
  };

  const handleClose = () => {
    setEmail('');
    setMessage('');
    setEmailError('');
    setRequestType(['feature_request']);
    onClose();
  };

  return (
    <Modal
      open={open}
      onClose={handleClose}
      title={i18.t("resourceContactBtn")}
      primaryAction={{
        content: isSubmitting ? <Spinner size="small" /> : i18.t("submitLabel"),
        onAction: handleSubmit,
        disabled: isSubmitting || !!emailError,
      }}
      secondaryActions={[
        {
          content: i18.t("cancelLabel"),
          onAction: handleClose,
          disabled: isSubmitting,
        },
      ]}
    >
      <Modal.Section>
        <Form onSubmit={handleSubmit}>
          <BlockStack gap="400">
            <ChoiceList
              title={i18.t("requestTypeLabel")}
              choices={[
                {label: i18.t("featureRequestLabel"), value: 'feature_request'},
                {label: i18.t("supportLabel"), value: 'support'},
              ]}
              selected={requestType}
              onChange={setRequestType}
            />
            <TextField
              label={i18.t("emailLabel")}
              type="email"
              value={email}
              onChange={handleEmailChange}
              autoComplete="email"
              error={emailError || formErrors?.email}
              placeholder="your.email@example.com"
              disabled={isSubmitting}
              required
            />
            <TextField
              label={i18.t("messageLabel")}
              value={message}
              onChange={setMessage}
              multiline={4}
              autoComplete="off"
              error={formErrors?.message}
              placeholder={requestType[0] === 'feature_request' ? i18.t("descFeatLabel") : i18.t("helpLabel")}
              disabled={isSubmitting}
              required
            />
          </BlockStack>
        </Form>
      </Modal.Section>
    </Modal>
  );
}

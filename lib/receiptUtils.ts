import api from './api';

/**
 * Check if a payment reference already has a receipt
 * @param paymentReference - The payment reference string to check
 * @returns true if receipt exists for this payment_reference, false otherwise
 */
export const checkDuplicatePaymentReference = async (paymentReference: string): Promise<boolean> => {
  try {
    const response = await api.get('/receipts/', {
      params: {
        payment_reference: paymentReference,
      },
    });

    const receipts = response.data.results || response.data;
    return receipts && receipts.length > 0;
  } catch (error) {
    console.error('Error checking duplicate payment reference:', error);
    // If there's an error, we don't want to block the user
    return false;
  }
};

/**
 * Validate payment reference before creating receipt
 * @param paymentReference - The payment reference to validate
 * @returns object with { isValid: boolean, message: string }
 */
export const validatePaymentReference = async (
  paymentReference: string
): Promise<{ isValid: boolean; message: string }> => {
  if (!paymentReference || paymentReference.trim().length === 0) {
    return {
      isValid: false,
      message: 'Payment reference is required',
    };
  }

  const isDuplicate = await checkDuplicatePaymentReference(paymentReference);
  if (isDuplicate) {
    return {
      isValid: false,
      message: `A receipt already exists for payment reference: ${paymentReference}. Duplicate receipts are not allowed.`,
    };
  }

  return {
    isValid: true,
    message: 'Payment reference is valid',
  };
};

/**
 * Handle receipt creation with duplicate checking
 * @param receiptData - The receipt data to create
 * @returns the created receipt or throws an error
 */
export const createReceiptWithDuplicateCheck = async (receiptData: {
  receipt_number: string;
  payment_reference: string;
  signatory: number;
}): Promise<any> => {
  // First check for duplicates
  const validation = await validatePaymentReference(receiptData.payment_reference);
  if (!validation.isValid) {
    throw new Error(validation.message);
  }

  try {
    const response = await api.post('/receipts/', receiptData);
    return response.data;
  } catch (error: any) {
    // Handle unique constraint error from backend
    if (error.response?.status === 400) {
      const errorData = error.response.data;

      if (errorData.payment_reference) {
        throw new Error(
          `Payment reference must be unique. ${
            errorData.payment_reference?.[0] || 'This payment reference already exists.'
          }`
        );
      }

      if (errorData.receipt_number) {
        throw new Error(
          `Receipt number must be unique. ${
            errorData.receipt_number?.[0] || 'This receipt number already exists.'
          }`
        );
      }
    }

    throw error;
  }
};

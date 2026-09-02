export interface User {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  is_active: boolean;
  is_staff?: boolean;
}

export interface HajjYear {
  id: number;
  year: number;
  name: string;
  description: string;
  start_date: string;
  end_date: string;
  is_active: boolean;
  first_deposit_amount?: number | string | null;
  total_package_fee?: number | string | null;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface Pilgrim {
  id: number;
  registration_id: string;
  first_name: string;
  last_name: string;
  full_name: string;
  email: string;
  phone: string;
  date_of_birth: string;
  gender: 'M' | 'F';
  nationality: string;
  passport_number: string;
  address: string;
  city: string;
  state: string;
  postal_code: string;
  country: string;
  status: 'registered' | 'paid' | 'departed' | 'returned';
  hajj_year?: number | HajjYear;
  total_amount_due: number;
  total_amount_paid: number;
  amount_remaining: number; // Calculated: package_price - total_paid
  current_due?: number; // Alias for amount_remaining
  emergency_contact_name: string;
  emergency_contact_phone: string;
  emergency_contact_email: string;
  created_at: string;
  updated_at: string;
}

export interface Payment {
  id: number;
  pilgrim: number;
  pilgrim_name: string;
  bank: number;
  bank_name: string;
  amount: number;
  reference_number: string;
  status: 'pending' | 'confirmed' | 'failed' | 'refunded';
  payment_date: string;
  description: string;
  notes: string;
  created_at: string;
  updated_at: string;
  // Payer information
  payer_name?: string;
  payer_contact?: string;
  payer_relationship?: string;
}

export interface Bank {
  id: number;
  name: string;
  code: string;
  country: string;
  contact_email: string;
  contact_phone: string;
  is_active: boolean;
  created_at: string;
}

export interface BankPaymentSubmission {
  id: string;
  bank: number;
  bank_name: string;
  pilgrim_id: string;
  amount: number;
  reference_number: string;
  status: 'pending' | 'verified' | 'failed';
  submission_method: 'manual_form' | 'csv_upload' | 'api_webhook';
  payment_date: string;
  description: string;
  submitted_at: string;
  verified_at: string;
  submitted_by_user?: string;
  // Pilgrim information (collected at bank)
  pilgrim_first_name?: string;
  pilgrim_last_name?: string;
  pilgrim_gender?: 'M' | 'F';
  pilgrim_phone?: string;
  pilgrim_email?: string;
  // Payer information (who made the deposit)
  payer_name?: string;
  payer_contact?: string;
  payer_relationship?: string;
  // Link to created pilgrim (after GIA creates them)
  created_pilgrim_id?: number;
}

export interface DashboardSummary {
  total_pilgrims: number;
  total_paid: string;
  total_pending: string;
  confirmed_payments: number;
  pending_payments: number;
  payments_today: number;
  total_banks: number;
}

export interface PaymentByStatus {
  status: string;
  count: number;
  amount: string;
}

export interface PaymentByBank {
  bank: string;
  count: number;
  amount: string;
}

export type CurrencyCode = 'GMD' | 'USD' | 'GBP' | 'EUR';

export interface Currency {
  code: CurrencyCode;
  name: string;
  symbol: string;
  rate: number; // Exchange rate relative to base currency (GMD)
}

export interface CurrencySettings {
  default_currency: CurrencyCode;
  base_currency: CurrencyCode;
  currencies: Record<CurrencyCode, Currency>;
  last_updated: string;
}

export interface SystemSettings {
  id: number;
  currency_settings: CurrencySettings;
  organization_name: string;
  logo_url?: string;
  theme_color?: string;
  updated_at: string;
}

export interface Receipt {
  id: number;
  receipt_number: string;
  payment_reference: string;
  signatory: number;
  created_at: string;
  updated_at: string;
}

export interface ReceiptSummary {
  total_receipts: number;
  total_amount: string | number;
}

export interface EmailNotification {
  id: number;
  email: string;
  description: string;
  is_active: boolean;
  created_at: string;
}

export interface EmailNotificationSettings {
  id: number;
  enable_notifications: boolean;
  notify_on_payment: boolean;
  notify_on_receipt: boolean;
  notification_delay: number;
  email_from: string;
  email_subject: string;
  created_at: string;
  updated_at: string;
}

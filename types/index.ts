export interface User {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  is_active: boolean;
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
  total_amount_due: number;
  total_amount_paid: number;
  amount_remaining: number;
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

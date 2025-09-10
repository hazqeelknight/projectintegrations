// Contact module type definitions

export interface Contact {
  id: string;
  first_name: string;
  last_name: string;
  full_name: string;
  email: string;
  phone: string;
  company: string;
  job_title: string;
  notes: string;
  tags: string[];
  total_bookings: number;
  last_booking_date: string | null;
  groups_count: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface ContactCreateData {
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
  company?: string;
  job_title?: string;
  notes?: string;
  tags?: string[];
  is_active?: boolean;
}

export interface ContactUpdateData extends Partial<ContactCreateData> {}

export interface ContactGroup {
  id: string;
  name: string;
  description: string;
  color: string;
  contact_count: number;
  contacts: Contact[];
  created_at: string;
  updated_at: string;
}

export interface ContactGroupCreateData {
  name: string;
  description?: string;
  color?: string;
  contact_ids?: string[];
}

export interface ContactGroupUpdateData extends Partial<ContactGroupCreateData> {}

export interface ContactInteraction {
  id: string;
  contact_name: string;
  interaction_type: 'booking_created' | 'booking_completed' | 'booking_cancelled' | 'email_sent' | 'note_added' | 'manual_entry';
  interaction_type_display: string;
  description: string;
  booking_id: string | null;
  metadata: Record<string, any>;
  created_at: string;
}

export interface ContactInteractionCreateData {
  interaction_type: ContactInteraction['interaction_type'];
  description: string;
  metadata?: Record<string, any>;
}

export interface ContactStats {
  total_contacts: number;
  active_contacts: number;
  total_groups: number;
  recent_interactions: number;
  top_companies: Array<{
    company: string;
    count: number;
  }>;
  booking_frequency: {
    this_month: number;
    last_month: number;
    this_year: number;
  };
}

export interface ContactImportData {
  csv_file: File;
  skip_duplicates?: boolean;
  update_existing?: boolean;
}

export interface ContactMergeData {
  primary_contact_id: string;
  duplicate_contact_ids: string[];
}

export interface ContactFilters {
  search?: string;
  group?: string;
  tags?: string;
  is_active?: boolean;
}

// API Response types
export interface ContactListResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: Contact[];
}

export interface ContactGroupListResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: ContactGroup[];
}

export interface ContactInteractionListResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: ContactInteraction[];
}
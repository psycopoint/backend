import { patients } from "@db/schemas/public/patients";

export interface Address {
  street?: string;
  number?: number | null;
  complement?: string | null;
  neighborhood?: string | null;
  city?: string | null;
  state?: string | null;
  postalCode?: string | null;
  country?: string | null;
}

export interface EmergencyContact {
  id: string;
  contactName: string;
  contactRelation: string;
  contactPhone: string;
}

export interface DiagramSituation {
  id: string;
  situationNumber?: number | null | undefined;
  description?: string | null | undefined;
  automaticThought?: string | null | undefined;
  atMeaning?: string | null | undefined;
  emotion?: string | null | undefined;
  behavior?: string | null | undefined;
  therapyFocus?: string | null | undefined;
  createdAt: string;
  updatedAt: string;
}

// life info schema
export interface AnamnesisLifeInfoSchema {
  fieldName: string;
  fieldContent: string;
}

// PREFERENCES
export interface PatientPreferences {
  calendarColor?: string | null;
}

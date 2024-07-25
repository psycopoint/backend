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

export type EmergencyContact = {
  id: string;
  contactName: string;
  contactRelation: string;
  contactPhone: string;
};

export type DiagramSituation = {
  id: string;
  situationNumber: string | null;
  description: string | null;
  automaticThought: string | null;
  atMeaning: string | null;
  emotion: string | null;
  behavior: string | null;
  therapyFocus: string | null;
  createdAt: string;
  updatedAt: string;
};

// life info schema
export interface AnamnesisLifeInfoSchema {
  fieldName: string;
  fieldContent: string;
}

// PREFERENCES
export interface PatientPreferences {
  calendarColor?: string | null;
}

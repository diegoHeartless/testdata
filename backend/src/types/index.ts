export interface Profile {
  id: string;
  personal: PersonalInfo;
  address: Address;
  passport?: Passport;
  inn?: string;
  snils?: string;
  driver_license?: DriverLicense;
  oms?: OMS;
  created_at: string;
  expires_at?: string;
}

export interface PersonalInfo {
  first_name: string;
  last_name: string;
  middle_name: string;
  gender: 'male' | 'female';
  birth_date: string; // YYYY-MM-DD
  age: number;
  birth_place: string;
}

export interface Address {
  region: string;
  region_name: string;
  city: string;
  street: string;
  house: string;
  apartment?: string;
  postal_code: string;
}

export interface Passport {
  series: string; // Format: "45 01"
  number: string; // 6 digits
  issued_by: string;
  division_code: string; // Format: "770-001"
  issue_date: string; // YYYY-MM-DD
}

export interface DriverLicense {
  series: string; // Format: "77АВ"
  number: string; // 6 digits
  categories: string[]; // ["B", "C"]
  issue_date: string;
  expiry_date: string;
}

export interface OMS {
  number: string; // 16 digits
  issue_date: string;
}

export interface GenerationParams {
  gender?: 'male' | 'female' | 'random';
  age_range?: [number, number];
  region?: string;
  include_documents?: string[];
}

export interface ApiResponseDto<T> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: any;
  };
  meta?: {
    request_id: string;
    timestamp: string;
  };
}

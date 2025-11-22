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
  birth_date: string;
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
  series: string;
  number: string;
  issued_by: string;
  division_code: string;
  issue_date: string;
}

export interface DriverLicense {
  series: string;
  number: string;
  categories: string[];
  issue_date: string;
  expiry_date: string;
}

export interface OMS {
  number: string;
  issue_date: string;
}

export interface GenerationParams {
  gender?: 'male' | 'female' | 'random';
  age_range?: [number, number];
  region?: string;
  include_documents?: string[];
}

export interface GenerationForm {
  gender: 'male' | 'female' | 'random';
  age_range: [number, number];
  region?: string;
  include_documents: {
    passport: boolean;
    inn: boolean;
    snils: boolean;
    driver_license: boolean;
    oms: boolean;
  };
}

export interface ApiResponse<T> {
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

export interface ProfileListItem {
  id: string;
  personal: PersonalInfo;
  created_at: string;
}

export interface ProfilesListResponse {
  profiles: ProfileListItem[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    total_pages: number;
  };
}








export interface User {
  UId: number;
  RoleId: number;
  UEmail: string;
  UStatus: string;
  UCreateDate: string;
  name?: string;
  phone?: string;
  facilityId?: number;
  customer?: {
    name?: string;
    phone?: string;
    uId?: number;
  };
  fieldOwner?: {
    name?: string;
    phone?: string;
    uId?: number;
    facilities?: unknown[];
  };
  staff?: {
    name?: string;
    phone?: string;
    uId?: number;
    facilityId?: number;
  };
  roleInfo?: {
    name?: string;
    phone?: string;
    dob?: string;
  };
}

export interface CreateUserRequest {
  Email: string;
  Password: string;
  RoleId: number;
  Name: string;
  Phone?: string;
  Status?: string;
  FacilityId?: number;
  StartTime?: string;
  EndTime?: string;
  Image?: string;
}

import { apiFetch } from "@/lib/api";
import { Address } from "@/types";

export interface AddressPayload {
  address_type: "SHIPPING" | "BILLING";
  first_name: string;
  last_name: string;
  street_address: string;
  city: string;
  state_province: string;
  postal_code: string;
  country: string;
  is_default?: boolean;
}

export const addressService = {
  getAddresses: (): Promise<Address[]> =>
    apiFetch<Address[]>("/accounts/addresses/"),

  createAddress: (data: AddressPayload): Promise<Address> =>
    apiFetch<Address>("/accounts/addresses/", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  updateAddress: (id: number, data: Partial<AddressPayload>): Promise<Address> =>
    apiFetch<Address>(`/accounts/addresses/${id}/`, {
      method: "PATCH",
      body: JSON.stringify(data),
    }),

  deleteAddress: (id: number): Promise<void> =>
    apiFetch<void>(`/accounts/addresses/${id}/`, {
      method: "DELETE",
    }),
};

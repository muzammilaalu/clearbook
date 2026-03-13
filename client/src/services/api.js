// import axios from "axios";

// const API_BASE_URL = "http://localhost:5000";

// const api = axios.create({
//   baseURL: API_BASE_URL,
//   withCredentials: true,
// });

// export const authService = {
//   login: () => {
//     window.location.href = "http://localhost:5000/auth/login";
//   },
//   checkAuth: async () => {
//     try {
//       const response = await api.get("/auth/status");
//       return response.data.authenticated;
//     } catch {
//       return false;
//     }
//   },
//   logout: async () => {
//     await api.get("/auth/logout");
//   },
// };

// export const businessService = {
//   fetchBusinesses: async () => {
//     const response = await api.get("/businesses");
//     // Backend returns { success, count, data: [...] }
//     return response.data.data ?? response.data;
//   },
// };

// export const customerService = {
//   fetchCustomers: async (businessId) => {
//     const response = await api.get("/customers", {
//       params: businessId ? { businessId } : {},
//     });
//     // Backend returns { success, count, data: [...] }
//     return response.data.data ?? response.data;
//   },

//   createCustomer: async (data) => {
//     const response = await api.post("/customers", data);
//     // Backend returns { success, message, data: {...} }
//     return response.data.data ?? response.data;
//   },
// };



import axios from "axios";

const API_BASE_URL = "https://clearbook-backend-f9e8.onrender.com"

const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
});

export const authService = {
  login: () => { window.location.href = `${API_BASE_URL}/auth/login`; },
  checkAuth: async () => {
    try {
      const response = await api.get("/auth/status");
      return response.data.authenticated;
    } catch { return false; }
  },
  logout: async () => { await api.get("/auth/logout"); },
};

export const businessService = {
  fetchBusinesses: async () => {
    const response = await api.get("/businesses");
    return response.data.data ?? response.data;
  },
};

export const customerService = {
  fetchCustomers: async (businessId) => {
    const response = await api.get("/customers", {
      params: businessId ? { businessId } : {},
    });
    return response.data.data ?? response.data;
  },

  createCustomer: async (data) => {
    const response = await api.post("/customers", data);
    return response.data.data ?? response.data;
  },

  bulkCreateCustomers: async (businessId, customers) => {
    const response = await api.post("/customers/bulk", { businessId, customers });
    return response.data;
  },

  // Saare customers export karo (for Excel download)
  exportCustomers: async (businessId) => {
    const response = await api.get("/customers/export", {
      params: businessId ? { businessId } : {},
    });
    return response.data.data ?? response.data;
  },
};

export const supplierService = {
  fetchSuppliers: async (businessId) => {
    const response = await api.get("/suppliers", {
      params: businessId ? { businessId } : {},
    });
    return response.data.data ?? response.data;
  },

  createSupplier: async (data) => {
    const response = await api.post("/suppliers", data);
    return response.data.data ?? response.data;
  },

  bulkCreateSuppliers: async (businessId, suppliers) => {
    const response = await api.post("/suppliers/bulk", { businessId, suppliers });
    return response.data;
  },

  exportSuppliers: async (businessId) => {
    const response = await api.get("/suppliers/export", {
      params: businessId ? { businessId } : {},
    });
    return response.data.data ?? response.data;
  },
};

export const stockItemService = {
  fetchStockItems: async (businessId) => {
    const response = await api.get("/stock-items", {
      params: businessId ? { businessId } : {},
    });
    return response.data.data ?? response.data;
  },

  createStockItem: async (data) => {
    const response = await api.post("/stock-items", data);
    return response.data.data ?? response.data;
  },

  bulkCreateStockItems: async (businessId, stockItems) => {
    const response = await api.post("/stock-items/bulk", { businessId, stockItems });
    return response.data;
  },

  exportStockItems: async (businessId) => {
    const response = await api.get("/stock-items/export", {
      params: businessId ? { businessId } : {},
    });
    return response.data.data ?? response.data;
  },
};

export const accountCodeService = {
  fetchAccountCodes: async (businessId) => {
    const response = await api.get("/account-codes", {
      params: businessId ? { businessId } : {},
    });
    return response.data.data ?? response.data;
  },
  fetchVatRates: async (businessId) => {
    const response = await api.get("/account-codes/vat-rates", {
      params: businessId ? { businessId } : {},
    });
    return response.data.data ?? response.data;
  },
};

export const bankAccountService = {
  fetchBankAccounts: async (businessId) => {
    const response = await api.get("/bank-accounts", {
      params: businessId ? { businessId } : {},
    });
    return response.data.data ?? response.data;
  },
};

export const journalService = {
  bulkCreateJournals: async (journals, businessId) => {
    const response = await api.post("/journals/bulk", { journals, businessId });
    return response.data;
  },
};
export const apiClient = {
  async get<T>(endpoint: string): Promise<T> {
    throw new Error(`GET ${endpoint} not implemented yet.`);
  },
};

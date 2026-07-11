export const env = {
  API_BASE_URL: (import.meta.env.VITE_API_BASE_URL as string) || "http://localhost:5001/api",
  APP_ENV: (import.meta.env.MODE as string) || "development"
};

// src/lib/api-client.ts
import axios, { AxiosError, InternalAxiosRequestConfig, AxiosResponse } from "axios";
import { signOut } from "next-auth/react";
import { useAuthStore } from "../store/authStore";

interface CustomAxiosRequestConfig extends InternalAxiosRequestConfig {
  _retry?: boolean;
}

// 🐛 DEBUG LOGGER
const debugLog = (msg: string) => {
  const time = new Date().toISOString().split('T')[1].slice(0, -1); // e.g. 14:32:01.123
  console.log(`[${time}] 🔐 AUTH_INTERCEPTOR: ${msg}`);
};

let isRefreshing = false;
let failedQueue: Array<{
  resolve: (value?: unknown) => void;
  reject: (reason?: any) => void;
}> = [];

const processQueue = (error: AxiosError | null, token: string | null = null) => {
  // debugLog(`Processing queued requests. Queue size: ${failedQueue.length}`);
  failedQueue.forEach((prom) => {
    if (error) prom.reject(error);
    else prom.resolve(token);
  });
  failedQueue = [];
};

const apiClient = axios.create({
  baseURL: new URL(process.env.NEXT_PUBLIC_API_URL!).toString(),
  timeout: 15000,
  withCredentials: true,
  headers: { "Content-Type": "application/json" },
});

apiClient.interceptors.request.use(
  (config: CustomAxiosRequestConfig) => {
    const token = useAuthStore.getState().token;
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error: AxiosError) => Promise.reject(error)
);

apiClient.interceptors.response.use(
  (response: AxiosResponse) => response.data,
  async (error: AxiosError) => {
    const originalRequest = error.config as CustomAxiosRequestConfig;
    const url = originalRequest.url;

    // Detect 401 Unauthorized
    if (error.response?.status === 401 && originalRequest && !originalRequest._retry) {
      // debugLog(`Caught 401 Unauthorized for -> ${url}`);
      
      if (isRefreshing) {
        // debugLog(`Refresh already in progress. Queuing request for -> ${url}`);
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            // debugLog(`Replaying queued request with new token -> ${url}`);
            if (originalRequest.headers) {
              originalRequest.headers.Authorization = `Bearer ${token}`;
            }
            return apiClient(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;
      // debugLog(`Starting Token Refresh API Call...`);

      try {
        const res = await axios.post(
          `${process.env.NEXT_PUBLIC_API_URL}/auth/refresh`,
          {},
          { withCredentials: true }
        );
        
        const newToken = res.data.access_token;
        // debugLog(`✅ Refresh SUCCESS! New Token: ...${newToken.slice(-10)}`);

        useAuthStore.getState().updateToken(newToken);

        if (originalRequest.headers) {
          originalRequest.headers.Authorization = `Bearer ${newToken}`;
        }
        
        processQueue(null, newToken);
        // debugLog(`Replaying original request -> ${url}`);
        return await apiClient(originalRequest);
        
      } catch (refreshError: any) {
        debugLog(`❌ Refresh FAILED: ${refreshError.message}. Logging out.`);
        processQueue(refreshError, null);
        
        useAuthStore.getState().logout();
        await signOut({ callbackUrl: '/admin/login' });
        
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
        // debugLog(`Released Mutex Lock.`);
      }
    }

    return Promise.reject(error);
  }
);

export default apiClient;
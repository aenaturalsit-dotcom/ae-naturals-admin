import axios, { AxiosError, InternalAxiosRequestConfig, AxiosResponse } from "axios";
import { getSession, signOut } from "next-auth/react";

// 1. Extend the Axios config to include our custom retry flag
interface CustomAxiosRequestConfig extends InternalAxiosRequestConfig {
  _retry?: boolean;
}

// 2. State variables for handling concurrent refresh requests
let isRefreshing = false;
let failedQueue: Array<{
  resolve: (value?: unknown) => void;
  reject: (reason?: any) => void;
}> = [];

// Helper to process all paused requests once a new token is fetched
const processQueue = (error: AxiosError | null, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

// 3. Create the Axios Instance
const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api/v1",
  timeout: 15000,
  withCredentials: true, // CRITICAL: This allows browser-to-server cookie transfer
  headers: { "Content-Type": "application/json" },
});

// 4. Request Interceptor
apiClient.interceptors.request.use(
  async (config: CustomAxiosRequestConfig) => {
    const session: any = await getSession();
    
    // Always prioritize the session token for the Authorization header
    if (session?.accessToken && config.headers) {
      config.headers.Authorization = `Bearer ${session.accessToken}`;
    }
    return config;
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  }
);

// 5. Response Interceptor
apiClient.interceptors.response.use(
  (response: AxiosResponse) => {
    // Return data directly to keep component code clean (e.g., `const data = await apiClient.get(...)`)
    return response.data;
  },
  async (error: AxiosError) => {
    const originalRequest = error.config as CustomAxiosRequestConfig;

    // Check if error is 401 and we haven't already retried this exact request
    if (error.response?.status === 401 && originalRequest && !originalRequest._retry) {
      
      if (isRefreshing) {
        // If a refresh is already happening, pause this request and add it to the queue
        return new Promise(function (resolve, reject) {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            // Once resolved, attach the new token and retry the original request
            if (originalRequest.headers) {
              originalRequest.headers.Authorization = `Bearer ${token}`;
            }
            return apiClient(originalRequest);
          })
          .catch((err) => {
            return Promise.reject(err);
          });
      }

      // Mark this request as retried so we don't loop infinitely
      originalRequest._retry = true;
      isRefreshing = true;

      try {
        // Body-less POST to refresh. Browser attaches cookie automatically
        const res = await axios.post(
          `${process.env.NEXT_PUBLIC_API_URL}/auth/refresh`,
          {},
          { withCredentials: true }
        );
        
        const newToken = res.data.access_token;

        // Set the new token on the current failed request
        if (originalRequest.headers) {
          originalRequest.headers.Authorization = `Bearer ${newToken}`;
        }
        
        // Release the queue for any other requests that were paused
        processQueue(null, newToken);
        
        // Retry the original request
        return await apiClient(originalRequest);
        
      } catch (refreshError: any) {
        // If refresh fails, the 30-day session is actually dead
        processQueue(refreshError, null);
        
        // Clear auth state and redirect to login
        await signOut({ callbackUrl: '/admin/login' });
        
        return Promise.reject(refreshError);
      } finally {
        // Reset the refreshing flag regardless of success or failure
        isRefreshing = false;
      }
    }

    // For all other errors (400, 403, 500, etc.), just return the error
    return Promise.reject(error);
  }
);

// THIS IS THE LINE TURBOPACK WAS COMPLAINING ABOUT MISSING
export default apiClient;
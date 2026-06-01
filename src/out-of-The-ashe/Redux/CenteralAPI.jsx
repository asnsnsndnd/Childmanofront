import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { BASE_URL } from '../../../SocketIoConfig';
import { logout } from './auth';

const API_URL = BASE_URL;

// 1. Create the standard base query instance
const baseQuery = fetchBaseQuery({
  baseUrl: API_URL,
  prepareHeaders: (headers) => {
    const token = localStorage.getItem('authToken');
    if (token) {
      headers.set('authorization', `Bearer ${token}`);
    }
    return headers;
  }
});

// 2. Wrap the base query to globally intercept 401 status responses
const baseQueryWithReauth = async (args, api, extraOptions) => {
  let result = await baseQuery(args, api, extraOptions);

  // If any mutation or query returns a 401 Unauthorized
  if (result.error && result.error.status === 401) {


    // Remove the stale auth token from browser storage
    localStorage.removeItem('authToken');
   api.dispatch(logout())
   
  }

  return result;
};

// 3. Define your API Slice using the interceptor wrapper
export const APi = createApi({
  reducerPath: 'api',
  baseQuery: baseQueryWithReauth, // ✅ Automatically handles 401 errors globally
  tagTypes: ['Employes'],
  endpoints: () => ({})
});
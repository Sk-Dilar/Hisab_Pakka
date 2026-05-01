import { createApi } from '@reduxjs/toolkit/query/react';
import axiosInstance from '../../api/axiosInstance';

const axiosBaseQuery =
  ({ baseUrl } = { baseUrl: '' }) =>
  async ({ url, method, data, params, headers }) => {
    try {
      const result = await axiosInstance({
        url: baseUrl + url,
        method,
        data,
        params,
        headers,
      });
      return { data: result.data };
    } catch (axiosError) {
      const err = axiosError;
      return {
        error: {
          status: err.response?.status,
          data: err.response?.data || err.message,
        },
      };
    }
  };

export const apiSlice = createApi({
  reducerPath: 'api',
  baseQuery: axiosBaseQuery(),
  tagTypes: ['User', 'Client', 'Project', 'WorkItem', 'Invoice', 'Payment'],
  endpoints: (builder) => ({
    getClients: builder.query({
      query: (params) => ({
        url: '/clients',
        method: 'GET',
        params,
      }),
      providesTags: (result) =>
        result
          ? [
              ...result.clients.map(({ _id }) => ({ type: 'Client', id: _id })),
              { type: 'Client', id: 'LIST' },
            ]
          : [{ type: 'Client', id: 'LIST' }],
    }),
    createClient: builder.mutation({
      query: (data) => ({
        url: '/clients',
        method: 'POST',
        data,
      }),
      invalidatesTags: [{ type: 'Client', id: 'LIST' }, 'Project', 'WorkItem'],
    }),
    getDashboardStats: builder.query({
      query: () => ({
        url: '/dashboard/stats',
        method: 'GET',
      }),
      providesTags: ['Client', 'Project', 'WorkItem'],
    }),
  }),
});

export const {
  useGetClientsQuery,
  useCreateClientMutation,
  useGetDashboardStatsQuery,
} = apiSlice;

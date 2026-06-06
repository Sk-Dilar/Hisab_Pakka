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
    getProjects: builder.query({
      query: (params) => ({
        url: '/projects',
        method: 'GET',
        params,
      }),
      providesTags: (result) =>
        result
          ? [
              ...result.projects.map(({ _id }) => ({ type: 'Project', id: _id })),
              { type: 'Project', id: 'LIST' },
            ]
          : [{ type: 'Project', id: 'LIST' }],
    }),
    getProject: builder.query({
      query: (id) => `/projects/${id}`,
      providesTags: (result, error, id) => [{ type: 'Project', id }],
    }),
    createProject: builder.mutation({
      query: (data) => ({
        url: '/projects',
        method: 'POST',
        data,
      }),
      invalidatesTags: [{ type: 'Project', id: 'LIST' }],
    }),
    updateProject: builder.mutation({
      query: ({ id, ...data }) => ({
        url: `/projects/${id}`,
        method: 'PUT',
        data,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: 'Project', id },
        { type: 'Project', id: 'LIST' },
      ],
    }),
    deleteProject: builder.mutation({
      query: (id) => ({
        url: `/projects/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: [{ type: 'Project', id: 'LIST' }],
    }),
    getWorkItems: builder.query({
      query: (params) => ({
        url: '/work-items',
        method: 'GET',
        params,
      }),
      providesTags: (result) =>
        result
          ? [
              ...result.workItems.map(({ _id }) => ({ type: 'WorkItem', id: _id })),
              { type: 'WorkItem', id: 'LIST' },
            ]
          : [{ type: 'WorkItem', id: 'LIST' }],
    }),
    addWorkItem: builder.mutation({
      query: (data) => ({
        url: '/work-items',
        method: 'POST',
        data,
      }),
      invalidatesTags: [
        { type: 'WorkItem', id: 'LIST' },
        { type: 'Client', id: 'LIST' }, // Balance changes
        'Project'
      ],
    }),
    updateWorkItem: builder.mutation({
      query: ({ id, ...data }) => ({
        url: `/work-items/${id}`,
        method: 'PUT',
        data,
      }),
      invalidatesTags: [
        { type: 'WorkItem', id: 'LIST' },
        { type: 'Client', id: 'LIST' }, // Balance might change
        'Project'
      ],
    }),
    deleteWorkItem: builder.mutation({
      query: (id) => ({
        url: `/work-items/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: [
        { type: 'WorkItem', id: 'LIST' },
        { type: 'Client', id: 'LIST' }, // Balance changes
      ],
    }),
    deleteClient: builder.mutation({
      query: (id) => ({
        url: `/clients/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: [{ type: 'Client', id: 'LIST' }],
    }),
    restoreClient: builder.mutation({
      query: (id) => ({
        url: `/clients/${id}/restore`,
        method: 'PUT',
      }),
      invalidatesTags: [{ type: 'Client', id: 'LIST' }],
    }),
    getInvoices: builder.query({
      query: (params) => ({
        url: '/invoices',
        method: 'GET',
        params,
      }),
      providesTags: (result) =>
        result
          ? [
              ...result.invoices.map(({ _id }) => ({ type: 'Invoice', id: _id })),
              { type: 'Invoice', id: 'LIST' },
            ]
          : [{ type: 'Invoice', id: 'LIST' }],
    }),
    getInvoice: builder.query({
      query: (id) => `/invoices/${id}`,
      providesTags: (result, error, id) => [{ type: 'Invoice', id }],
    }),
    generateInvoice: builder.mutation({
      query: (data) => ({
        url: '/invoices/generate',
        method: 'POST',
        data,
      }),
      invalidatesTags: [
        { type: 'Invoice', id: 'LIST' },
        { type: 'WorkItem', id: 'LIST' }, // Work items get marked as billed
        { type: 'Client', id: 'LIST' } // Client balance doesn't change on generation, but good practice
      ],
    }),
    updateDiscount: builder.mutation({
      query: ({ id, discount }) => ({
        url: `/invoices/${id}/discount`,
        method: 'PUT',
        data: { discount },
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: 'Invoice', id },
        { type: 'Invoice', id: 'LIST' },
        { type: 'Client', id: 'LIST' } // Client balance changes when discount is edited
      ],
    }),
  }),
});

export const {
  useGetClientsQuery,
  useCreateClientMutation,
  useGetDashboardStatsQuery,
  useGetProjectsQuery,
  useGetProjectQuery,
  useCreateProjectMutation,
  useUpdateProjectMutation,
  useDeleteProjectMutation,
  useGetWorkItemsQuery,
  useAddWorkItemMutation,
  useUpdateWorkItemMutation,
  useDeleteWorkItemMutation,
  useDeleteClientMutation,
  useRestoreClientMutation,
  useGetInvoicesQuery,
  useGetInvoiceQuery,
  useGenerateInvoiceMutation,
  useUpdateDiscountMutation,
} = apiSlice;

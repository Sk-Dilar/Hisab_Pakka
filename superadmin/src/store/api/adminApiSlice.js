import { apiSlice } from './apiSlice';

export const adminApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    login: builder.mutation({
      query: (credentials) => ({
        url: '/superadmin/login',
        method: 'POST',
        data: credentials,
      }),
    }),
    getUsers: builder.query({
      query: () => ({ url: '/superadmin/users', method: 'GET' }),
      providesTags: ['User'],
    }),
    generateResetLink: builder.mutation({
      query: (userId) => ({
        url: `/superadmin/users/${userId}/generate-reset-link`,
        method: 'POST',
      }),
      invalidatesTags: ['User'],
    }),
  }),
});

export const {
  useLoginMutation,
  useGetUsersQuery,
  useGenerateResetLinkMutation,
} = adminApiSlice;

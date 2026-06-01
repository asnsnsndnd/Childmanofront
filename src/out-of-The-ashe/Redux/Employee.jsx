import { APi } from "./CenteralAPI";

const Employee = APi.injectEndpoints({
  endpoints: (builder) => ({
    getEmployees: builder.query({
      query: () => '/Employees',
      providesTags: (result) =>
        result
          ? [
              { type: 'Employees', _id: 'List' },
              ...result.map(({ _id }) => ({ type: 'Employees', _id })),
            ]
          : [{ type: 'Employees', _id: 'List' }]
    }),

    createEmployee: builder.mutation({
      query: (Emp) => ({
        url: "/Employees/Create",
        method: 'POST',
        body: Emp
      }),
      invalidatesTags: [{ type: 'Employees', _id: 'List' }]
    }),

    deleteEmployee: builder.mutation({
      query: (id) => ({
        url: `/Employees/employees?id=${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: [{ type: 'Employees', _id: 'List' }],
    }),

    getEmployeeById: builder.query({
      query: (id) => `/Employees/getById?id=${id}`
    }),

    // ✅ Added Password Reset Mutation
    resetEmployeePassword: builder.mutation({
      query: ({ id, password }) => ({
        url: `/Employees/resetPassword?id=${id}`,
        method: 'PUT',
        body: { password }
      }),
      // Password resets do not change list items, so no tag invalidation is needed here.
    }),
    getPermissions: builder.query({
  query: (id) => `/Employees/Permissions/${id}`,
  providesTags: (r, e, id) => [{ type: "Permissions", id }],
}),
  getPermissionsOwn: builder.query({
  query: () => `/Employees/Permissions/own`,
  providesTags: (r, e, id) => [{ type: "Permissions", id }],
}),
// PATCH update permissions
updatePermissions: builder.mutation({
  query: ({ id, ...body }) => ({
    url: `/Employees/Permissions/${id}`,
    method: "PATCH",
    body,
  }),
  invalidatesTags: (r, e, { id }) => [{ type: "Permissions", id }],
}),
  }),
  // GET permissions for one employee


  overrideExisting: false,
});

export const {
  useGetEmployeesQuery,
  useCreateEmployeeMutation,
  useGetEmployeeByIdQuery,
  useDeleteEmployeeMutation,
  useResetEmployeePasswordMutation,
  useGetPermissionsQuery,
  useUpdatePermissionsMutation,
  useGetPermissionsOwnQuery

} = Employee;
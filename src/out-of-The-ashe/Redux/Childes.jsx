import { APi } from "./CenteralAPI";

export const Child = APi.injectEndpoints({
  endpoints: (builder) => ({

    getChilds: builder.query({
      query: () => '/Child',
      providesTags: [{ type: 'Child', id: 'List' }],
    }),

    getChildbyName: builder.query({
      query: (Searchvalue) => `/Child/SearchByName?search=${Searchvalue}`,
      providesTags: [{ type: 'ChildSearch', id: 'searchresult' }],
    }),

    getChildByID: builder.query({
      query: (searchId) => `/Child/SearchById?searchId=${searchId}`,
      providesTags: [{ type: 'ChildSearchById', id: 'searchResult' }],
    }),

    updateChild: builder.mutation({
      query: (update) => ({
        url: '/Child/Update',
        method: 'PUT',
        body: update,
      }),
      invalidatesTags: [{ type: 'ChildSearchById', id: 'searchResult' }],
    }),

    createChild: builder.mutation({
      query: (childData) => ({
        url: '/Child/Create',
        method: 'POST',
        body: childData,
      }),
      invalidatesTags: [{ type: 'Child', id: 'List' }],
    }),

    createChildOtherFile: builder.mutation({
      query: (OtherFile) => ({
        url: '/Child/OtherFileCreate',
        method: 'POST',
        body: OtherFile,
      }),
      invalidatesTags: [{ type: 'ChildSearchById', id: 'searchResult' }],
    }),

    // ── existing: delete child / parent profile file ─────────────
    deleteFile: builder.mutation({
      query: ({ public_id, id, selectionType }) => ({
        url: '/Child/delete-file',
        method: 'DELETE',
        body: { public_id, id, selectionType },
      }),
      invalidatesTags: [{ type: 'ChildSearchById', id: 'searchResult' }],
    }),

    UploadProfile: builder.mutation({
      query: (file) => ({
        url: '/Child/UploadProfile',
        method: 'POST',
        body: file,
      }),
      invalidatesTags: [{ type: 'ChildSearchById', id: 'searchResult' }],
    }),

    getAllChild: builder.query({
      query: () => '/Child/ALLChild',
      providesTags: [{ type: 'ALLChild', id: 'List' }],
    }),

    // ════════════════════════════════════════════════════════════
    //  NEW 1 — Edit other-record title & description
    // ════════════════════════════════════════════════════════════
    editOtherRecord: builder.mutation({
      query: ({ childId, recordId, title, description }) => ({
        url: '/Child/OtherRecord/Update',
        method: 'PUT',
        body: { childId, recordId, title, description },
      }),
      invalidatesTags: [{ type: 'ChildSearchById', id: 'searchResult' }],
    }),

    // ════════════════════════════════════════════════════════════
    //  NEW 2 — Delete entire other-record (document + all files)
    // ════════════════════════════════════════════════════════════
    deleteOtherRecord: builder.mutation({
      query: ({ childId, recordId }) => ({
        url: '/Child/OtherRecord/Delete',
        method: 'DELETE',
        body: { childId, recordId },
      }),
      invalidatesTags: [{ type: 'ChildSearchById', id: 'searchResult' }],
    }),

    // ════════════════════════════════════════════════════════════
    //  NEW 3 — Delete a single file inside an other-record
    // ════════════════════════════════════════════════════════════
    deleteOtherRecordFile: builder.mutation({
      query: ({ public_id, recordId }) => ({
        url: '/Child/OtherRecord/DeleteFile',
        method: 'DELETE',
        body: { public_id, recordId },
      }),
      invalidatesTags: [{ type: 'ChildSearchById', id: 'searchResult' }],
    }),

    // ════════════════════════════════════════════════════════════
    //  NEW 4 — Upload files into an existing other-record
    //          Send FormData: append each file + recordId + childId
    // ════════════════════════════════════════════════════════════
    uploadOtherRecordFiles: builder.mutation({
      query: (formData) => ({
        url: '/Child/OtherRecord/UploadFiles',
        method: 'POST',
        body: formData,          // FormData — RTK Query skips JSON serialization automatically
      }),
      invalidatesTags: [{ type: 'ChildSearchById', id: 'searchResult' }],
    }),
     deleteChild: builder.mutation({
      query: ({ id }) => ({
        url: '/Child/Delete',
        method: 'DELETE',
        body: { id },
      }),
      // invalidate both list queries so tables refresh automatically
      invalidatesTags: [
        { type: 'Child',    id: 'List' },
        { type: 'ALLChild', id: 'List' },
      ],
    }),

  }),
});

export const {
  useCreateChildMutation,
  useCreateChildOtherFileMutation,
  useUpdateChildMutation,
  useGetChildsQuery,
  useGetChildbyNameQuery,
  useGetChildByIDQuery,
  useDeleteFileMutation,
  useUploadProfileMutation,
  useGetAllChildQuery,
  // ── 4 new ──
  useEditOtherRecordMutation,
  useDeleteOtherRecordMutation,
  useDeleteOtherRecordFileMutation,
  useUploadOtherRecordFilesMutation,
    useDeleteChildMutation
} = Child;
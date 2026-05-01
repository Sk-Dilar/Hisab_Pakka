# Hisab Pakka Coding Style Rules

Based on the patterns established in modern React applications (inspired by the `nation-care` project), the following coding rules and best practices should be adhered to in the `Hisab Pakka` codebase:

## 1. Architecture & Modularity
- **Functional Components:** Always use functional components and modern React hooks (`useState`, `useEffect`, `useMemo`, `useCallback`).
- **File Structure:** Break down complex pages into smaller, manageable components (e.g., `StaffViewDrawer.jsx`, `CreateClientModal.jsx`). Keep the main `index.jsx` or page file focused on orchestration.
- **Custom Hooks:** Abstract complex data fetching or business logic into custom hooks where applicable.

## 2. State Management & Data Fetching
- **RTK Query:** Leverage RTK Query for all API interactions (fetching, caching, mutations). Do not manually manage loading states for API calls when RTK Query already provides `isLoading`, `isFetching`, etc.
- **Server-Side Operations:** Implement search, filtering, and pagination on the server-side to handle large datasets efficiently.

## 3. UI and Layouts (Material UI)
- **Component Usage:** Utilize Material UI's core components (`Box`, `Grid`, `Paper`, `Typography`) for consistent layouts.
- **Feedback & Tooltips:** Always wrap action icons (like Edit, Delete, View) in a `Tooltip` to clarify their purpose. Use Snackbars/Alerts to notify the user of successful or failed operations.
- **Status Indicators:** Use colored `Chip` components or badges to represent different entity statuses visually (e.g., Green for Active, Red/Grey for Inactive).

## 4. Search & Filtering
- **Debouncing:** Always debounce search inputs (typically a 500ms delay) to prevent excessive API calls while the user is typing.
- **Filter Retention:** When a user changes a filter (like 'Status' or 'Role') or types a search query, reset the current page to `0` or `1` to avoid showing empty states on later pages.

## 5. Form Validation & UX
- **Real-time Validation:** Validate user input as they type (e.g., ensuring phone numbers strictly follow the `/^[6-9]\d{9}$/` format).
- **Required Fields:** Clearly indicate required fields (using the `*` marker or `required` prop) and disable submission buttons until the form is entirely valid.
- **Error Handling:** Display specific, user-friendly error messages returned from the backend directly in the form UI or via a notification.

## 6. Data Integrity (Soft Deletion)
- **Status Toggling:** Prefer soft-deletion (changing a `status` field to `inactive` or `exited`) over permanent database deletion.
- **Contextual Actions:** Render actions conditionally based on status. For example, if an entity is `inactive`, show a "Restore" button instead of a "Delete" button.

By following these guidelines consistently, the codebase will remain scalable, readable, and highly maintainable for future development.

# Modern Frontend Architecture Plan

## 1. Concise Audit of Incomplete Aspects
- **Public Frontend:** Mostly complete but relies on `externalSupabase` which appears to be read-only or a mocked instance. Some views like Articles and Paths may lack pagination logic or fully reactive states when data changes locally.
- **Admin Dashboard:** Currently composed of static UI stubs (`ManageTools`, `ManageArticles`, etc.) filled with hardcoded mock arrays. No interactive CRUD flows exist.
- **Data Engine:** Missing completely. Data fetching is directly coupled with Supabase in React Query hooks (`use-tools.ts`). Changes made in the UI cannot persist.

## 2. Implementation Sequence
**Phase 3: Frontend Data Engine (First Priority for Interactivity)**
1. Create `src/lib/data/seed.ts`: Define structured JSON mock arrays for Tools, Articles, Content, and Paths.
2. Create `src/lib/data/repository.ts`: Build generic LocalStorage-based CRUD repositories (`getAll`, `getById`, `create`, `update`, `delete`).

**Phase 4: Connect Repositories to Public Hooks**
3. Refactor `src/hooks/use-tools.ts`, `use-articles.ts`, `use-content.ts`, `use-learning-paths.ts` to fetch from `repository.ts` instead of `externalSupabase`. This natively updates the public pages.

**Phase 2: Build Real Frontend-Only Admin CMS**
4. Upgrade `AdminDashboard.tsx` to read stats dynamically.
5. Upgrade `ManageTools.tsx` to use `ToolsRepo` for listing, creating, and deleting tools. Include a modal or simple form for creation.
6. Upgrade `ManageArticles.tsx` and `ManagePaths.tsx` with similar CRUD functionality.

**Phase 6: Supabase-Ready Preparation**
7. The `repository.ts` will implement a generic interface `IDataRepository`. A `SupabaseRepository` can be easily swapped in later by the backend team by changing the instantiated class.

## 3. Files and Modules to Create/Refactor
- **Create**: `src/lib/data/seed.ts` (Mock Data Seed)
- **Create**: `src/lib/data/repository.ts` (The LocalStorage engine abstraction)
- **Refactor**: All files in `src/hooks/` to use the `Repository` pattern.
- **Refactor**: All files in `src/pages/admin/` to use `useMutation` or direct repository updates, coupled with toast notifications.

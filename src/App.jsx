/**
 * Re-exports narrative archive data and the archive UI (smart alias search, TreeNode, DNA markers).
 * Tree shape, optional `story` (historical modal), `isDNAVerified` / Shoah flags live in `familyArchiveData.ts`; rendering in `familyArchive.tsx`.
 * Default export is the router `App` from App.tsx so `import App from './App'` keeps working.
 */
export { familyData } from './familyArchiveData';
export {
  SMART_ALIAS_SEARCH,
  STORY_SOURCE_FOOTER,
  STORY_SOURCE_SECONDARY,
  filterTree,
  FamilyArchiveApp,
} from './familyArchive.tsx';
export { default } from './App.tsx';

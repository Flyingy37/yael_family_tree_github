export type UiLang = 'he' | 'en';

export type BranchKey = 'ginzburg' | 'charny' | 'charny_meirson' | 'sokolov' | 'hudenko' | 'liandres' | 'research';

export type RelationType = 'blood' | 'marriage' | 'adopted' | 'step' | 'possible_blood';

export type TreeNode = {
  id: string;
  name: string;
  branch: BranchKey;
  relationType: RelationType;
  children?: TreeNode[];
};

export type ExternalBranch = {
  id: string;
  name: string;
  branch: BranchKey;
  relationType: 'possible_blood';
  note?: string;
};

export type BloodlineTreeData = {
  root: TreeNode;
  externalResearchBranches?: ExternalBranch[];
};

import type { BranchKey } from '../types/familyTree';

export const branchTheme: Record<BranchKey, { bg: string; border: string; text: string; dot: string }> = {
  ginzburg: {
    bg: '#dce7ef',
    border: '#abc0d0',
    text: '#445d6c',
    dot: '#7fa6be',
  },
  duberstein: {
    bg: '#e6e0f1',
    border: '#c4b7dd',
    text: '#5f5678',
    dot: '#a996cd',
  },
  charny: {
    bg: '#f1dfdb',
    border: '#d8b8af',
    text: '#7a5850',
    dot: '#c9988e',
  },
  charny_meirson: {
    bg: '#f1dfdb',
    border: '#d8b8af',
    text: '#7a5850',
    dot: '#c9988e',
  },
  sokolov: {
    bg: '#eee4c8',
    border: '#d8c794',
    text: '#746544',
    dot: '#cdbb7e',
  },
  hudenko: {
    bg: '#e6e0f1',
    border: '#c4b7dd',
    text: '#5f5678',
    dot: '#a996cd',
  },
  liandres: {
    bg: '#e5ead8',
    border: '#c7d0b1',
    text: '#5d6b47',
    dot: '#9bae76',
  },
  research: {
    bg: '#eef0f2',
    border: '#cfd5db',
    text: '#5f6871',
    dot: '#98a3ae',
  },
};

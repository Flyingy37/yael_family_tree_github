import type { BloodlineTreeData } from '../types/familyTree';

export const ginzburgBloodlineTree: BloodlineTreeData = {
  root: {
    id: '@I87@',
    name: 'Basia Liandres',
    branch: 'liandres',
    relationType: 'blood',
    children: [
      {
        id: '@I37@',
        name: 'Sofia Ginzburg Duberstein',
        branch: 'duberstein',
        relationType: 'blood',
        children: [
          {
            id: '@I58@',
            name: 'Reuven Vladimirovich Duberstein',
            branch: 'duberstein',
            relationType: 'blood',
          },
          {
            id: '@I59@',
            name: 'Michael Vladimirovich Duberstein',
            branch: 'duberstein',
            relationType: 'blood',
          },
          {
            id: '@I61@',
            name: 'Ema Duberstein Meirson',
            branch: 'duberstein',
            relationType: 'blood',
          },
          {
            id: '@I12@',
            name: 'Tzila Cilia Sara Duberstein Alperovitz',
            branch: 'duberstein',
            relationType: 'blood',
            children: [
              {
                id: '@I5@',
                name: 'Pola Livnat',
                branch: 'liandres',
                relationType: 'blood',
                children: [
                  {
                    id: '@I1@',
                    name: 'Yael Livnat-Zaidman',
                    branch: 'liandres',
                    relationType: 'blood',
                  },
                ],
              },
            ],
          },
          {
            id: '@I60@',
            name: 'Valia Valentina Ginzburg Axelrod',
            branch: 'ginzburg',
            relationType: 'blood',
          },
        ],
      },
      {
        id: '@I132@',
        name: 'Gershon (Grigory) Ginzburg',
        branch: 'ginzburg',
        relationType: 'blood',
      },
      {
        id: '@I131@',
        name: 'Aharon Ginzburg',
        branch: 'ginzburg',
        relationType: 'blood',
      },
      {
        id: '@I133@',
        name: 'Yankel Berl Ginzburg',
        branch: 'ginzburg',
        relationType: 'blood',
      },
      {
        id: '@I134@',
        name: 'Isaak Ginzburg',
        branch: 'ginzburg',
        relationType: 'blood',
      },
    ],
  },
  externalResearchBranches: [
    {
      id: 'isaac-lyandres',
      name: 'Isaac Lyandres',
      branch: 'research',
      relationType: 'possible_blood',
      note: 'Possible research connection; not yet linked directly to the main bloodline.',
    },
    {
      id: 'heilprin-spira-hillman-roots',
      name: 'Heilprin / Spira / Hillman roots',
      branch: 'research',
      relationType: 'possible_blood',
      note:
        'Older rabbinic shared context drawn from the paternal DNA summary and the separate Spira / Hillman source trees; keep it separate from the main bloodline tree.',
    },
  ],
};

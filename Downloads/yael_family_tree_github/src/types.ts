export interface Person {
  id: string;
  fullName: string;
  givenName: string;
  surname: string;
  surnameFinal: string;
  sex: 'M' | 'F' | 'U';
  birthDate: string | null;
  deathDate: string | null;
  birthPlace: string | null;
  generation: number | null;
  relationToYael: string | null;
  hops: number | null;
  dnaInfo: string | null;
  coordinates: [number, number] | null;
  familiesAsSpouse: string[];
  familyAsChild: string | null;
  title: string | null;
  // Hebrew fields from curated CSV
  hebrewName: string | null;
  birthName: string | null;
  fatherName: string | null;
  motherName: string | null;
  spouseName: string | null;
  childrenNames: string | null;
}

export interface Family {
  id: string;
  spouses: string[];
  children: string[];
}

export interface FamilyGraph {
  persons: Person[];
  families: Family[];
  rootPersonId: string;
}

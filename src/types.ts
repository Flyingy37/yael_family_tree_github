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
  /** English birthplace when curated data provides a dual-language version */
  birthPlaceEn?: string | null;
  generation: number | null;
  relationToYael: string | null;
  /** English relation description when curated data provides a dual-language version */
  relationToYaelEn?: string | null;
  hops: number | null;
  dnaInfo: string | null;
  coordinates: [number, number] | null;
  familiesAsSpouse: string[];
  familyAsChild: string | null;
  title: string | null;
  /** English title when curated data provides a dual-language version */
  titleEn?: string | null;
  /** Research notes (may contain HTML); prefer `note_plain` for display when set */
  note?: string | null;
  /** Plain-text notes from GEDCOM / CSV */
  note_plain?: string | null;
  /** Profile or portrait image URL when available */
  photoUrl?: string | null;
  // Hebrew fields from curated CSV
  hebrewName: string | null;
  birthName: string | null;
  fatherName: string | null;
  motherName: string | null;
  spouseName: string | null;
  childrenNames: string | null;
  surnameOrigin: string | null;
  jewishLineage: string | null;
  migrationInfo: string | null;
  /** English migration info when curated data provides a dual-language version */
  migrationInfoEn?: string | null;
  holocaustVictim: boolean;
  warCasualty: boolean;
  connectionPathCount: number | null;
  doubleBloodTie: boolean;
  // Runtime-only normalized text for accent-insensitive search.
  searchNormalized?: string;
  tags: string[];
  /** Historical narrative / family story (shown in story modal) */
  story?: string | null;
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

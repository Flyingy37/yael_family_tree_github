import { useState, useEffect, useRef, type KeyboardEvent } from 'react';
import type Fuse from 'fuse.js';
import { X } from 'lucide-react';
import type { Person } from '../types';
import { displayFullNameForUi, gedcomDateDisplay } from '../utils/personUiText';

const PATH_PICKER_HITS = 8;

export interface PathPairPickersProps {
  searchIndex: Fuse<Person>;
  persons: Map<string, Person>;
  language: 'en' | 'he';
  pathPersonA: string | null;
  pathPickBId: string | null;
  onSelectA: (id: string) => void;
  onSelectB: (id: string) => void;
  onClearA: () => void;
  onClearB: () => void;
  onFindPath: () => void;
}

/** Fuzzy search over the full person list (not limited to visible tree nodes). */
export function PathPairPickers({
  searchIndex,
  persons,
  language,
  pathPersonA,
  pathPickBId,
  onSelectA,
  onSelectB,
  onClearA,
  onClearB,
  onFindPath,
}: PathPairPickersProps) {
  const t = language === 'he';
  const uiLang = t ? 'he' : 'en';
  const wrapRef = useRef<HTMLDivElement>(null);
  const [qA, setQA] = useState('');
  const [qB, setQB] = useState('');
  const [hitsA, setHitsA] = useState<Person[]>([]);
  const [hitsB, setHitsB] = useState<Person[]>([]);
  const [openA, setOpenA] = useState(false);
  const [openB, setOpenB] = useState(false);

  useEffect(() => {
    function onDoc(e: MouseEvent) {
      if (!wrapRef.current?.contains(e.target as Node)) {
        setOpenA(false);
        setOpenB(false);
      }
    }
    document.addEventListener('mousedown', onDoc);
    return () => document.removeEventListener('mousedown', onDoc);
  }, []);

  useEffect(() => {
    if (qA.length < 2) {
      setHitsA([]);
      return;
    }
    setHitsA(
      searchIndex
        .search(qA, { limit: 50 })
        .map(h => h.item)
        .slice(0, PATH_PICKER_HITS)
    );
  }, [qA, searchIndex]);

  useEffect(() => {
    if (qB.length < 2) {
      setHitsB([]);
      return;
    }
    setHitsB(
      searchIndex
        .search(qB, { limit: 50 })
        .map(h => h.item)
        .slice(0, PATH_PICKER_HITS)
    );
  }, [qB, searchIndex]);

  const canFind = Boolean(pathPersonA && pathPickBId);

  function rowKeyDown(e: KeyboardEvent<HTMLInputElement>, which: 'a' | 'b') {
    if (e.key === 'Escape') {
      e.preventDefault();
      if (which === 'a') setOpenA(false);
      else setOpenB(false);
    }
  }

  return (
    <div
      ref={wrapRef}
      className="w-full space-y-2 rounded-lg border border-sky-200 bg-white/98 p-2 shadow-sm backdrop-blur-sm"
      dir={t ? 'rtl' : 'ltr'}
    >
      <div className="text-[10px] font-semibold text-sky-900">
        {t ? 'בחירה מכל האנשים בקובץ' : 'Pick any two people (full database)'}
      </div>

      <div className="relative">
        <label className="mb-0.5 block text-[9px] font-medium text-slate-600">
          {t ? 'אדם ראשון' : 'Person A'}
        </label>
        {pathPersonA && persons.has(pathPersonA) ? (
          <div className="flex items-center gap-1 rounded border border-slate-200 bg-slate-50 px-2 py-1 text-[10px]">
            <span className="min-w-0 flex-1 truncate font-medium text-slate-800">
              {displayFullNameForUi(persons.get(pathPersonA)!, uiLang)}
              {gedcomDateDisplay(persons.get(pathPersonA)!.birthDate) ? (
                <span className="ms-1 font-normal text-slate-500">
                  {gedcomDateDisplay(persons.get(pathPersonA)!.birthDate)}
                </span>
              ) : null}
            </span>
            <button
              type="button"
              className="shrink-0 rounded p-0.5 text-slate-400 hover:bg-slate-200 hover:text-slate-700"
              aria-label={t ? 'נקה' : 'Clear'}
              onClick={onClearA}
            >
              <X size={12} />
            </button>
          </div>
        ) : (
          <>
            <input
              value={qA}
              onChange={e => {
                setQA(e.target.value);
                setOpenA(true);
              }}
              onFocus={() => setOpenA(true)}
              onKeyDown={e => rowKeyDown(e, 'a')}
              className="w-full rounded border border-slate-200 px-2 py-1.5 text-[10px] outline-none focus:border-sky-400"
              placeholder={t ? 'הקלד שם (לפחות 2 תווים)...' : 'Type name (2+ chars)...'}
            />
            {openA && hitsA.length > 0 && (
              <ul className="absolute z-[60] mt-0.5 max-h-32 w-full overflow-auto rounded border border-slate-200 bg-white shadow-md">
                {hitsA.map(p => (
                  <li key={p.id}>
                    <button
                      type="button"
                      className="w-full px-2 py-1.5 text-start text-[10px] hover:bg-sky-50"
                      onClick={() => {
                        onSelectA(p.id);
                        setQA('');
                        setOpenA(false);
                      }}
                    >
                      {displayFullNameForUi(p, uiLang)}
                      {gedcomDateDisplay(p.birthDate) ? (
                        <span className="text-slate-400"> · {gedcomDateDisplay(p.birthDate)}</span>
                      ) : null}
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </>
        )}
      </div>

      <div className="relative">
        <label className="mb-0.5 block text-[9px] font-medium text-slate-600">
          {t ? 'אדם שני' : 'Person B'}
        </label>
        {pathPickBId && persons.has(pathPickBId) ? (
          <div className="flex items-center gap-1 rounded border border-slate-200 bg-slate-50 px-2 py-1 text-[10px]">
            <span className="min-w-0 flex-1 truncate font-medium text-slate-800">
              {displayFullNameForUi(persons.get(pathPickBId)!, uiLang)}
              {gedcomDateDisplay(persons.get(pathPickBId)!.birthDate) ? (
                <span className="ms-1 font-normal text-slate-500">
                  {gedcomDateDisplay(persons.get(pathPickBId)!.birthDate)}
                </span>
              ) : null}
            </span>
            <button
              type="button"
              className="shrink-0 rounded p-0.5 text-slate-400 hover:bg-slate-200 hover:text-slate-700"
              aria-label={t ? 'נקה' : 'Clear'}
              onClick={onClearB}
            >
              <X size={12} />
            </button>
          </div>
        ) : (
          <>
            <input
              value={qB}
              onChange={e => {
                setQB(e.target.value);
                setOpenB(true);
              }}
              onFocus={() => setOpenB(true)}
              onKeyDown={e => rowKeyDown(e, 'b')}
              className="w-full rounded border border-slate-200 px-2 py-1.5 text-[10px] outline-none focus:border-sky-400"
              placeholder={t ? 'הקלד שם (לפחות 2 תווים)...' : 'Type name (2+ chars)...'}
            />
            {openB && hitsB.length > 0 && (
              <ul className="absolute z-[60] mt-0.5 max-h-32 w-full overflow-auto rounded border border-slate-200 bg-white shadow-md">
                {hitsB.map(p => (
                  <li key={p.id}>
                    <button
                      type="button"
                      className="w-full px-2 py-1.5 text-start text-[10px] hover:bg-sky-50"
                      onClick={() => {
                        onSelectB(p.id);
                        setQB('');
                        setOpenB(false);
                      }}
                    >
                      {displayFullNameForUi(p, uiLang)}
                      {gedcomDateDisplay(p.birthDate) ? (
                        <span className="text-slate-400"> · {gedcomDateDisplay(p.birthDate)}</span>
                      ) : null}
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </>
        )}
      </div>

      <button
        type="button"
        disabled={!canFind}
        onClick={onFindPath}
        className="w-full rounded-md bg-sky-600 py-1.5 text-[10px] font-semibold text-white shadow-sm disabled:cursor-not-allowed disabled:opacity-40"
      >
        {t ? 'חשב נתיב' : 'Find path'}
      </button>
      <p className="text-[9px] leading-snug text-slate-500">
        {t
          ? 'אפשר גם ללחוץ על שני צמתים בעץ. אנשים שלא מוצגים (מסוננים או מוסתרים) עדיין ניתנים לחיפוש כאן.'
          : 'You can still click two nodes on the tree. Hidden or filtered people stay searchable here.'}
      </p>
    </div>
  );
}

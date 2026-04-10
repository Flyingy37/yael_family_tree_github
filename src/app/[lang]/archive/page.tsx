/**
 * /[lang]/archive — narrative family archive (searchable tree + story modals).
 */
import { FamilyArchiveApp } from '../../../familyArchive';
import { useLang } from '../layout';

export default function ArchivePage() {
  const { lang } = useLang();
  return (
    <div className="h-full overflow-auto bg-gradient-to-b from-stone-100/90 to-gray-50 px-4 pb-10 sm:px-6">
      <div className="mx-auto w-full max-w-3xl">
        <FamilyArchiveApp lang={lang} />
      </div>
    </div>
  );
}

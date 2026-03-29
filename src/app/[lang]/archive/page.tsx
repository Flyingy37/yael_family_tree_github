/**
 * /[lang]/archive — narrative family archive (searchable tree + story modals).
 */
import { FamilyArchiveApp } from '../../../familyArchive';
import { useLang } from '../layout';

export default function ArchivePage() {
  const { lang } = useLang();
  return (
    <div className="h-full overflow-auto bg-gray-50 px-4 pb-8">
      <div className="max-w-4xl mx-auto w-full">
        <FamilyArchiveApp lang={lang} />
      </div>
    </div>
  );
}

/**
 * /[lang]/archive — narrative family archive (searchable tree + story modals).
 */
import { FamilyArchiveApp } from '../../../familyArchive';
import { useLang } from '../layout';

export default function ArchivePage() {
  const { lang } = useLang();
  return (
    <div className="h-full overflow-auto bg-gray-50 px-4 pb-8">
      <FamilyArchiveApp lang={lang} />
    </div>
  );
}

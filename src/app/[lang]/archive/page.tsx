/**
 * /[lang]/archive — narrative family archive (searchable tree + story modals)
 * and descendant report browser.
 */
import { useState } from 'react';
import { FamilyArchiveApp } from '../../../familyArchive';
import { ReportBrowser } from '../../../components/ReportBrowser';
import { useLang } from '../layout';

type TabId = 'cards' | 'report';

const TAB_LABELS = {
  he: {
    cards: '📇 כרטיסים',
    report: '📋 ירידת דורות',
  },
  en: {
    cards: '📇 Cards',
    report: '📋 Report',
  },
} as const;

export default function ArchivePage() {
  const { lang } = useLang();
  const [activeTab, setActiveTab] = useState<TabId>('cards');
  const labels = TAB_LABELS[lang];

  return (
    <div className="h-full flex flex-col overflow-hidden bg-gray-50">
      {/* Tab bar */}
      <div className="flex gap-1 px-4 pt-3 border-b border-stone-200 bg-white shrink-0">
        {(['cards', 'report'] as TabId[]).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 text-sm font-medium rounded-t-md border-b-2 transition-colors focus:outline-none ${
              activeTab === tab
                ? 'border-amber-600 text-amber-800 bg-amber-50'
                : 'border-transparent text-stone-500 hover:text-stone-700 hover:bg-stone-50'
            }`}
          >
            {labels[tab]}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div className="flex-1 min-h-0 overflow-auto">
        {activeTab === 'cards' && (
          <div className="h-full overflow-auto px-4 pb-8">
            <FamilyArchiveApp lang={lang} />
          </div>
        )}
        {activeTab === 'report' && (
          <div className="h-full overflow-hidden flex flex-col">
            <ReportBrowser lang={lang} />
          </div>
        )}
      </div>
    </div>
  );
}

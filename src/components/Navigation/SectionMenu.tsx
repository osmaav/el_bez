/**
 * SectionMenu - Меню выбора разделов
 *
 * @description Выпадающее меню с группами разделов
 * @author el-bez Team
 * @version 2.0.0 (с RichTooltip)
 */

import type { SectionType } from '@/types';
import { User, Factory, Gauge } from 'lucide-react';
import { SECTIONS } from '@/constants/sections';
import { RichTooltip } from '@/components/ui/rich-tooltip';

interface SectionInfoWithActive {
  id: SectionType;
  name: string;
  description: string;
  totalQuestions: number;
  totalTickets: number;
  isActive: boolean;
}

interface SectionGroup {
  title: string;
  icon: React.ElementType;
  sections: SectionInfoWithActive[];
}

const createExtendedSections = (sections: typeof SECTIONS): SectionInfoWithActive[] => {
  return sections.map(section => ({
    ...section,
    isActive: section.totalQuestions > 0
  }));
};

const INDUSTRIAL_SECTIONS = createExtendedSections(
  SECTIONS.filter(s => ['1254-19', '1255-19', '1256-19', '1257-20', '1258-20', '1259-21', '1547-6', '1260-23'].includes(s.id))
);

const NON_INDUSTRIAL_SECTIONS = createExtendedSections(
  SECTIONS.filter(s => ['1494-2', '1495-2', '1496-2', '1497-6', '1498-6', '1499-6', '1500-6', '1501-2'].includes(s.id))
);

const LABORATORY_SECTIONS = createExtendedSections(
  SECTIONS.filter(s => ['1364-9', '1365-11', '1366-15'].includes(s.id))
);

const SECTION_GROUPS: SectionGroup[] = [
  {
    title: 'Непромышленные',
    icon: User,
    sections: NON_INDUSTRIAL_SECTIONS,
  },
  {
    title: 'Промышленные',
    icon: Factory,
    sections: INDUSTRIAL_SECTIONS,
  },
  {
    title: 'ЭЛ.ТЕХ. ЛАБОРАТОРИИ',
    icon: Gauge,
    sections: LABORATORY_SECTIONS,
  },
];

interface SectionMenuProps {
  currentSection: SectionType;
  onSectionChange: (sectionId: SectionType) => void;
  onClose: () => void;
}

export function SectionMenu({ currentSection, onSectionChange, onClose }: SectionMenuProps) {
  const handleSectionChange = (sectionId: SectionType) => {
    onSectionChange(sectionId);
    onClose();
  };

  const getShortSectionName = (sectionId: SectionType) => {
    const group = sectionId.split('-')[0];
    return `ЭБ ${group}`;
  };

  return (
    <>
      <button
        onClick={() => {}}
        className="flex items-center space-x-1 px-2 sm:px-3 py-1.5 sm:py-2 rounded-lg bg-slate-800 hover:bg-slate-700 transition-all text-xs sm:text-sm"
      >
        <span className="font-medium">{getShortSectionName(currentSection)}</span>
        <span className="text-xs">▼</span>
      </button>

      <div className="absolute left-0 mt-1 w-80 bg-white rounded-xl shadow-2xl overflow-hidden z-50 border border-slate-200">
        <div className="max-h-[80vh] overflow-y-auto">
          {SECTION_GROUPS.map((group, groupIndex) => (
            <div key={group.title} className={groupIndex > 0 ? 'border-t border-slate-100' : ''}>
              {/* Заголовок группы */}
              <div className="flex items-center gap-2 px-4 py-2.5 bg-blue-50 border-b border-blue-100">
                <group.icon className="w-4 h-4 text-blue-600" />
                <span className="text-xs font-semibold text-blue-700 uppercase tracking-wide">
                  {group.title}
                </span>
              </div>

              {/* Список разделов */}
              <div className="py-1">
                {group.sections.map((section) => {
                  const isSelected = currentSection === section.id;
                  const isInactive = !section.isActive;

                  const button = (
                    <button
                      key={section.id}
                      onClick={() => !isInactive && handleSectionChange(section.id)}
                      disabled={isInactive}
                      className={`
                        w-full text-left px-4 py-3 transition-all duration-200
                        ${isSelected
                          ? 'bg-blue-50 border-l-4 border-blue-500 pl-3'
                          : 'border-l-4 border-transparent pl-4'
                        }
                        ${isInactive
                          ? 'bg-slate-50 text-slate-400 cursor-not-allowed hover:bg-slate-100'
                          : 'text-slate-700 hover:bg-blue-50 hover:text-blue-700 cursor-pointer'
                        }
                      `}
                    >
                      <div className="flex items-center justify-between">
                        <span className={`font-medium text-sm ${isSelected ? 'text-blue-700' : ''}`}>
                          {section.name}
                        </span>
                        {isInactive && (
                          <span className="text-xs px-2 py-0.5 bg-slate-200 text-slate-500 rounded-full">
                            Скоро
                          </span>
                        )}
                      </div>
                      <div className={`text-xs mt-1 ${isSelected ? 'text-blue-600' : 'text-slate-500'}`}>
                        {section.description}
                      </div>
                      {!isInactive && (
                        <div className="text-xs text-slate-400 mt-0.5">
                          Вопросов: {section.totalQuestions} • Билетов: {section.totalTickets}
                        </div>
                      )}
                    </button>
                  );

                  if (isInactive) {
                    return button;
                  }

                  return (
                    <RichTooltip
                      key={section.id}
                      type="info"
                      title={section.name}
                      content={`${section.description} • ${section.totalQuestions} вопросов • ${section.totalTickets} билетов`}
                      position="right"
                      align="start"
                      maxWidth={320}
                    >
                      {button}
                    </RichTooltip>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}

export default SectionMenu;

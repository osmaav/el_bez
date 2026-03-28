/**
 * TheoryNavigation - Навигация по теоретическим материалам
 * 
 * @description Боковая панель с содержанием разделов
 * @author el-bez Team
 * @version 1.0.0
 */

import { BookOpen, Building2, Users, ShieldCheck, FileText } from 'lucide-react';

export interface TheorySectionItem {
  id: string;
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  iconBg: string;
  iconColor: string;
}

const theorySections: TheorySectionItem[] = [
  { id: 'intro', title: 'Введение и область применения', icon: BookOpen, iconBg: 'bg-blue-100', iconColor: 'text-blue-600' },
  { id: 'consumers', title: 'Промышленные и непромышленные', icon: Building2, iconBg: 'bg-purple-100', iconColor: 'text-purple-600' },
  { id: 'personnel', title: 'Категории и группы персонала', icon: Users, iconBg: 'bg-yellow-100', iconColor: 'text-yellow-600' },
  { id: 'attestation', title: 'Особенности аттестации', icon: ShieldCheck, iconBg: 'bg-red-100', iconColor: 'text-red-600' },
  { id: 'norms', title: 'Нормативная база', icon: FileText, iconBg: 'bg-slate-100', iconColor: 'text-slate-600' },
];

export interface TheoryNavigationProps {
  sections?: TheorySectionItem[];
}

export function TheoryNavigation({ sections = theorySections }: TheoryNavigationProps) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 sticky top-24 overflow-hidden">
      <div className="p-4 bg-slate-50 border-b border-slate-200">
        <h3 className="font-semibold text-slate-700">Содержание</h3>
      </div>
      <nav className="p-2 space-y-1">
        {sections.map((section) => {
          const Icon = section.icon;
          return (
            <a
              key={section.id}
              href={`#${section.id}`}
              className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-slate-700 rounded-md hover:bg-slate-100 hover:text-yellow-600 transition-colors"
            >
              <Icon className={`w-4 h-4 ${section.iconColor}`} />
              {section.title}
            </a>
          );
        })}
      </nav>
    </div>
  );
}

export default TheoryNavigation;

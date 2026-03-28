/**
 * TheoryNormsSection - Нормативная база
 * 
 * @description Блок 5: Основные нормативные документы
 * @author el-bez Team
 * @version 1.0.0
 */

import { FileText } from 'lucide-react';

interface NormDocument {
  title: string;
  shortName: string;
  description: string;
}

const normDocuments: NormDocument[] = [
  {
    title: 'Приказ Минтруда № 903н',
    shortName: 'ПОТ ЭЭ',
    description: 'Главный документ по охране труда. Регламентирует допуски, наряды, средства защиты.',
  },
  {
    title: 'Приказ Минэнерго № 1070',
    shortName: 'ПТЭЭП',
    description: 'Техническая эксплуатация. Требования к оборудованию, персоналу, документации.',
  },
  {
    title: 'Приказ Минтруда № 924н',
    shortName: '',
    description: 'Охрана труда при эксплуатации объектов теплоснабжения.',
  },
  {
    title: 'Правила ТБ при эксплуатации тепломеханического оборудования',
    shortName: '',
    description: 'Специфика работ в котлотурбинных цехах, на высотах, с химией.',
  },
];

export function TheoryNormsSection() {
  return (
    <section id="norms" className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 scroll-mt-24">
      <div className="flex items-center space-x-3 mb-4">
        <div className="p-2 bg-slate-100 rounded-lg">
          <FileText className="w-6 h-6 text-slate-600" />
        </div>
        <h3 className="text-xl font-bold text-slate-900">Основные нормативные документы</h3>
      </div>
      <div className="prose max-w-none">
        <ul className="space-y-3">
          {normDocuments.map((doc, index) => (
            <li key={index} className="bg-slate-50 p-3 rounded border border-slate-200">
              <strong>{doc.title}</strong>{doc.shortName && ` (${doc.shortName})`}.<br />
              <span className="text-sm text-slate-600">{doc.description}</span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

export default TheoryNormsSection;

/**
 * TheoryPersonnelSection - Категории и группы персонала
 * 
 * @description Блок 3: Категории персонала и группы по электробезопасности
 * @author el-bez Team
 * @version 1.0.0
 */

import { Users } from 'lucide-react';

interface PersonnelGroup {
  group: string;
  description: string;
  experience: string;
}

const personnelGroups: PersonnelGroup[] = [
  { group: 'II', description: 'Электротехнический персонал (начальный уровень)', experience: 'Не требуется (или 1 мес.)' },
  { group: 'III', description: 'Оперативный персонал (до 1000В / выше 1000В)', experience: '2 мес. / 3 мес.' },
  { group: 'IV', description: 'Оперативный, АТ персонал (ответственные)', experience: '3 мес. / 6 мес.' },
  { group: 'V', description: 'АТ персонал (высшая ответственность)', experience: '24 мес. / 12 мес.' },
];

export function TheoryPersonnelSection() {
  return (
    <section id="personnel" className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 scroll-mt-24">
      <div className="flex items-center space-x-3 mb-4">
        <div className="p-2 bg-yellow-100 rounded-lg">
          <Users className="w-6 h-6 text-yellow-600" />
        </div>
        <h3 className="text-xl font-bold text-slate-900">Категории и группы персонала</h3>
      </div>
      <div className="prose max-w-none">
        <p>Персонал делится на три основные категории (п. 2.3 Приказа 903н):</p>
        <ol className="list-decimal pl-5 space-y-3 mb-6">
          <li>
            <strong>Электротехнический:</strong> Административно-технический, оперативно-ремонтный, ремонтный, оперативный персонал.
          </li>
          <li>
            <strong>Электротехнологический:</strong> Персонал, у которого в управляемом им технологическом процессе основной составляющей является электроэнергия (электропечи, сварка, электролиз).
          </li>
          <li>
            <strong>Неэлектротехнический:</strong> Персонал, не подпадающий под определения выше (офисные работники, уборщики), которому может присваиваться I группа.
          </li>
        </ol>

        <h4 className="font-semibold text-slate-800 mt-6 mb-2">Группы по электробезопасности (Приложение 1 к Приказу 903н)</h4>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200 text-sm">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-4 py-3 text-left font-medium text-slate-500 uppercase tracking-wider">Группа</th>
                <th className="px-4 py-3 text-left font-medium text-slate-500 uppercase tracking-wider">Кому присваивается</th>
                <th className="px-4 py-3 text-left font-medium text-slate-500 uppercase tracking-wider">Мин. стаж (ВУЗ/СПО)</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-slate-200">
              {personnelGroups.map((item) => (
                <tr key={item.group}>
                  <td className="px-4 py-3 font-bold text-slate-900">{item.group}</td>
                  <td className="px-4 py-3 text-slate-600">{item.description}</td>
                  <td className="px-4 py-3 text-slate-600">{item.experience}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}

export default TheoryPersonnelSection;

/**
 * TheoryConsumersSection - Промышленные и непромышленные потребители
 * 
 * @description Блок 2: Различие между промышленными и непромышленными потребителями
 * @author el-bez Team
 * @version 1.0.0
 */

import { Building2 } from 'lucide-react';

export function TheoryConsumersSection() {
  return (
    <section id="consumers" className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 scroll-mt-24">
      <div className="flex items-center space-x-3 mb-4">
        <div className="p-2 bg-purple-100 rounded-lg">
          <Building2 className="w-6 h-6 text-purple-600" />
        </div>
        <h3 className="text-xl font-bold text-slate-900">Промышленные и непромышленные потребители</h3>
      </div>
      <div className="prose max-w-none">
        <p>
          В нормативных документах по электробезопасности (Приказ 903н, Приказ 1070) <strong>отсутствует</strong> прямое техническое разделение потребителей на «промышленные» и «непромышленные». Это разделение является <strong>административной практикой Ростехнадзора</strong>, используемой для определения формы аттестации.
        </p>

        <div className="grid md:grid-cols-2 gap-4 my-6">
          <div className="border border-slate-200 rounded-lg p-4 bg-slate-50">
            <h4 className="font-bold text-slate-800 mb-2 flex items-center">
              <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
              Непромышленные потребители
            </h4>
            <ul className="text-sm space-y-2 text-slate-600 list-none pl-0">
              <li>• Организации, где электроустановки не являются основным производством (офисы, школы, ЖКХ).</li>
              <li>• Обычно отсутствуют ОПО (Опасные Производственные Объекты).</li>
              <li>• <strong>Аттестация:</strong> Преимущественно во внутренних комиссиях организации (для групп II-IV).</li>
            </ul>
          </div>
          <div className="border border-slate-200 rounded-lg p-4 bg-slate-50">
            <h4 className="font-bold text-slate-800 mb-2 flex items-center">
              <span className="w-2 h-2 bg-red-500 rounded-full mr-2"></span>
              Промышленные потребители
            </h4>
            <ul className="text-sm space-y-2 text-slate-600 list-none pl-0">
              <li>• Заводы, фабрики, объекты энергетики, добычи.</li>
              <li>• Часто имеют ОПО, сложные схемы РУ, собственную генерацию.</li>
              <li>• <strong>Аттестация:</strong> Часто требуется участие инспектора Ростехнадзора или аттестация непосредственно в органе надзора (особенно для V группы и ответственных).</li>
            </ul>
          </div>
        </div>

        <p className="text-sm text-slate-500 italic">
          * Различие касается места сдачи экзамена и состава комиссии, но не содержания самих Правил (ПОТ ЭЭ, ПТЭЭП), которые едины для всех.
        </p>
      </div>
    </section>
  );
}

export default TheoryConsumersSection;

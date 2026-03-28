/**
 * TheoryAttestationSection - Особенности аттестации
 * 
 * @description Блок 4: Порядок проверки знаний и аттестации
 * @author el-bez Team
 * @version 1.0.0
 */

import { ShieldCheck } from 'lucide-react';

interface AttestationItem {
  icon: string;
  iconColor: string;
  title: string;
  description: string;
}

const attestationItems: AttestationItem[] = [
  {
    icon: 'M5 13l4 4L19 7',
    iconColor: 'text-green-500',
    title: 'Внутренняя комиссия',
    description: 'Создается приказом руководителя. Обязательна для первичной проверки знаний персонала (группы II-IV). Для непромышленных потребителей часто достаточна для всех групп, кроме V.',
  },
  {
    icon: 'M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z',
    iconColor: 'text-yellow-500',
    title: 'Комиссия Ростехнадзора',
    description: 'Обязательна для присвоения V группы. Также обязательна для персонала организаций, подконтрольных Ростехнадзору (субъекты энергетики, объекты с ОПО), где внутренняя комиссия не может быть сформирована без участия инспектора.',
  },
  {
    icon: 'M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z',
    iconColor: 'text-blue-500',
    title: 'Специальные работы',
    description: 'Работы под напряжением, верхолазные, с использованием испытательных установок требуют отдельной записи в удостоверении (п. 2.5 Приказа 903н).',
  },
];

export function TheoryAttestationSection() {
  return (
    <section id="attestation" className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 scroll-mt-24">
      <div className="flex items-center space-x-3 mb-4">
        <div className="p-2 bg-red-100 rounded-lg">
          <ShieldCheck className="w-6 h-6 text-red-600" />
        </div>
        <h3 className="text-xl font-bold text-slate-900">Особенности аттестации</h3>
      </div>
      <div className="prose max-w-none">
        <p>
          Порядок проверки знаний регулируется <strong>Разделом II Приказа 903н</strong>.
        </p>
        <ul className="space-y-4 mt-4">
          {attestationItems.map((item, index) => (
            <li key={index} className="flex items-start">
              <svg className={`w-5 h-5 ${item.iconColor} mt-0.5 mr-2 flex-shrink-0`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={item.icon} />
              </svg>
              <div>
                <strong>{item.title}:</strong> {item.description}
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

export default TheoryAttestationSection;

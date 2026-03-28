/**
 * TheoryIntroSection - Введение и область применения
 * 
 * @description Блок 1: Область применения правил
 * @author el-bez Team
 * @version 1.0.0
 */

import { BookOpen } from 'lucide-react';

export function TheoryIntroSection() {
  return (
    <section id="intro" className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 scroll-mt-24">
      <div className="flex items-center space-x-3 mb-4">
        <div className="p-2 bg-blue-100 rounded-lg">
          <BookOpen className="w-6 h-6 text-blue-600" />
        </div>
        <h3 className="text-xl font-bold text-slate-900">Область применения правил</h3>
      </div>
      <div className="prose max-w-none">
        <p>
          Согласно <strong>Приказу Минтруда России от 15.12.2020 № 903н</strong> «Об утверждении Правил по охране труда при эксплуатации электроустановок» (ПОТ ЭЭ), требования распространяются на всех работодателей (юридических и физических лиц) и весь персонал, занятый обслуживанием электроустановок.
        </p>
        <div className="bg-blue-50 border-l-4 border-blue-500 p-4 my-4">
          <p className="font-medium text-blue-800 mb-1">Ключевой принцип:</p>
          <p className="text-sm text-blue-700">Технические требования к безопасности (заземление, допуски, расстояния) едины для всех организаций, независимо от формы собственности и вида деятельности.</p>
        </div>
      </div>
    </section>
  );
}

export default TheoryIntroSection;

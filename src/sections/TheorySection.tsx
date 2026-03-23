import { useEffect, useState } from 'react';
import {
  AlertTriangle,
  BookOpen,
  Building2,
  FileText,
  ShieldCheck,
  Users,
} from 'lucide-react';
import { LoginModal } from '@/components/LoginModal';
import { RegisterModal } from '@/components/RegisterModal';
import { useAuth } from '@/hooks/useAuth';

interface TheorySectionItem {
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

export function TheorySection() {
  const { isAuthenticated } = useAuth();
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);
  const [hasUserDeclinedLogin, setHasUserDeclinedLogin] = useState(() => {
    if (typeof window !== 'undefined') {
      const declined = localStorage.getItem('elbez_declined_login');
      return declined === 'true';
    }
    return false;
  });

  useEffect(() => {
    if (!isAuthenticated && !hasUserDeclinedLogin) {
      const timer = setTimeout(() => {
        setIsLoginModalOpen(true);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [isAuthenticated, hasUserDeclinedLogin]);

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
      {/* Заголовок страницы */}
      <div className="mb-8 border-b border-slate-200 pb-4">
        <h2 className="text-3xl font-bold text-slate-900">Теоретические материалы</h2>
        <p className="text-slate-600 mt-2 text-lg">Нормативно-правовое регулирование и организация аттестации персонала</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Левая колонка: Навигация */}
        <div className="lg:col-span-3">
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 sticky top-24 overflow-hidden">
            <div className="p-4 bg-slate-50 border-b border-slate-200">
              <h3 className="font-semibold text-slate-700">Содержание</h3>
            </div>
            <nav className="p-2 space-y-1">
              {theorySections.map((section) => (
                <a
                  key={section.id}
                  href={`#${section.id}`}
                  className="block px-3 py-2 text-sm font-medium text-slate-700 rounded-md hover:bg-slate-100 hover:text-yellow-600 transition-colors"
                >
                  {section.title}
                </a>
              ))}
            </nav>
          </div>
        </div>

        {/* Правая колонка: Контент */}
        <div className="lg:col-span-9 space-y-8">
          
          {/* Блок 1: Введение */}
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

          {/* Блок 2: Промышленные vs Непромышленные */}
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

          {/* Блок 3: Персонал */}
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
                    <tr>
                      <td className="px-4 py-3 font-bold text-slate-900">II</td>
                      <td className="px-4 py-3 text-slate-600">Электротехнический персонал (начальный уровень)</td>
                      <td className="px-4 py-3 text-slate-600">Не требуется (или 1 мес.)</td>
                    </tr>
                    <tr>
                      <td className="px-4 py-3 font-bold text-slate-900">III</td>
                      <td className="px-4 py-3 text-slate-600">Оперативный персонал (до 1000В / выше 1000В)</td>
                      <td className="px-4 py-3 text-slate-600">2 мес. / 3 мес.</td>
                    </tr>
                    <tr>
                      <td className="px-4 py-3 font-bold text-slate-900">IV</td>
                      <td className="px-4 py-3 text-slate-600">Оперативный, АТ персонал (ответственные)</td>
                      <td className="px-4 py-3 text-slate-600">3 мес. / 6 мес.</td>
                    </tr>
                    <tr>
                      <td className="px-4 py-3 font-bold text-slate-900">V</td>
                      <td className="px-4 py-3 text-slate-600">АТ персонал (высшая ответственность)</td>
                      <td className="px-4 py-3 text-slate-600">24 мес. / 12 мес.</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </section>

          {/* Блок 4: Аттестация */}
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
                <li className="flex items-start">
                  <svg className="w-5 h-5 text-green-500 mt-0.5 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <div>
                    <strong>Внутренняя комиссия:</strong> Создается приказом руководителя. Обязательна для первичной проверки знаний персонала (группы II-IV). Для непромышленных потребителей часто достаточна для всех групп, кроме V.
                  </div>
                </li>
                <li className="flex items-start">
                  <svg className="w-5 h-5 text-yellow-500 mt-0.5 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                  <div>
                    <strong>Комиссия Ростехнадзора:</strong> Обязательна для присвоения V группы. Также обязательна для персонала организаций, подконтрольных Ростехнадзору (субъекты энергетики, объекты с ОПО), где внутренняя комиссия не может быть сформирована без участия инспектора.
                  </div>
                </li>
                <li className="flex items-start">
                  <svg className="w-5 h-5 text-blue-500 mt-0.5 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <div>
                    <strong>Специальные работы:</strong> Работы под напряжением, верхолазные, с использованием испытательных установок требуют отдельной записи в удостоверении (п. 2.5 Приказа 903н).
                  </div>
                </li>
              </ul>
            </div>
          </section>

          {/* Блок 5: Нормативная база */}
          <section id="norms" className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 scroll-mt-24">
            <div className="flex items-center space-x-3 mb-4">
              <div className="p-2 bg-slate-100 rounded-lg">
                <FileText className="w-6 h-6 text-slate-600" />
              </div>
              <h3 className="text-xl font-bold text-slate-900">Основные нормативные документы</h3>
            </div>
            <div className="prose max-w-none">
              <ul className="space-y-3">
                <li className="bg-slate-50 p-3 rounded border border-slate-200">
                  <strong>Приказ Минтруда № 903н</strong> (ПОТ ЭЭ).<br />
                  <span className="text-sm text-slate-600">Главный документ по охране труда. Регламентирует допуски, наряды, средства защиты.</span>
                </li>
                <li className="bg-slate-50 p-3 rounded border border-slate-200">
                  <strong>Приказ Минэнерго № 1070</strong> (ПТЭЭП).<br />
                  <span className="text-sm text-slate-600">Техническая эксплуатация. Требования к оборудованию, персоналу, документации.</span>
                </li>
                <li className="bg-slate-50 p-3 rounded border border-slate-200">
                  <strong>Приказ Минтруда № 924н</strong>.<br />
                  <span className="text-sm text-slate-600">Охрана труда при эксплуатации объектов теплоснабжения.</span>
                </li>
                <li className="bg-slate-50 p-3 rounded border border-slate-200">
                  <strong>Правила ТБ при эксплуатации тепломеханического оборудования</strong>.<br />
                  <span className="text-sm text-slate-600">Специфика работ в котлотурбинных цехах, на высотах, с химией.</span>
                </li>
              </ul>
            </div>
          </section>

          {/* Предупреждение */}
          <div className="rounded-lg bg-yellow-50 p-4 border border-yellow-200 flex gap-3">
            <AlertTriangle className="w-6 h-6 text-yellow-600 flex-shrink-0" />
            <div>
              <h4 className="font-bold text-yellow-800 text-sm">Важно!</h4>
              <p className="text-sm text-yellow-700 mt-1">
                Данный материал является вводным. Для успешной сдачи экзамена необходимо изучать полные тексты нормативных документов и актуальные вопросы тестов Ростехнадзора.
              </p>
            </div>
          </div>

        </div>
      </div>

      {/* Модальное окно входа */}
      <LoginModal
        isOpen={isLoginModalOpen}
        onClose={() => {
          setIsLoginModalOpen(false);
          setHasUserDeclinedLogin(true);
          localStorage.setItem('elbez_declined_login', 'true');
        }}
        onOpenRegister={() => {
          setIsLoginModalOpen(false);
          setIsRegisterModalOpen(true);
        }}
      />

      {/* Модальное окно регистрации */}
      <RegisterModal
        isOpen={isRegisterModalOpen}
        onClose={() => {
          setIsRegisterModalOpen(false);
          setHasUserDeclinedLogin(true);
          localStorage.setItem('elbez_declined_login', 'true');
        }}
        onOpenLogin={() => {
          setIsRegisterModalOpen(false);
          setIsLoginModalOpen(true);
        }}
      />
    </div>
  );
}

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { 
  AlertTriangle, 
  Shield, 
  Zap, 
  FileText, 
  HardHat,
  ChevronRight,
  BookOpen
} from 'lucide-react';

const theoryTopics = [
  {
    id: 'general',
    title: 'Общие положения',
    icon: BookOpen,
    content: `
      <h3 class="text-lg font-semibold mb-3">Область применения правил</h3>
      <p class="mb-4">Правила по охране труда при эксплуатации электроустановок распространяются на работодателей - юридических и физических лиц независимо от их организационно-правовых форм и работников из числа электротехнического, электротехнологического и неэлектротехнического персонала.</p>
      
      <h3 class="text-lg font-semibold mb-3">Группы по электробезопасности</h3>
      <ul class="list-disc pl-5 space-y-2 mb-4">
        <li><strong>I группа</strong> - для неэлектротехнического персонала</li>
        <li><strong>II группа</strong> - для электротехнического персонала (вспомогательный)</li>
        <li><strong>III группа</strong> - для оперативного персонала</li>
        <li><strong>IV группа</strong> - для оперативного и административно-технического персонала</li>
        <li><strong>V группа</strong> - для административно-технического персонала</li>
      </ul>
      
      <h3 class="text-lg font-semibold mb-3">Требования к персоналу IV группы</h3>
      <p>Для присвоения IV группы по электробезопасности работник должен иметь стаж работы в электроустановках:</p>
      <ul class="list-disc pl-5 space-y-1 mt-2">
        <li>С III группы - не менее 3 месяцев (при наличии высшего образования)</li>
        <li>С III группы - не менее 6 месяцев (при наличии среднего профессионального образования)</li>
        <li>С III группы - не менее 12 месяцев (без профильного образования)</li>
      </ul>
    `
  },
  {
    id: 'safety',
    title: 'Меры безопасности',
    icon: Shield,
    content: `
      <h3 class="text-lg font-semibold mb-3">Организационные мероприятия</h3>
      <ul class="list-disc pl-5 space-y-2 mb-4">
        <li>Оформление работ нарядом-допуском, распоряжением или перечнем работ</li>
        <li>Выдача разрешения на подготовку рабочего места</li>
        <li>Допуск к работе</li>
        <li>Надзор во время работы</li>
        <li>Оформление перерыва, перевода на другое место, окончания работы</li>
      </ul>
      
      <h3 class="text-lg font-semibold mb-3">Технические мероприятия</h3>
      <ul class="list-disc pl-5 space-y-2 mb-4">
        <li>Производство необходимых отключений</li>
        <li>Принятие мер, препятствующих подаче напряжения</li>
        <li>Вывешивание запрещающих плакатов и установка знаков безопасности</li>
        <li>Проверка отсутствия напряжения</li>
        <li>Установка заземлений</li>
      </ul>
      
      <h3 class="text-lg font-semibold mb-3">Допустимые расстояния</h3>
      <table class="w-full border-collapse border border-slate-300 mt-2">
        <thead>
          <tr class="bg-slate-100">
            <th class="border border-slate-300 px-3 py-2 text-left">Напряжение</th>
            <th class="border border-slate-300 px-3 py-2 text-left">Минимальное расстояние</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td class="border border-slate-300 px-3 py-2">1-35 кВ</td>
            <td class="border border-slate-300 px-3 py-2">не менее 1,0 м</td>
          </tr>
          <tr>
            <td class="border border-slate-300 px-3 py-2">110 кВ</td>
            <td class="border border-slate-300 px-3 py-2">не менее 1,5 м</td>
          </tr>
          <tr>
            <td class="border border-slate-300 px-3 py-2">220 кВ</td>
            <td class="border border-slate-300 px-3 py-2">не менее 2,5 м</td>
          </tr>
        </tbody>
      </table>
    `
  },
  {
    id: 'documents',
    title: 'Документы',
    icon: FileText,
    content: `
      <h3 class="text-lg font-semibold mb-3">Наряд-допуск</h3>
      <p class="mb-4">Наряд-допуск - это документ, определяющий содержание, место работы, время начала и окончания, условия безопасного проведения, состав бригады и работников, ответственных за безопасное выполнение работы.</p>
      
      <h3 class="text-lg font-semibold mb-3">Сроки действия наряда-допуска</h3>
      <ul class="list-disc pl-5 space-y-2 mb-4">
        <li>Обычный срок: не более 15 календарных дней</li>
        <li>Продление: 1 раз на срок не более 15 календарных дней</li>
        <li>Хранение: не менее 1 года после окончания работ</li>
      </ul>
      
      <h3 class="text-lg font-semibold mb-3">Ответственные лица</h3>
      <ul class="list-disc pl-5 space-y-2 mb-4">
        <li><strong>Выдающий наряд-допуск</strong> - работник из числа административно-технического персонала</li>
        <li><strong>Ответственный руководитель работ</strong> - работник с группой IV или V</li>
        <li><strong>Допускающий</strong> - работник из числа оперативного персонала с группой III или IV</li>
        <li><strong>Производитель работ</strong> - работник с группой III или IV</li>
        <li><strong>Наблюдающий</strong> - работник с группой III или IV</li>
      </ul>
      
      <h3 class="text-lg font-semibold mb-3">Распоряжение</h3>
      <p>Распоряжение применяется для оформления работ, выполняемых в порядке текущей эксплуатации в электроустановках напряжением до 1000 В.</p>
    `
  },
  {
    id: 'protection',
    title: 'Защитные средства',
    icon: HardHat,
    content: `
      <h3 class="text-lg font-semibold mb-3">Изолирующие электрозащитные средства</h3>
      <ul class="list-disc pl-5 space-y-2 mb-4">
        <li>Диэлектрические перчатки</li>
        <li>Диэлектрические галоши</li>
        <li>Диэлектрические ковры</li>
        <li>Изолирующие штанги</li>
        <li>Изолирующие клещи</li>
        <li>Указатели напряжения</li>
      </ul>
      
      <h3 class="text-lg font-semibold mb-3">Защитное заземление</h3>
      <p class="mb-4">Защитное заземление устанавливается для защиты от поражения электрическим током при случайном появлении напряжения на токоведущих частях.</p>
      
      <h3 class="text-lg font-semibold mb-3">Знаки безопасности</h3>
      <ul class="list-disc pl-5 space-y-2 mb-4">
        <li>«Не включать! Работают люди» - на приводах коммутационных аппаратов</li>
        <li>«Не открывать! Работают люди» - на шкафах и щитах</li>
        <li>«Работа на линии! Не включать!» - на линейных разъединителях</li>
      </ul>
      
      <h3 class="text-lg font-semibold mb-3">Электроинструмент</h3>
      <p>Для работы в особо опасных помещениях применяется электроинструмент класса II или класса III с пониженным напряжением.</p>
    `
  },
  {
    id: 'emergency',
    title: 'Аварийные ситуации',
    icon: AlertTriangle,
    content: `
      <h3 class="text-lg font-semibold mb-3">Приближение к месту короткого замыкания</h3>
      <p class="mb-4">Приближение на расстояние менее 8 метров к месту возникновения короткого замыкания на землю допускается только:</p>
      <ul class="list-disc pl-5 space-y-2 mb-4">
        <li>Для оказания доврачебной помощи людям, попавшим под напряжение</li>
        <li>Для оперативных переключений с целью ликвидации замыкания</li>
      </ul>
      
      <h3 class="text-lg font-semibold mb-3">Освобождение пострадавшего</h3>
      <p class="mb-4">При несчастном случае напряжение должно быть снято немедленно без предварительного разрешения оперативного персонала.</p>
      
      <h3 class="text-lg font-semibold mb-3">Первая помощь</h3>
      <ul class="list-disc pl-5 space-y-2 mb-4">
        <li>Немедленно освободить пострадавшего от действия электрического тока</li>
        <li>Вызвать скорую медицинскую помощь</li>
        <li>При необходимости начать сердечно-легочную реанимацию</li>
        <li>Оказать доврачебную помощь до прибытия медиков</li>
      </ul>
    `
  },
  {
    id: 'work-types',
    title: 'Виды работ',
    icon: Zap,
    content: `
      <h3 class="text-lg font-semibold mb-3">Работы с снятием напряжения</h3>
      <p class="mb-4">Работы с снятием напряжения выполняются с полным или частичным снятием напряжения. Требуется наряд-допуск или распоряжение.</p>
      
      <h3 class="text-lg font-semibold mb-3">Работы без снятия напряжения</h3>
      <p class="mb-4">Работы без снятия напряжения выполняются на расстоянии от токоведущих частей не менее допустимого. Требуется наряд-допуск.</p>
      
      <h3 class="text-lg font-semibold mb-3">Работы под напряжением</h3>
      <p class="mb-4">Работы под напряжением выполняются с применением изолирующих электрозащитных средств и под непосредственным наблюдением.</p>
      
      <h3 class="text-lg font-semibold mb-3">Работы в порядке текущей эксплуатации</h3>
      <p>В порядке текущей эксплуатации выполняются:</p>
      <ul class="list-disc pl-5 space-y-2 mt-2">
        <li>Снятие и установка электросчетчиков</li>
        <li>Ремонт пусковой и коммутационной аппаратуры</li>
        <li>Замена ламп и чистка светильников на высоте до 2,5 м</li>
        <li>Обслуживание аккумуляторных батарей</li>
      </ul>
    `
  }
];

export function TheorySection() {
  const [selectedTopic, setSelectedTopic] = useState(theoryTopics[0]);

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="mb-6">
        <h2 className="text-3xl font-bold text-slate-900">Теоретические материалы</h2>
        <p className="text-slate-600 mt-2">
          Изучите основные положения Правил по охране труда при эксплуатации электроустановок
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Список тем */}
        <Card className="lg:col-span-1 h-fit">
          <CardHeader>
            <CardTitle className="text-lg">Разделы</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <ScrollArea className="h-[500px]">
              <div className="space-y-1 p-4">
                {theoryTopics.map((topic) => {
                  const Icon = topic.icon;
                  const isActive = selectedTopic.id === topic.id;
                  
                  return (
                    <button
                      key={topic.id}
                      onClick={() => setSelectedTopic(topic)}
                      className={`
                        w-full flex items-center space-x-3 px-3 py-3 rounded-lg text-left transition-all
                        ${isActive 
                          ? 'bg-yellow-100 text-yellow-900 border border-yellow-300' 
                          : 'hover:bg-slate-100 text-slate-700'
                        }
                      `}
                    >
                      <Icon className={`w-5 h-5 ${isActive ? 'text-yellow-600' : 'text-slate-500'}`} />
                      <span className="font-medium">{topic.title}</span>
                      {isActive && <ChevronRight className="w-4 h-4 ml-auto" />}
                    </button>
                  );
                })}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>

        {/* Содержимое темы */}
        <Card className="lg:col-span-3">
          <CardHeader className="border-b bg-slate-50">
            <div className="flex items-center space-x-3">
              {(() => {
                const Icon = selectedTopic.icon;
                return <Icon className="w-6 h-6 text-yellow-600" />;
              })()}
              <CardTitle>{selectedTopic.title}</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="p-6">
            <ScrollArea className="h-[500px]">
              <div 
                className="prose prose-slate max-w-none"
                dangerouslySetInnerHTML={{ __html: selectedTopic.content }}
              />
            </ScrollArea>
          </CardContent>
        </Card>
      </div>

      {/* Предупреждение */}
      <Alert className="mt-6 border-yellow-400 bg-yellow-50">
        <AlertTriangle className="w-5 h-5 text-yellow-600" />
        <AlertTitle className="text-yellow-800">Важно!</AlertTitle>
        <AlertDescription className="text-yellow-700">
          Данный материал носит справочный характер. Перед сдачей экзамена обязательно 
          изучите актуальную редакцию Правил по охране труда при эксплуатации электроустановок 
          и методические материалы Ростехнадзора.
        </AlertDescription>
      </Alert>
    </div>
  );
}

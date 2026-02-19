import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  ChevronDown, 
  ChevronUp, 
  CheckCircle2, 
  AlertCircle,
  ClipboardCheck
} from 'lucide-react';

interface Example {
  id: number;
  title: string;
  category: string;
  situation: string;
  solution: string;
  keyPoints: string[];
}

const examples: Example[] = [
  {
    id: 1,
    title: 'Оформление наряда-допуска на ремонт электродвигателя',
    category: 'Документы',
    situation: 'Необходимо выполнить ремонт электродвигателя насоса в РУ-0,4 кВ. Электродвигатель питается от силового щита ЩС-1.',
    solution: `
      <ol class="list-decimal pl-5 space-y-2">
        <li>Выдающий наряд-допуск (работник АТП с группой IV) заполняет наряд-допуск:
          <ul class="list-disc pl-5 mt-1">
            <li>Место работы: РУ-0,4 кВ, щит ЩС-1</li>
            <li>Содержание работы: ремонт электродвигателя насоса</li>
            <li>Состав бригады: 2 человека</li>
          </ul>
        </li>
        <li>Назначается ответственный руководитель работ (группа IV)</li>
        <li>Назначается производитель работ (группа III)</li>
        <li>Допускающий (оперативный персонал с группой III) выполняет отключение</li>
        <li>Проверка отсутствия напряжения</li>
        <li>Установка заземлений</li>
        <li>Вывешивание плакатов</li>
        <li>Допуск бригады к работе</li>
      </ol>
    `,
    keyPoints: [
      'Наряд-допуск оформляется на бумажном носителе',
      'Срок действия - не более 15 календарных дней',
      'Требуется целевой инструктаж перед началом работ'
    ]
  },
  {
    id: 2,
    title: 'Единоличный осмотр электроустановки до 1000 В',
    category: 'Осмотр',
    situation: 'Оперативному персоналу необходимо провести единоличный осмотр распределительного устройства РУ-0,4 кВ.',
    solution: `
      <ol class="list-decimal pl-5 space-y-2">
        <li>Проверка наличия права единоличного осмотра в удостоверении</li>
        <li>Проверка исправности средств защиты:
          <ul class="list-disc pl-5 mt-1">
            <li>Диэлектрические перчатки (испытаны)</li>
            <li>Указатель напряжения (испытан)</li>
          </ul>
        </li>
        <li>Проверка наличия ключа от помещения</li>
        <li>Осмотр проводится в присутствии оперативного персонала с группой III</li>
        <li>Запрещается:
          <ul class="list-disc pl-5 mt-1">
            <li>Открывать двери щитов и сборок</li>
            <li>Проникать за ограждения</li>
            <li>Проводить какие-либо работы</li>
          </ul>
        </li>
      </ol>
    `,
    keyPoints: [
      'Для единоличного осмотра требуется группа не ниже III',
      'Осмотр проводится только визуально',
      'Запрещается касание токоведущих частей'
    ]
  },
  {
    id: 3,
    title: 'Работы под напряжением в электроустановках до 1000 В',
    category: 'Работы под напряжением',
    situation: 'Необходимо заменить предохранитель в цепи управления без отключения напряжения.',
    solution: `
      <ol class="list-decimal pl-5 space-y-2">
        <li>Оформление наряда-допуска на работу под напряжением</li>
        <li>Назначение ответственного руководителя работ (группа IV)</li>
        <li>Назначение производителя работ (группа IV)</li>
        <li>Проверка изолирующих средств:
          <ul class="list-disc pl-5 mt-1">
            <li>Диэлектрические перчатки</li>
            <li>Изолированный инструмент</li>
            <li>Средства защиты лица</li>
          </ul>
        </li>
        <li>Ограждение рабочего места</li>
        <li>Целевой инструктаж</li>
        <li>Работа в диэлектрических перчатках</li>
        <li>Наблюдение со стороны производителя работ</li>
      </ol>
    `,
    keyPoints: [
      'Для работ под напряжением требуется группа IV',
      'Обязательно применение диэлектрических перчаток',
      'Запрещается работа в мокрой одежде'
    ]
  },
  {
    id: 4,
    title: 'Подготовка рабочего места при работе на воздушной линии',
    category: 'Подготовка',
    situation: 'Необходимо выполнить ремонт провода на воздушной линии 0,4 кВ.',
    solution: `
      <ol class="list-decimal pl-5 space-y-2">
        <li>Оформление наряда-допуска</li>
        <li>Отключение питания линии:
          <ul class="list-disc pl-5 mt-1">
            <li>Отключение выключателя</li>
            <li>Открытие разъединителей с обеих сторон</li>
            <li>Снятие предохранителей (при наличии)</li>
          </ul>
        </li>
        <li>Вывешивание плакатов на приводах</li>
        <li>Проверка отсутствия напряжения на всех полюсах</li>
        <li>Установка переносных заземлений:
          <ul class="list-disc pl-5 mt-1">
            <li>Сначала заземляющий конец</li>
            <li>Затем присоединение к токоведущим частям</li>
          </ul>
        </li>
        <li>Ограждение рабочего места</li>
        <li>Допуск бригады</li>
      </ol>
    `,
    keyPoints: [
      'Заземления устанавливаются на обеих сторонах рабочего места',
      'Проверка отсутствия напряжения обязательна',
      'Работа на высоте - только с применением страховочного пояса'
    ]
  },
  {
    id: 5,
    title: 'Действия при аварии (человек под напряжением)',
    category: 'Авария',
    situation: 'Работник коснулся токоведущей части и находится под напряжением.',
    solution: `
      <ol class="list-decimal pl-5 space-y-2">
        <li><strong>Немедленно отключить напряжение</strong> - нажать аварийную кнопку, выключить рубильник</li>
        <li>Если отключение невозможно:
          <ul class="list-disc pl-5 mt-1">
            <li>Оттащить пострадавшего за сухую одежду</li>
            <li>Оттолкнуть токоведущую часть сухим деревянным предметом</li>
            <li>Перерезать провод изолированными клещами</li>
          </ul>
        </li>
        <li>Вызвать скорую помощь (103)</li>
        <li>Оценить состояние пострадавшего:
          <ul class="list-disc pl-5 mt-1">
            <li>Признаки жизни (дыхание, пульс)</li>
            <li>Сознание</li>
          </ul>
        </li>
        <li>При отсутствии дыхания - начать СЛР:
          <ul class="list-disc pl-5 mt-1">
            <li>30 нажатий на грудную клетку</li>
            <li>2 искусственных вдоха</li>
            <li>Частота 100-120 нажатий в минуту</li>
          </ul>
        </li>
        <li>Продолжать реанимацию до прибытия медиков</li>
      </ol>
    `,
    keyPoints: [
      'Напряжение отключается немедленно без разрешения',
      'Прикосновение к пострадавшему только при отключенном напряжении',
      'Первая помощь - ключевой фактор выживания'
    ]
  },
  {
    id: 6,
    title: 'Переключения в электроустановках',
    category: 'Оперативные переключения',
    situation: 'Необходимо перевести нагрузку с основного источника питания на резервный.',
    solution: `
      <ol class="list-decimal pl-5 space-y-2">
        <li>Получение распоряжения от вышестоящего оперативного персонала</li>
        <li>Повторение распоряжения контролирующим лицом</li>
        <li>Проверка готовности резервного источника</li>
        <li>Последовательность переключений:
          <ul class="list-disc pl-5 mt-1">
            <li>Включить вводной выключатель резерва</li>
            <li>Включить секционный выключатель</li>
            <li>Отключить вводной выключатель основного источника</li>
          </ul>
        </li>
        <li>Контроль показаний приборов</li>
        <li>Запись в оперативном журнале</li>
      </ol>
    `,
    keyPoints: [
      'Переключения выполняются по распоряжению',
      'Каждая операция контролируется',
      'Запись в журнале обязательна'
    ]
  }
];

export function ExamplesSection() {
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const categories = Array.from(new Set(examples.map(e => e.category)));
  
  const filteredExamples = selectedCategory 
    ? examples.filter(e => e.category === selectedCategory)
    : examples;

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="mb-6">
        <h2 className="text-3xl font-bold text-slate-900">Примеры решения задач</h2>
        <p className="text-slate-600 mt-2">
          Разбор типовых ситуаций и порядок действий в соответствии с правилами
        </p>
      </div>

      {/* Фильтры по категориям */}
      <div className="flex flex-wrap gap-2 mb-6">
        <Button
          variant={selectedCategory === null ? 'default' : 'outline'}
          onClick={() => setSelectedCategory(null)}
          className={selectedCategory === null ? 'bg-yellow-500 hover:bg-yellow-600' : ''}
        >
          Все
        </Button>
        {categories.map(cat => (
          <Button
            key={cat}
            variant={selectedCategory === cat ? 'default' : 'outline'}
            onClick={() => setSelectedCategory(cat)}
            className={selectedCategory === cat ? 'bg-yellow-500 hover:bg-yellow-600' : ''}
          >
            {cat}
          </Button>
        ))}
      </div>

      {/* Список примеров */}
      <div className="space-y-4">
        {filteredExamples.map((example) => {
          const isExpanded = expandedId === example.id;
          
          return (
            <Card key={example.id} className="overflow-hidden">
              <div 
                className="p-4 cursor-pointer hover:bg-slate-50 transition-colors"
                onClick={() => setExpandedId(isExpanded ? null : example.id)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-3">
                    <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <ClipboardCheck className="w-5 h-5 text-yellow-600" />
                    </div>
                    <div>
                      <div className="flex items-center space-x-2 mb-1">
                        <Badge variant="secondary">{example.category}</Badge>
                      </div>
                      <h3 className="font-semibold text-slate-900">{example.title}</h3>
                    </div>
                  </div>
                  {isExpanded ? (
                    <ChevronUp className="w-5 h-5 text-slate-400" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-slate-400" />
                  )}
                </div>
              </div>

              {isExpanded && (
                <CardContent className="border-t bg-slate-50">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Ситуация */}
                    <div>
                      <div className="flex items-center space-x-2 mb-3">
                        <AlertCircle className="w-5 h-5 text-amber-600" />
                        <h4 className="font-semibold text-slate-900">Ситуация</h4>
                      </div>
                      <p className="text-slate-700 text-sm leading-relaxed">
                        {example.situation}
                      </p>
                    </div>

                    {/* Решение */}
                    <div>
                      <div className="flex items-center space-x-2 mb-3">
                        <CheckCircle2 className="w-5 h-5 text-green-600" />
                        <h4 className="font-semibold text-slate-900">Порядок действий</h4>
                      </div>
                      <div 
                        className="text-slate-700 text-sm leading-relaxed"
                        dangerouslySetInnerHTML={{ __html: example.solution }}
                      />
                    </div>
                  </div>

                  {/* Ключевые моменты */}
                  <div className="mt-6 pt-4 border-t">
                    <h4 className="font-semibold text-slate-900 mb-3">Ключевые моменты</h4>
                    <div className="flex flex-wrap gap-2">
                      {example.keyPoints.map((point, idx) => (
                        <div 
                          key={idx}
                          className="flex items-center space-x-2 bg-white px-3 py-2 rounded-lg border text-sm"
                        >
                          <CheckCircle2 className="w-4 h-4 text-green-500" />
                          <span>{point}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              )}
            </Card>
          );
        })}
      </div>
    </div>
  );
}

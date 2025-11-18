# Справочники данных

## Общая структура

Все справочники хранятся в формате JSON в директории `data-dictionaries/`.

**Принцип взвешенных списков**: Каждый элемент имеет вес (вероятность), сумма весов в списке ≤ 1.0. Это позволяет генерировать реалистичное распределение (популярные имена встречаются чаще).

## 1. names.json

**Описание**: Справочник имен, фамилий и отчеств.

**Структура**:
```json
{
  "male": [
    {
      "value": "Александр",
      "weight": 0.0123
    },
    {
      "value": "Дмитрий",
      "weight": 0.0115
    }
  ],
  "female": [
    {
      "value": "Анна",
      "weight": 0.0145
    },
    {
      "value": "Мария",
      "weight": 0.0132
    }
  ],
  "surnames": [
    {
      "value": "Иванов",
      "weight": 0.0089
    },
    {
      "value": "Петров",
      "weight": 0.0087
    }
  ],
  "patronymics": [
    {
      "value": "Александрович",
      "gender": "male",
      "weight": 0.0093
    },
    {
      "value": "Александровна",
      "gender": "female",
      "weight": 0.0092
    }
  ]
}
```

**Требования**:
- `male`: минимум 200 имен
- `female`: минимум 200 имен
- `surnames`: минимум 500 фамилий
- `patronymics`: минимум 200 отчеств (мужские и женские)

**Генерация весов**:
- Популярные имена имеют больший вес
- Распределение: экспоненциальное убывание
- Сумма весов для каждого списка ≈ 0.9-0.95 (оставляем запас)

## 2. regions.json

**Описание**: Справочник регионов РФ с кодами.

**Структура**:
```json
[
  {
    "code": "77",
    "name": "Москва",
    "type": "city",
    "weight": 0.125
  },
  {
    "code": "78",
    "name": "Санкт-Петербург",
    "type": "city",
    "weight": 0.095
  },
  {
    "code": "50",
    "name": "Московская область",
    "type": "region",
    "weight": 0.085
  }
]
```

**Поля**:
- `code`: Код региона (2 цифры)
- `name`: Название региона
- `type`: Тип (`city` | `region` | `republic` | `krai` | `oblast`)
- `weight`: Вероятность выбора

**Требования**:
- Все 85 субъектов РФ
- Веса пропорциональны населению (примерно)

## 3. division_codes.json

**Описание**: Коды подразделений МВД для паспортов.

**Структура**:
```json
[
  {
    "code": "770-001",
    "region": "77",
    "name": "ОУФМС России по г. Москве",
    "weight": 0.15
  },
  {
    "code": "780-001",
    "region": "78",
    "name": "ОУФМС России по г. Санкт-Петербургу",
    "weight": 0.12
  }
]
```

**Поля**:
- `code`: Код подразделения (формат: `XXX-XXX`)
- `region`: Код региона
- `name`: Название подразделения
- `weight`: Вероятность выбора

**Требования**:
- Минимум 200 кодов
- Привязка к регионам
- Валидный формат кода

## 4. cities.json

**Описание**: Справочник городов и населенных пунктов.

**Структура**:
```json
[
  {
    "name": "Москва",
    "region": "77",
    "type": "city",
    "population": 12600000,
    "weight": 0.20
  },
  {
    "name": "Санкт-Петербург",
    "region": "78",
    "type": "city",
    "population": 5400000,
    "weight": 0.15
  },
  {
    "name": "Подольск",
    "region": "50",
    "type": "city",
    "population": 300000,
    "weight": 0.005
  }
]
```

**Поля**:
- `name`: Название города
- `region`: Код региона
- `type`: Тип (`city` | `town` | `village`)
- `population`: Население (для расчета весов)
- `weight`: Вероятность выбора

**Требования**:
- Минимум 500 городов
- Привязка к регионам
- Веса пропорциональны населению

## 5. streets.json

**Описание**: Справочник названий улиц (синтетический).

**Структура**:
```json
[
  {
    "name": "ул. Ленина",
    "type": "street",
    "weight": 0.15
  },
  {
    "name": "пр. Мира",
    "type": "avenue",
    "weight": 0.12
  },
  {
    "name": "пер. Центральный",
    "type": "lane",
    "weight": 0.10
  }
]
```

**Поля**:
- `name`: Название улицы с типом
- `type`: Тип (`street` | `avenue` | `lane` | `boulevard`)
- `weight`: Вероятность выбора

**Требования**:
- Минимум 300 названий
- Реалистичные названия (без реальных адресов)
- Разнообразие типов улиц

## 6. postal_codes.json

**Описание**: Справочник почтовых индексов по регионам.

**Структура**:
```json
[
  {
    "code": "101000",
    "region": "77",
    "city": "Москва",
    "weight": 0.05
  },
  {
    "code": "190000",
    "region": "78",
    "city": "Санкт-Петербург",
    "weight": 0.04
  }
]
```

**Поля**:
- `code`: Почтовый индекс (6 цифр)
- `region`: Код региона
- `city`: Город
- `weight`: Вероятность выбора

**Требования**:
- Минимум 200 индексов
- Привязка к регионам/городам

## Формат весов

### Алгоритм генерации весов

```typescript
function generateWeights(items: string[], scale: number = 0.9): number[] {
  const n = items.length;
  const decay = 0.99; // Коэффициент убывания
  
  // Экспоненциальное распределение
  const raw = Array.from({ length: n }, (_, i) => Math.pow(decay, i));
  const sum = raw.reduce((a, b) => a + b, 0);
  const factor = scale / sum;
  
  return raw.map(value => Number((value * factor).toFixed(4)));
}
```

**Параметры**:
- `scale`: Общая сумма весов (обычно 0.9-0.95)
- `decay`: Скорость убывания (0.99 для плавного убывания)

### Валидация весов

```typescript
function validateWeights(items: Array<{ weight: number }>): boolean {
  const sum = items.reduce((acc, item) => acc + item.weight, 0);
  return sum <= 1.0 && items.every(item => item.weight > 0);
}
```

## Загрузка справочников

### Backend (Node.js)

```typescript
import fs from 'fs';
import path from 'path';

class DictionaryLoader {
  private dictionaries: Map<string, any> = new Map();

  load(name: string): any {
    if (this.dictionaries.has(name)) {
      return this.dictionaries.get(name);
    }

    const filePath = path.join(__dirname, '../data-dictionaries', `${name}.json`);
    const data = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
    this.dictionaries.set(name, data);
    return data;
  }

  getWeightedRandom<T extends { weight: number }>(
    items: T[]
  ): T {
    const random = Math.random();
    let cumulative = 0;

    for (const item of items) {
      cumulative += item.weight;
      if (random <= cumulative) {
        return item;
      }
    }

    return items[items.length - 1]; // Fallback
  }
}
```

### Backend (Python)

```python
import json
import random
from pathlib import Path
from typing import List, Dict, Any

class DictionaryLoader:
    def __init__(self, base_path: str = "data-dictionaries"):
        self.base_path = Path(base_path)
        self._cache: Dict[str, Any] = {}

    def load(self, name: str) -> Any:
        if name in self._cache:
            return self._cache[name]

        file_path = self.base_path / f"{name}.json"
        with open(file_path, 'r', encoding='utf-8') as f:
            data = json.load(f)
        self._cache[name] = data
        return data

    def get_weighted_random(self, items: List[Dict[str, Any]]) -> Dict[str, Any]:
        random_value = random.random()
        cumulative = 0.0

        for item in items:
            cumulative += item['weight']
            if random_value <= cumulative:
                return item

        return items[-1]  # Fallback
```

## Обновление справочников

### Процесс обновления

1. **Подготовка данных**: Сбор данных из открытых источников (без реальных ПДн)
2. **Генерация весов**: Применение алгоритма генерации весов
3. **Валидация**: Проверка формата и весов
4. **Тестирование**: Проверка генерации на тестовых данных
5. **Деплой**: Обновление файлов в репозитории

### Скрипт валидации

```typescript
// scripts/validate-dictionaries.ts
import { validateWeights } from './utils';

const dictionaries = ['names', 'regions', 'cities', 'streets'];

for (const dict of dictionaries) {
  const data = loadDictionary(dict);
  
  // Валидация структуры
  validateStructure(data);
  
  // Валидация весов
  if (data.male) validateWeights(data.male);
  if (data.female) validateWeights(data.female);
  if (data.surnames) validateWeights(data.surnames);
  if (Array.isArray(data)) validateWeights(data);
  
  console.log(`✓ ${dict}.json validated`);
}
```

## Безопасность данных

⚠️ **Важно**: Все справочники содержат только синтетические данные или обезличенные статистические данные. Никакие реальные персональные данные не используются.

**Принципы**:
- Имена и фамилии — общие, не связанные с реальными людьми
- Адреса — синтетические комбинации
- Коды подразделений — валидные форматы, но не реальные коды


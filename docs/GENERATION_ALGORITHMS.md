# Алгоритмы генерации данных

## Общие принципы

Все алгоритмы генерации должны:
1. Использовать только синтетические данные
2. Генерировать валидные форматы
3. Обеспечивать реалистичное распределение
4. Гарантировать уникальность в рамках сессии (опционально)

## 1. Генерация ФИО

### Алгоритм

```typescript
function generateFullName(gender: 'male' | 'female', dictionaries: NamesDictionary): FullName {
  // 1. Выбор имени по полу
  const nameList = gender === 'male' ? dictionaries.male : dictionaries.female;
  const firstName = getWeightedRandom(nameList).value;

  // 2. Выбор фамилии
  const lastName = getWeightedRandom(dictionaries.surnames).value;

  // 3. Генерация отчества на основе имени отца
  const fatherName = getWeightedRandom(dictionaries.male).value;
  const middleName = generatePatronymic(fatherName, gender);

  return {
    first_name: firstName,
    last_name: lastName,
    middle_name: middleName
  };
}
```

### Генерация отчества

```typescript
function generatePatronymic(fatherName: string, gender: 'male' | 'female'): string {
  const lower = fatherName.toLowerCase();
  let stem = fatherName;

  // Удаление окончаний
  if (/[йь]$/.test(lower) || /[ая]$/.test(lower)) {
    stem = fatherName.slice(0, -1);
  }

  // Определение суффикса
  let suffix: string;
  if (/[йь]$/.test(lower) || /[еёию]$/.test(lower)) {
    suffix = gender === 'male' ? 'евич' : 'евна';
  } else {
    suffix = gender === 'male' ? 'ович' : 'овна';
  }

  return stem + suffix;
}
```

**Примеры**:
- `Александр` → `Александрович` / `Александровна`
- `Игорь` → `Игоревич` / `Игоревна`
- `Николай` → `Николаевич` / `Николаевна`

## 2. Генерация даты рождения

### Алгоритм

```typescript
function generateBirthDate(ageRange: [number, number]): string {
  const [minAge, maxAge] = ageRange;
  const currentDate = new Date();
  
  // Выбор случайного возраста в диапазоне
  const age = Math.floor(Math.random() * (maxAge - minAge + 1)) + minAge;
  
  // Вычисление года рождения
  const birthYear = currentDate.getFullYear() - age;
  
  // Случайный месяц и день
  const month = Math.floor(Math.random() * 12) + 1;
  const daysInMonth = new Date(birthYear, month, 0).getDate();
  const day = Math.floor(Math.random() * daysInMonth) + 1;
  
  // Форматирование YYYY-MM-DD
  return `${birthYear}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
}
```

### Распределение по возрастам

Для реалистичности можно использовать не равномерное, а нормальное распределение:

```typescript
function generateAgeWithDistribution(ageRange: [number, number]): number {
  const [min, max] = ageRange;
  const mean = (min + max) / 2;
  const stdDev = (max - min) / 6; // Правило 3 сигм
  
  // Box-Muller transform для нормального распределения
  const u1 = Math.random();
  const u2 = Math.random();
  const z = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
  const age = Math.round(mean + z * stdDev);
  
  return Math.max(min, Math.min(max, age));
}
```

## 3. Генерация паспортных данных

### Серия паспорта

**Формат**: `XX YY` (4 цифры, разделенные пробелом)

**Алгоритм**:
```typescript
function generatePassportSeries(region: string): string {
  // Первые 2 цифры — код региона (последние 2 цифры кода региона)
  const regionCode = region.slice(-2);
  
  // Вторые 2 цифры — год выдачи (последние 2 цифры года)
  const currentYear = new Date().getFullYear();
  const yearCode = String(currentYear).slice(-2);
  
  // Для старых паспортов — случайный год в диапазоне
  const issueYear = currentYear - Math.floor(Math.random() * 20);
  const yearCode = String(issueYear).slice(-2);
  
  return `${regionCode} ${yearCode}`;
}
```

### Номер паспорта

**Формат**: 6 цифр

**Алгоритм**:
```typescript
function generatePassportNumber(): string {
  // Простая генерация 6 случайных цифр
  return String(Math.floor(100000 + Math.random() * 900000));
}
```

**Улучшение**: Проверка уникальности в рамках сессии
```typescript
const usedNumbers = new Set<string>();

function generatePassportNumber(): string {
  let number: string;
  do {
    number = String(Math.floor(100000 + Math.random() * 900000));
  } while (usedNumbers.has(number));
  
  usedNumbers.add(number);
  return number;
}
```

### Код подразделения

**Формат**: `XXX-XXX` (6 цифр, разделенные дефисом)

**Алгоритм**:
```typescript
function generateDivisionCode(region: string, dictionaries: DivisionCodesDictionary): string {
  // Фильтрация кодов по региону
  const regionCodes = dictionaries.filter(code => code.region === region);
  
  if (regionCodes.length > 0) {
    return getWeightedRandom(regionCodes).code;
  }
  
  // Fallback: генерация случайного кода
  const part1 = String(Math.floor(100 + Math.random() * 900));
  const part2 = String(Math.floor(100 + Math.random() * 900));
  return `${part1}-${part2}`;
}
```

### Дата выдачи паспорта

**Алгоритм**:
```typescript
function generatePassportIssueDate(birthDate: string): string {
  const birth = new Date(birthDate);
  const age14 = new Date(birth);
  age14.setFullYear(birth.getFullYear() + 14);
  
  const currentDate = new Date();
  const maxDate = currentDate < age14 ? age14 : currentDate;
  
  // Случайная дата между 14-летием и текущей датой
  const timeDiff = maxDate.getTime() - age14.getTime();
  const randomTime = age14.getTime() + Math.random() * timeDiff;
  const issueDate = new Date(randomTime);
  
  return formatDate(issueDate);
}
```

## 4. Генерация ИНН

### Алгоритм валидации ИНН

ИНН физлица состоит из 12 цифр:
- Первые 10 — основная часть
- 11-я — контрольная сумма 1
- 12-я — контрольная сумма 2

**Алгоритм генерации**:
```typescript
function generateINN(region: string): string {
  // 1. Первые 2 цифры — код региона
  const regionCode = region.slice(-2);
  
  // 2. Следующие 8 цифр — случайные
  const randomPart = String(Math.floor(10000000 + Math.random() * 90000000));
  
  // 3. Вычисление контрольных сумм
  const base = regionCode + randomPart;
  const checkSum1 = calculateINNCheckSum(base, [7, 2, 4, 10, 3, 5, 9, 4, 6, 8]);
  const checkSum2 = calculateINNCheckSum(base + checkSum1, [3, 7, 2, 4, 10, 3, 5, 9, 4, 6, 8]);
  
  return base + checkSum1 + checkSum2;
}

function calculateINNCheckSum(digits: string, weights: number[]): string {
  let sum = 0;
  for (let i = 0; i < digits.length; i++) {
    sum += parseInt(digits[i]) * weights[i];
  }
  const remainder = sum % 11;
  return String(remainder < 10 ? remainder : 0);
}
```

## 5. Генерация СНИЛС

### Алгоритм валидации СНИЛС

СНИЛС состоит из 11 цифр:
- Первые 9 — основная часть
- Последние 2 — контрольное число

**Алгоритм генерации**:
```typescript
function generateSNILS(): string {
  // 1. Генерация первых 9 цифр (не должно быть 000, 001, 002)
  let base: string;
  do {
    base = String(Math.floor(100000000 + Math.random() * 900000000));
  } while (['000', '001', '002'].includes(base.slice(0, 3)));
  
  // 2. Вычисление контрольного числа
  let checkSum = 0;
  for (let i = 0; i < 9; i++) {
    checkSum += parseInt(base[i]) * (9 - i);
  }
  
  if (checkSum < 100) {
    checkSum = checkSum;
  } else if (checkSum === 100 || checkSum === 101) {
    checkSum = 0;
  } else {
    checkSum = checkSum % 101;
    if (checkSum === 100 || checkSum === 101) {
      checkSum = 0;
    }
  }
  
  const checkSumStr = String(checkSum).padStart(2, '0');
  
  // 3. Форматирование: XXX-XXX-XXX XX
  return `${base.slice(0, 3)}-${base.slice(3, 6)}-${base.slice(6, 9)} ${checkSumStr}`;
}
```

## 6. Генерация адреса

### Алгоритм

```typescript
function generateAddress(region?: string, dictionaries: AddressDictionaries): Address {
  // 1. Выбор региона
  const selectedRegion = region 
    ? dictionaries.regions.find(r => r.code === region)
    : getWeightedRandom(dictionaries.regions);
  
  // 2. Выбор города в регионе
  const regionCities = dictionaries.cities.filter(c => c.region === selectedRegion.code);
  const city = getWeightedRandom(regionCities);
  
  // 3. Выбор улицы
  const street = getWeightedRandom(dictionaries.streets);
  
  // 4. Генерация номера дома и квартиры
  const house = generateHouseNumber();
  const apartment = generateApartmentNumber();
  
  // 5. Выбор почтового индекса
  const postalCodes = dictionaries.postal_codes.filter(
    pc => pc.region === selectedRegion.code && pc.city === city.name
  );
  const postalCode = postalCodes.length > 0 
    ? getWeightedRandom(postalCodes).code
    : generatePostalCode(selectedRegion.code);
  
  return {
    region: selectedRegion.code,
    region_name: selectedRegion.name,
    city: city.name,
    street: street.name,
    house,
    apartment,
    postal_code: postalCode
  };
}

function generateHouseNumber(): string {
  // 80% вероятность обычного номера, 20% — с литерой
  if (Math.random() < 0.8) {
    return String(Math.floor(1 + Math.random() * 200));
  } else {
    const number = Math.floor(1 + Math.random() * 50);
    const letter = String.fromCharCode(65 + Math.floor(Math.random() * 26)); // A-Z
    return `${number}${letter}`;
  }
}

function generateApartmentNumber(): string {
  // 70% вероятность наличия квартиры
  if (Math.random() < 0.7) {
    return String(Math.floor(1 + Math.random() * 200));
  }
  return undefined;
}
```

## 7. Генерация водительских прав

### Серия и номер

**Формат**: `XX YY NNNNNN` (2 буквы, 2 цифры, 6 цифр)

**Алгоритм**:
```typescript
function generateDriverLicense(region: string): DriverLicense {
  // Серия: код региона + случайная буква
  const regionCode = region.slice(-2);
  const letter1 = String.fromCharCode(65 + Math.floor(Math.random() * 26));
  const letter2 = String.fromCharCode(65 + Math.floor(Math.random() * 26));
  const series = `${regionCode}${letter1}${letter2}`;
  
  // Номер: 6 цифр
  const number = String(Math.floor(100000 + Math.random() * 900000));
  
  // Категории (взвешенный выбор)
  const categories = ['B'];
  if (Math.random() < 0.3) categories.push('C');
  if (Math.random() < 0.1) categories.push('A');
  
  // Даты выдачи и окончания (срок действия 10 лет)
  const issueDate = generateIssueDate();
  const expiryDate = new Date(issueDate);
  expiryDate.setFullYear(expiryDate.getFullYear() + 10);
  
  return {
    series,
    number,
    categories,
    issue_date: formatDate(issueDate),
    expiry_date: formatDate(expiryDate)
  };
}
```

## 8. Генерация полиса ОМС

### Номер полиса

**Формат**: 16 цифр

**Алгоритм**:
```typescript
function generateOMS(): OMS {
  // Генерация 16-значного номера
  const number = String(Math.floor(1000000000000000 + Math.random() * 9000000000000000));
  
  // Дата выдачи (обычно при рождении или позже)
  const issueDate = generateIssueDate();
  
  return {
    number,
    issue_date: formatDate(issueDate)
  };
}
```

## Оптимизация производительности

### Кеширование справочников

```typescript
class GeneratorCache {
  private nameCache: Map<string, any> = new Map();
  
  getCachedDictionary(name: string): any {
    if (!this.nameCache.has(name)) {
      this.nameCache.set(name, loadDictionary(name));
    }
    return this.nameCache.get(name);
  }
}
```

### Предвычисление весов

Для ускорения взвешенного выбора можно предвычислить кумулятивные суммы:

```typescript
function precomputeCumulativeWeights<T extends { weight: number }>(
  items: T[]
): Array<T & { cumulative: number }> {
  let cumulative = 0;
  return items.map(item => {
    cumulative += item.weight;
    return { ...item, cumulative };
  });
}
```

## Тестирование алгоритмов

### Unit тесты

```typescript
describe('INN Generation', () => {
  it('should generate valid INN', () => {
    const inn = generateINN('77');
    expect(inn).toMatch(/^\d{12}$/);
    expect(validateINN(inn)).toBe(true);
  });
});

describe('SNILS Generation', () => {
  it('should generate valid SNILS format', () => {
    const snils = generateSNILS();
    expect(snils).toMatch(/^\d{3}-\d{3}-\d{3} \d{2}$/);
    expect(validateSNILS(snils)).toBe(true);
  });
});
```


import { Injectable } from '@nestjs/common';
import { DictionaryLoader } from '../utils/dictionary-loader';

interface Region {
  code: string;
  name: string;
  type: string;
  weight: number;
}

interface City {
  name: string;
  region: string;
  type: string;
  population?: number;
  weight: number;
}

interface Street {
  name: string;
  type: string;
  weight: number;
}

@Injectable()
export class AddressGenerator {
  private loader: DictionaryLoader;

  constructor() {
    this.loader = new DictionaryLoader();
  }

  generate(region?: string): {
    region: string;
    region_name: string;
    city: string;
    street: string;
    house: string;
    apartment?: string;
    postal_code: string;
  } {
    // 1. Выбор региона
    const regions = this.loader.load<Region[]>('regions');
    const selectedRegion = region
      ? this.findRegionByCode(region, regions)
      : this.loader.getWeightedRandom(regions);

    // 2. Выбор города в регионе
    const cities = this.loader.load<City[]>('cities');
    const regionCities = cities.filter((c) => c.region === selectedRegion.code);
    const city =
      regionCities.length > 0
        ? this.loader.getWeightedRandom(regionCities)
        : { name: 'Город', region: selectedRegion.code, type: 'city', weight: 0 };

    // 3. Выбор улицы
    const streets = this.loader.load<Street[]>('streets');
    const street = this.loader.getWeightedRandom(streets);

    // 4. Генерация номера дома и квартиры
    const house = this.generateHouseNumber();
    const apartment = this.generateApartmentNumber();

    // 5. Генерация почтового индекса
    const postalCode = this.generatePostalCode(selectedRegion.code);

    return {
      region: selectedRegion.code,
      region_name: selectedRegion.name,
      city: city.name,
      street: street.name,
      house,
      apartment,
      postal_code: postalCode,
    };
  }

  private findRegionByCode(code: string, regions: Region[]): Region {
    const region = regions.find((r) => r.code === code);
    if (!region) {
      throw new Error(`Region with code ${code} not found`);
    }
    return region;
  }

  private generateHouseNumber(): string {
    // 80% вероятность обычного номера, 20% — с литерой
    if (Math.random() < 0.8) {
      return String(Math.floor(1 + Math.random() * 200));
    } else {
      const number = Math.floor(1 + Math.random() * 50);
      const letter = String.fromCharCode(65 + Math.floor(Math.random() * 26)); // A-Z
      return `${number}${letter}`;
    }
  }

  private generateApartmentNumber(): string | undefined {
    // 70% вероятность наличия квартиры
    if (Math.random() < 0.7) {
      return String(Math.floor(1 + Math.random() * 200));
    }
    return undefined;
  }

  private generatePostalCode(region: string): string {
    // Простая генерация почтового индекса на основе региона
    // В реальности нужно использовать справочник
    const regionNum = parseInt(region);
    const base = Math.floor(regionNum * 1000 + Math.random() * 1000);
    return String(base).padStart(6, '0');
  }
}


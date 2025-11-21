import { ExportService } from './export.service';
import { Profile } from '../../types';

const baseProfile: Profile = {
  id: 'profile-test',
  personal: {
    first_name: 'Иван',
    last_name: 'Иванов',
    middle_name: 'Иванович',
    gender: 'male',
    birth_date: '1995-05-12',
    age: 29,
    birth_place: 'Москва',
  },
  address: {
    region: '77',
    region_name: 'Москва',
    city: 'Москва',
    street: 'Тверская',
    house: '10',
    apartment: '12',
    postal_code: '125009',
  },
  passport: {
    series: '45 01',
    number: '123456',
    issued_by: 'ОВД Тверского района',
    division_code: '770-001',
    issue_date: '2015-01-01',
  },
  inn: '770123456789',
  snils: '123-456-789 00',
  driver_license: {
    series: '77АВ',
    number: '654321',
    categories: ['B'],
    issue_date: '2018-06-01',
    expiry_date: '2028-06-01',
  },
  oms: {
    number: '1234567890123456',
    issue_date: '2010-01-01',
  },
  created_at: new Date().toISOString(),
  expires_at: new Date(Date.now() + 1000 * 60 * 60 * 24 * 365).toISOString(),
};

describe('ExportService', () => {
  const service = new ExportService();

  it('should return raw profile for JSON export', () => {
    expect(service.toJSON(baseProfile)).toEqual(baseProfile);
  });

  it('should generate a PDF buffer', async () => {
    const buffer = await service.toPDF(baseProfile);
    expect(Buffer.isBuffer(buffer)).toBeTruthy();
    expect(buffer.length).toBeGreaterThan(1000);
    expect(buffer.slice(0, 4).toString()).toBe('%PDF');
  });
});


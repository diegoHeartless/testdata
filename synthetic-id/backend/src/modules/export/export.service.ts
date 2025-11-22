import { Injectable } from '@nestjs/common';
import PDFDocument = require('pdfkit');
import type PDFKit from 'pdfkit';
import { Profile } from '../../types';

type SectionRow = [string, string | number | undefined | null];

@Injectable()
export class ExportService {
  toJSON(profile: Profile): Profile {
    return profile;
  }

  /**
   * Генерирует PDF-документ с данными профиля.
   */
  async toPDF(profile: Profile): Promise<Buffer> {
    return new Promise<Buffer>((resolve, reject) => {
      const doc = new PDFDocument({ size: 'A4', margin: 50 });
      const chunks: Buffer[] = [];

      doc.on('data', (chunk: Buffer) => chunks.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(chunks)));
      doc.on('error', reject);

      this.renderHeader(doc, profile);
      this.renderSection(doc, 'Персональные данные', [
        ['ФИО', this.composeFullName(profile)],
        ['Пол', profile.personal.gender === 'male' ? 'Мужской' : 'Женский'],
        ['Дата рождения', this.formatDate(profile.personal.birth_date)],
        ['Возраст', profile.personal.age?.toString()],
        ['Место рождения', profile.personal.birth_place],
      ]);

      this.renderSection(doc, 'Адрес', [
        ['Регион', `${profile.address.region} — ${profile.address.region_name}`],
        ['Город', profile.address.city],
        ['Улица', profile.address.street],
        ['Дом', profile.address.house],
        ['Квартира', profile.address.apartment],
        ['Почтовый индекс', profile.address.postal_code],
      ]);

      if (profile.passport) {
        this.renderSection(doc, 'Паспорт', [
          ['Серия и номер', `${profile.passport.series} ${profile.passport.number}`.trim()],
          ['Кем выдан', profile.passport.issued_by],
          ['Код подразделения', profile.passport.division_code],
          ['Дата выдачи', this.formatDate(profile.passport.issue_date)],
        ]);
      }

      this.renderSection(doc, 'Документы', [
        ['ИНН', profile.inn],
        ['СНИЛС', profile.snils],
        ['Водительское удостоверение', profile.driver_license ? `${profile.driver_license.series} ${profile.driver_license.number}` : undefined],
        [
          'Категории ВУ',
          profile.driver_license?.categories?.length ? profile.driver_license.categories.join(', ') : undefined,
        ],
        ['Полис ОМС', profile.oms?.number],
      ]);

      doc.end();
    });
  }

  private renderHeader(doc: PDFKit.PDFDocument, profile: Profile): void {
    doc.font('Helvetica-Bold').fontSize(20).text('Synthetic ID Generator', { align: 'center' });
    doc.moveDown(0.2);
    doc.font('Helvetica').fontSize(14).text('Отчёт по профилю', { align: 'center' });
    doc.moveDown();

    doc.font('Helvetica').fontSize(10);
    doc.fillColor('#6B7280');
    doc.text(`ID профиля: ${profile.id}`);
    doc.text(`Создан: ${this.formatDate(profile.created_at) ?? '—'}`);
    doc.text(`Действителен до: ${this.formatDate(profile.expires_at) ?? '—'}`);
    doc.moveDown();

    const { x, y } = doc;
    doc.moveTo(x, y).lineTo(doc.page.width - doc.page.margins.right, y).stroke('#E5E7EB');
    doc.moveDown();
    doc.fillColor('#111827');
  }

  private renderSection(doc: PDFKit.PDFDocument, title: string, rows: SectionRow[]): void {
    const meaningfulRows = rows
      .map<SectionRow>((row) => [row[0], this.normalizeValue(row[1])])
      .filter(([, value]) => Boolean(value));

    if (!meaningfulRows.length) {
      return;
    }

    doc.moveDown(0.4);
    doc.font('Helvetica-Bold').fontSize(12).text(title.toUpperCase());
    doc.moveDown(0.2);
    doc.font('Helvetica').fontSize(11);

    meaningfulRows.forEach(([label, value]) => {
      doc.text(`${label}: ${value}`);
    });
  }

  private composeFullName(profile: Profile): string {
    const { personal } = profile;
    return [personal.last_name, personal.first_name, personal.middle_name].filter(Boolean).join(' ');
  }

  private normalizeValue(value: string | number | undefined | null): string | undefined {
    if (value === undefined || value === null) {
      return undefined;
    }
    if (typeof value === 'number') {
      return value.toString();
    }
    const trimmed = value.trim();
    return trimmed.length ? trimmed : undefined;
  }

  private formatDate(input?: string): string | undefined {
    if (!input) {
      return undefined;
    }
    const parsed = new Date(input);
    if (Number.isNaN(parsed.getTime())) {
      return input;
    }
    return parsed.toISOString().split('T')[0];
  }
}


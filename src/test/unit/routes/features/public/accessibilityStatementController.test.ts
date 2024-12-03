import request from 'supertest';
import {app} from '../../../../../main/app';
import {ACCESSIBILITY_STATEMENT_URL} from 'routes/urls';
import {t} from 'i18next';

describe('Accessibility Statement page', () => {
  describe('on GET', () => {
    it('should show page content', async () => {
      await request(app)
        .get(ACCESSIBILITY_STATEMENT_URL)
        .expect((res) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain(t('PAGES.ACCESSIBILITY_STATEMENT.TITLE'));
          expect(res.text).toContain(t('PAGES.ACCESSIBILITY_STATEMENT.TITLE'));
          expect(res.text).toContain(t('PAGES.ACCESSIBILITY_STATEMENT.PARAGRAPH_AS_1'));
          expect(res.text).toContain(t('PAGES.ACCESSIBILITY_STATEMENT.PARAGRAPH_AS_1_LINK'));
          expect(res.text).toContain(t('PAGES.ACCESSIBILITY_STATEMENT.PARAGRAPH_AS_2_CARM'));
          expect(res.text).toContain(t('PAGES.ACCESSIBILITY_STATEMENT.PARAGRAPH_AS_3'));
          expect(res.text).toContain(t('PAGES.ACCESSIBILITY_STATEMENT.PARAGRAPH_AS_4'));
          expect(res.text).toContain(t('PAGES.ACCESSIBILITY_STATEMENT.PARAGRAPH_AS_5'));
          expect(res.text).toContain(t('PAGES.ACCESSIBILITY_STATEMENT.PARAGRAPH_AS_6'));
          expect(res.text).toContain(t('PAGES.ACCESSIBILITY_STATEMENT.PARAGRAPH_AS_7'));
          expect(res.text).toContain(t('PAGES.ACCESSIBILITY_STATEMENT.PARAGRAPH_AS_8'));
          expect(res.text).toContain(t('PAGES.ACCESSIBILITY_STATEMENT.PARAGRAPH_AS_9'));
          expect(res.text).toContain(t('PAGES.ACCESSIBILITY_STATEMENT.PARAGRAPH_AS_10_LINK'));
          expect(res.text).toContain(t('PAGES.ACCESSIBILITY_STATEMENT.PARAGRAPH_AS_10'));
          expect(res.text).toContain(t('PAGES.ACCESSIBILITY_STATEMENT.PARAGRAPH_HOW_1'));
          expect(res.text).toContain(t('PAGES.ACCESSIBILITY_STATEMENT.PARAGRAPH_HOW_2_CARM'));
          expect(res.text).toContain(t('PAGES.ACCESSIBILITY_STATEMENT.PARAGRAPH_HOW_3'));
          expect(res.text).toContain(t('PAGES.ACCESSIBILITY_STATEMENT.PARAGRAPH_HOW_4'));
          expect(res.text).toContain(t('PAGES.ACCESSIBILITY_STATEMENT.PARAGRAPH_HOW_5'));
          expect(res.text).toContain(t('PAGES.ACCESSIBILITY_STATEMENT.PARAGRAPH_FEEDBACK_1'));
          expect(res.text).toContain(t('PAGES.ACCESSIBILITY_STATEMENT.PARAGRAPH_FEEDBACK_3'));
          expect(res.text).toContain(t('PAGES.ACCESSIBILITY_STATEMENT.PARAGRAPH_FEEDBACK_4'));
          expect(res.text).toContain(t('PAGES.ACCESSIBILITY_STATEMENT.PARAGRAPH_FEEDBACK_5'));
          expect(res.text).toContain(t('PAGES.ACCESSIBILITY_STATEMENT.EMAIL_TITLE'));
          expect(res.text).toContain(t('PAGES.ACCESSIBILITY_STATEMENT.EMAIL'));
          expect(res.text).toContain(t('PAGES.ACCESSIBILITY_STATEMENT.EMAIL'));
          expect(res.text).toContain(t('PAGES.ACCESSIBILITY_STATEMENT.TELEPHONE_TITLE'));
          expect(res.text).toContain(t('PAGES.ACCESSIBILITY_STATEMENT.TELEPHONE'));
          expect(res.text).toContain(t('PAGES.ACCESSIBILITY_STATEMENT.MONDAY_TO_FRIDAY'));
          expect(res.text).toContain(t('PAGES.ACCESSIBILITY_STATEMENT.FIND_OUT'));
          expect(res.text).toContain(t('PAGES.ACCESSIBILITY_STATEMENT.FIND_OUT'));
          expect(res.text).toContain(t('PAGES.ACCESSIBILITY_STATEMENT.PARAGRAPH_REPORTING_3'));
          expect(res.text).toContain(t('PAGES.ACCESSIBILITY_STATEMENT.PARAGRAPH_REPORTING_4'));
          expect(res.text).toContain(t('PAGES.ACCESSIBILITY_STATEMENT.PARAGRAPH_ENFORCEMENT_1'));
          expect(res.text).toContain(t('PAGES.ACCESSIBILITY_STATEMENT.PARAGRAPH_ENFORCEMENT_2'));
          expect(res.text).toContain(t('PAGES.ACCESSIBILITY_STATEMENT.PARAGRAPH_ENFORCEMENT_3'));
          expect(res.text).toContain(t('PAGES.ACCESSIBILITY_STATEMENT.PARAGRAPH_TECHNICAL_1'));
          expect(res.text).toContain(t('PAGES.ACCESSIBILITY_STATEMENT.PARAGRAPH_TECHNICAL_2'));
          expect(res.text).toContain(t('PAGES.ACCESSIBILITY_STATEMENT.PARAGRAPH_COMPLIANCE_1'));
          expect(res.text).toContain(t('PAGES.ACCESSIBILITY_STATEMENT.PARAGRAPH_COMPLIANCE_2'));
          expect(res.text).toContain(t('PAGES.ACCESSIBILITY_STATEMENT.PARAGRAPH_COMPLIANCE_3'));
          expect(res.text).toContain(t('PAGES.ACCESSIBILITY_STATEMENT.PARAGRAPH_COMPLIANCE_4'));
          expect(res.text).toContain(t('PAGES.ACCESSIBILITY_STATEMENT.PARAGRAPH_NON_ACCESIBLE_1'));
          expect(res.text).toContain(t('PAGES.ACCESSIBILITY_STATEMENT.PARAGRAPH_NON_ACCESIBLE_2'));
          expect(res.text).toContain(t('PAGES.ACCESSIBILITY_STATEMENT.PARAGRAPH_NON_ACCESIBLE_3'));
          expect(res.text).toContain(t('PAGES.ACCESSIBILITY_STATEMENT.PARAGRAPH_NON_ACCESIBLE_6'));
          expect(res.text).toContain(t('PAGES.ACCESSIBILITY_STATEMENT.PARAGRAPH_NON_ACCESIBLE_7'));
          expect(res.text).toContain(t('PAGES.ACCESSIBILITY_STATEMENT.PARAGRAPH_NON_ACCESIBLE_8'));
          expect(res.text).toContain(t('PAGES.ACCESSIBILITY_STATEMENT.PARAGRAPH_TESTED_1'));
          expect(res.text).toContain(t('PAGES.ACCESSIBILITY_STATEMENT.PARAGRAPH_TESTED_5'));
          expect(res.text).toContain(t('PAGES.ACCESSIBILITY_STATEMENT.PARAGRAPH_TESTED_6'));
          expect(res.text).toContain(t('PAGES.ACCESSIBILITY_STATEMENT.PARAGRAPH_IMPROVE_1'));
          expect(res.text).toContain(t('PAGES.ACCESSIBILITY_STATEMENT.PARAGRAPH_IMPROVE_4'));
          expect(res.text).toContain(t('PAGES.ACCESSIBILITY_STATEMENT.PARAGRAPH_IMPROVE_5'));
          expect(res.text).toContain(t('PAGES.ACCESSIBILITY_STATEMENT.PARAGRAPH_IMPROVE_6'));
          expect(res.text).toContain(t('PAGES.ACCESSIBILITY_STATEMENT.PARAGRAPH_PREPARATION_1'));
          expect(res.text).toContain(t('PAGES.ACCESSIBILITY_STATEMENT.PARAGRAPH_PREPARATION_3'));
        });
    });
  });
});

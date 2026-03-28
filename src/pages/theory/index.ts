/**
 * Theory Section Barrel Export
 */

export { TheorySection } from './TheorySection';

export {
  TheoryNavigation,
  TheoryIntroSection,
  TheoryConsumersSection,
  TheoryPersonnelSection,
  TheoryAttestationSection,
  TheoryNormsSection,
  TheoryWarning,
} from './components';

export type {
  TheorySectionItem,
  TheoryNavigationProps,
  TheoryWarningProps,
} from './types';

export {
  isExternalUrl,
  formatOrderName,
  getSectionIcon,
} from './utils';

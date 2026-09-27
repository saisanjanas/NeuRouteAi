// Central translation resource loader.
// Rule from the project doc: adding a language = adding a JSON file here,
// never branching business logic per language. Falls back to English
// when a key is missing.
import en from './en.json';
import hi from './hi.json';
import as from './as.json';
import bn from './bn.json';

export const SUPPORTED_LANGUAGES = [
  { code: 'en', label: 'English' },
  { code: 'hi', label: 'हिन्दी' },
  { code: 'as', label: 'অসমীয়া' },
  { code: 'bn', label: 'বাংলা' },
];

const resources = { en, hi, as, bn };

// Looks up "home.title" style dotted keys, falling back to English,
// then to the key itself so a missing translation never crashes the UI.
export function translate(languageCode, key) {
  const lookup = (dict) =>
    key.split('.').reduce((obj, part) => (obj ? obj[part] : undefined), dict);

  return lookup(resources[languageCode]) ?? lookup(resources.en) ?? key;
}

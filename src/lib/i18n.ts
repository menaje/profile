/**
 * i18n 유틸리티 — locale 상수, OG locale 매핑, 헬퍼 함수
 *
 * astro:i18n 가상 모듈은 .astro 파일에서 직접 import.
 * 이 모듈은 순수 TypeScript 헬퍼만 제공.
 */

export const SUPPORTED_LOCALES = ["ko", "en"] as const;
export const DEFAULT_LOCALE = "ko" as const;
export type Locale = (typeof SUPPORTED_LOCALES)[number];

const ogLocaleMap: Record<Locale, string> = {
  ko: "ko_KR",
  en: "en_US",
};

/** 로케일 코드를 Open Graph locale 문자열로 변환 */
export function getOgLocale(locale: string): string {
  return ogLocaleMap[locale as Locale] ?? ogLocaleMap[DEFAULT_LOCALE];
}

/** 현재 로케일을 제외한 대체 로케일 배열 반환 */
export function getAlternateLocales(currentLocale: string): Locale[] {
  return SUPPORTED_LOCALES.filter((l) => l !== currentLocale);
}

/** 기본 로케일 여부 확인 */
export function isDefaultLocale(locale: string): boolean {
  return locale === DEFAULT_LOCALE;
}

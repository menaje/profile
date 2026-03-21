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

/**
 * 현재 공개된 경로 기준으로 인덱싱 가능한 locale 집합을 반환
 *
 * 현 시점에는 영문 페이지가 `/en/` placeholder(noindex)만 존재하므로,
 * SEO용 hreflang은 한국어 공개 경로에만 노출한다.
 */
export function getIndexableLocalesForPath(_pathname: string): Locale[] {
  return [DEFAULT_LOCALE];
}

/** 기본 로케일 여부 확인 */
export function isDefaultLocale(locale: string): boolean {
  return locale === DEFAULT_LOCALE;
}

import type { Locale } from "./i18n";

const translations = {
  nav: {
    about: { ko: "소개", en: "About" },
    projects: { ko: "프로젝트", en: "Projects" },
    resume: { ko: "이력서", en: "Resume" },
    blog: { ko: "블로그", en: "Blog" },
    contact: { ko: "연락처", en: "Contact" },
    mainNav: { ko: "메인 내비게이션", en: "Main navigation" },
    footerNav: { ko: "푸터 내비게이션", en: "Footer navigation" },
    menuOpen: { ko: "메뉴 열기", en: "Open menu" },
    menuClose: { ko: "메뉴 닫기", en: "Close menu" },
    goHome: { ko: "홈으로 이동", en: "Go to home" },
    browse: { ko: "둘러보기", en: "Browse" },
    social: { ko: "소셜", en: "Social" },
  },
  theme: {
    label: { ko: "테마 선택", en: "Choose theme" },
    light: { ko: "라이트 모드", en: "Light mode" },
    system: { ko: "시스템 설정 따르기", en: "Follow system" },
    dark: { ko: "다크 모드", en: "Dark mode" },
  },
  a11y: {
    skipToContent: { ko: "본문으로 건너뛰기", en: "Skip to content" },
    githubProfile: {
      ko: "GitHub 프로필 새 탭에서 열기",
      en: "Open GitHub profile in new tab",
    },
    linkedinProfile: {
      ko: "LinkedIn 프로필 새 탭에서 열기",
      en: "Open LinkedIn profile in new tab",
    },
  },
  common: {
    contactCta: { ko: "연락하기", en: "Contact" },
    viewProjects: { ko: "프로젝트 보기", en: "View projects" },
  },
  domain: {
    constructionCm: { ko: "건설 CM", en: "Construction CM" },
    aiIt: { ko: "AI / IT", en: "AI / IT" },
    personal: { ko: "개인", en: "Personal" },
    company: { ko: "회사", en: "Company" },
    openSource: { ko: "오픈소스", en: "Open Source" },
    personalProject: { ko: "개인 프로젝트", en: "Personal Project" },
    ongoing: { ko: "진행 중", en: "Ongoing" },
    completed: { ko: "완료", en: "Completed" },
  },
  blog: {
    rssTitle: { ko: "김성식 블로그 RSS", en: "Seongsik Kim Blog RSS" },
  },
} as const;

type TranslationKey = typeof translations;

/**
 * Get a translated string by dot-path key.
 * Falls back to Korean if the locale is not found.
 */
export function t(
  locale: Locale,
  section: keyof TranslationKey,
  key: string,
): string {
  const sectionData = translations[section] as Record<
    string,
    Record<Locale, string>
  >;
  const entry = sectionData[key];
  if (!entry) return key;
  return entry[locale] ?? entry.ko;
}

/**
 * Create a locale-bound translator for convenience.
 */
export function useTranslations(locale: Locale) {
  return (section: keyof TranslationKey, key: string) =>
    t(locale, section, key);
}

export { translations };

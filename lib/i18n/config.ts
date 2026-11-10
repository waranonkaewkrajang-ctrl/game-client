"use client";
import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";
import th from "./th.json";
import en from "./en.json";
import zh from "./zh.json";
import vi from "./vi.json";
import km from "./km.json";
import lo from "./lo.json";
import id from "./id.json";
import my from "./my.json";
import tl from "./tl.json";

const resources = {
  th: { translation: th },
  en: { translation: en },
  zh: { translation: zh },
  vi: { translation: vi },
  km: { translation: km },
  lo: { translation: lo },
  id: { translation: id },
  my: { translation: my },
  tl: { translation: tl },
};

if (i18n.isInitialized) {
  // module re-evaluated (dev hot reload after a dictionary edit): the singleton keeps its old resources,
  // so newly added keys would render as raw keys — refresh every bundle in place
  for (const [lng, { translation }] of Object.entries(resources)) {
    i18n.addResourceBundle(lng, "translation", translation, true, true);
  }
  void i18n.changeLanguage(i18n.language);
} else {
  i18n
    .use(LanguageDetector)
    .use(initReactI18next)
    .init({
      resources,
      fallbackLng: "th",
      detection: {
        order: ["cookie", "localStorage", "navigator"],
        caches: ["cookie", "localStorage"],
      },
      interpolation: {
        escapeValue: false,
      },
    });
}

export default i18n;
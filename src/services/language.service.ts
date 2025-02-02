import { Injectable } from '@angular/core';
import { LangChangeEvent, TranslateService } from '@ngx-translate/core';
import { take } from 'rxjs/operators';
import { ReplaySubject } from 'rxjs';
import { LocalStorageService } from 'ngx-webstorage';

@Injectable({
    providedIn: 'root'
  })
  export class LanguageService {
  language$ = new ReplaySubject<LangChangeEvent>(1);
  translate: TranslateService;
  languageSet: Set<string> = new Set();
  currentLang = 'en';

  constructor(
    private translateService: TranslateService,
    private storage: LocalStorageService
  ) {
    this.translate = this.translateService;

    this.languageSet.add('bg');
    this.languageSet.add('cs');
    this.languageSet.add('da');
    this.languageSet.add('de');
    this.languageSet.add('el');
    this.languageSet.add('en');
    this.languageSet.add('es');
    this.languageSet.add('fi');
    this.languageSet.add('fr');
    this.languageSet.add('hr');
    this.languageSet.add('hu');
    this.languageSet.add('it');
    this.languageSet.add('ja');
    this.languageSet.add('ko');
    this.languageSet.add('nl');
    this.languageSet.add('nb');
    this.languageSet.add('pl');
    this.languageSet.add('pt');
    this.languageSet.add('ro');
    this.languageSet.add('ru');
    this.languageSet.add('sk');
    this.languageSet.add('sl');
    this.languageSet.add('sv');
    this.languageSet.add('tr');
    this.languageSet.add('uk');
    this.languageSet.add('zh-cn');
    this.languageSet.add('zh-tw');
  }

  setInitState(): void {
    const savedLanguage = this.savedLanguage;
    if (savedLanguage !== undefined && savedLanguage !== null) {
      this.setLang(savedLanguage);
    } else {
      const browserLang = this.getBrowserLang();
      this.setLang(browserLang);
    }
  }

  getBrowserLang(cul?: string, l?: string): string {
    const lang_cul = cul || this.translate.getBrowserCultureLang()?.toLocaleLowerCase() || 'en';
    var lang = l || this.translate.getBrowserLang()?.toLocaleLowerCase() || 'en';
    console.log(`lang_cul / lang: ${lang_cul} / ${lang}`);
    if (this.languageSet.has(lang_cul))
      return lang_cul;
    if (lang == 'zh')
      lang = 'zh-tw';
    if (this.languageSet.has(lang))
      return lang;
    return 'en';
  }

  setLang(lang: string): void {
    this.translateService.onLangChange.pipe(take(1)).subscribe(result => {
      this.language$.next(result);
      this.currentLang = result.lang;
    });
    this.translateService.use(lang);
  }

  setLang2(lang: string): void {
    const s = lang.toLocaleLowerCase().split('-');
    const langLower = lang.toLocaleLowerCase();
    console.log(s);
    const browserLang = this.getBrowserLang(langLower, s[0]);
    this.setLang(browserLang);
  }

  set savedLanguage(lang: string) {
    this.storage.store('SavedLanguage', lang);
  }

  get savedLanguage() {
    return this.storage.retrieve('SavedLanguage');
  }
}

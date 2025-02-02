import { Injectable } from '@angular/core';
import { MatIconRegistry } from '@angular/material/icon';
import { DomSanitizer } from '@angular/platform-browser';

@Injectable({
  providedIn: 'root',
})
export class IconService {
  constructor(
    private matIconRegistry: MatIconRegistry,
    private domSanitizer: DomSanitizer
  ) {}
  Iconinit() {
    this.matIconRegistry.addSvgIconInNamespace(
      'icon',
      'explore_left',
      this.domSanitizer.bypassSecurityTrustResourceUrl(
        'assets/icons/svg/icon_explore_left.svg'
      )
    );
    this.matIconRegistry.addSvgIconInNamespace(
      'icon',
      'explore_right',
      this.domSanitizer.bypassSecurityTrustResourceUrl(
        'assets/icons/svg/icon_explore_right.svg'
      )
    );
    this.matIconRegistry.addSvgIconInNamespace(
      'icon',
      'widget',
      this.domSanitizer.bypassSecurityTrustResourceUrl(
        'assets/icons/svg/icon_widget.svg'
      )
    );
    this.matIconRegistry.addSvgIconInNamespace(
      'icon',
      'back',
      this.domSanitizer.bypassSecurityTrustResourceUrl(
        'assets/icons/svg/icon_back.svg'
      )
    );
    this.matIconRegistry.addSvgIconInNamespace(
      'icon',
      'back_hover',
      this.domSanitizer.bypassSecurityTrustResourceUrl(
        'assets/icons/svg/icon_back_hover.svg'
      )
    );
    this.matIconRegistry.addSvgIconInNamespace(
      'icon',
      'loading',
      this.domSanitizer.bypassSecurityTrustResourceUrl(
        'assets/icons/svg/icon_pageLoading.svg'
      )
    );
  }
}

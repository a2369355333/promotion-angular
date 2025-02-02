import { Component, HostListener, OnInit } from '@angular/core';
import {
  DataService,
  ZoneADetail,
  ZoneADetailContentItem,
  ZoneAType,
  ZoneBType,
  ZoneCDetail,
  ZoneCDetailContentItem,
  ZoneCType,
} from '../../../services/data.service';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { IconService } from '../../../services/icon.service';

enum Visible_Status {
  major,
  second,
  hide,
}

interface Carousel_Info extends ZoneAType {
  visibleStatus: Visible_Status;
  id?: string;
}

@Component({
  standalone: false,
  selector: 'app-content',
  templateUrl: './content.component.html',
  styleUrl: './content.component.scss',
})
export class ContentComponent implements OnInit {
  sectionA: ZoneAType[] = [];
  sectionB: ZoneBType[] = [];
  sectionC: ZoneCType[] = [];
  isShowingDetailA: boolean = false;
  isShowingDetailC: boolean = false;
  isLoading: any = { sectionA: true, sectionB: true, sectionC: true };
  //sectionA
  sectionAIdx: number = 0;
  slideshowInterval: any;
  focusIdx: number = 0;
  currentIdx: number = 0;
  carousel: ZoneAType[] = [];
  displayCarousel: Carousel_Info[] = [];
  transition: string =
    'opacity 1s ease, width 1s linear, padding-left 0.6s ease, padding-right 0.6s ease';
  isAnimating: boolean = false;
  selectedSectionA: ZoneAType = {} as ZoneAType;
  selectedDetailA: ZoneADetail = {} as ZoneADetail;
  selectedDetailAContent: ZoneADetailContentItem[] = [];
  windowWidth: number = 0;
  majorWidth: string = '';
  secondWidth: string = '';
  //sectionB
  showAppsCount: number = 6;
  //detailC
  selectedSectionC: ZoneCType = {} as ZoneCType;
  selectedDetailC: ZoneCDetail = {} as ZoneCDetail;
  selectedDetailCHtmlUrl: SafeResourceUrl | string = '';
  selectedDetailCContent: ZoneCDetailContentItem[] = [];
  restDetailC: ZoneCType[] = [];
  randomDetailC: ZoneCType = {} as ZoneCType;
  showDetailsCount: number = 4;
  backBtnHoverIdx: number = -1;
  videoUrl: SafeResourceUrl | string = '';
  currentLang: string = 'en';

  constructor(
    private dataService: DataService,
    private iconService: IconService,
    public sanitizer: DomSanitizer
  ) {
    this.iconService.Iconinit();
  }

  @HostListener('window:resize', ['$event'])
  onResize() {
    this.windowWidth = window.innerWidth;

    if (this.windowWidth >= 784) {
      const c = this.displayCarousel;
      if (this.focusIdx == c.length - 2) {
        this.onTransitionEnd(this.focusIdx + 1);
      } else if (this.focusIdx == 1) {
        this.onTransitionEnd(this.focusIdx - 1);
      }
    }
  }

  @HostListener('window:visibilitychange', ['$event'])
  onVisibilityChange() {
    if (document.visibilityState === 'hidden') {
      if (this.slideshowInterval) {
        clearInterval(this.slideshowInterval);
      }
    } else {
      if (!this.isShowingDetailA && !this.isShowingDetailC)
        this.setSlideshowInterval();
    }
  }

  ngOnInit(): void {
    this.windowWidth = window.innerWidth;

    this.dataService.getZoneAData().subscribe((d) => {
      this.isLoading.sectionA = false;
      this.sectionA = this.filterSingleSection(d);
      this.getCarousel();
    });

    this.dataService.getZoneBData().subscribe((d) => {
      this.isLoading.sectionB = false;
      this.sectionB = this.filterSingleSection(d);
    });

    this.dataService.getZoneCData().subscribe((d) => {
      this.isLoading.sectionC = false;
      this.sectionC = this.filterSingleSection(d);
    });
  }

  ngAfterViewInit() {
    this.setSlideshowInterval();
  }

  ngOnDestroy() {
    if (this.slideshowInterval) {
      clearInterval(this.slideshowInterval);
    }
  }

  filterSingleSection(d: ZoneAType[] | ZoneBType[] | ZoneCType[]) {
    return d.map((item) => {
      const newItem: any = { ...item };
      Object.entries(item).forEach(([key, value]) => {
        if (typeof value === 'object') {
          if (value[this.currentLang]) {
            newItem[key] = value[this.currentLang];
          } else if (value['en']) {
            newItem[key] = value['en'];
          } else if (Object.keys(value).length == 0) {
            delete newItem[key];
          }
        }
      });
      return newItem;
    });
  }

  filterSingleDetail(d: ZoneADetail | ZoneCDetail) {
    const detail: Record<string, any> = { ...d };
    Object.entries(detail).forEach(([key, value]) => {
      if (typeof value === 'object') {
        if (value[this.currentLang]) {
          detail[key] = value[this.currentLang];
        } else if (value['en']) {
          detail[key] = value['en'];
        } else if (Object.keys(value).length == 0) {
          delete detail[key];
        }
      }
      if (Array.isArray(value)) {
        value.forEach((item, idx) => {
          Object.entries(item).forEach(([key2, value2]: [string, any]) => {
            if (typeof value2 === 'object') {
              if (value2[this.currentLang]) {
                detail[key][idx][key2] = value2[this.currentLang];
              } else if (value2['en']) {
                detail[key][idx][key2] = value2['en'];
              } else if (Object.keys(value2).length == 0) {
                delete detail[key][idx][key2];
              }
            }
          });
        });
      }
    });
    return detail;
  }

  backToContentPage() {
    this.setSlideshowInterval();
    this.isShowingDetailC = false;
    this.isShowingDetailA = false;
    this.showAppsCount = 6;
    this.showDetailsCount = 4;
    this.backBtnHoverIdx = -1;
  }

  //section A
  setSlideshowInterval() {
    if (this.slideshowInterval) clearInterval(this.slideshowInterval);
    this.slideshowInterval = setInterval(() => {
      this.onCarousel(1);
    }, 5000);
  }

  openDetailA(detail: Carousel_Info) {
    if (detail.visibleStatus === Visible_Status.major) {
      if (this.isAnimating) return;

      this.selectedSectionA = detail;
      this.selectedDetailA = this.filterSingleDetail(
        this.selectedSectionA.detail
      ) as ZoneADetail;
      this.selectedDetailAContent = this.selectedDetailA.content;
      clearInterval(this.slideshowInterval);
      this.isShowingDetailA = true;
      const videoInfo = this.selectedDetailAContent.find(
        (item) => item.template === 'video'
      );
      if (videoInfo?.video) {
        this.videoUrl = this.sanitizer.bypassSecurityTrustResourceUrl(
          videoInfo.video
        );
      }
    }
  }

  getCarousel() {
    this.sectionA.forEach((item, index) => {
      let visibleStatus: Visible_Status;

      if (this.sectionA.length >= 2) {
        if (index === 1) visibleStatus = Visible_Status.second;
        else if (index === 0) visibleStatus = Visible_Status.major;
        else visibleStatus = Visible_Status.hide;
      } else {
        //for one carousel
        visibleStatus = Visible_Status.major;
      }

      const carouselItem = {
        ...item,
        visibleStatus: visibleStatus,
      };
      this.carousel.push(carouselItem);
    });

    if (this.carousel.length == 1) {
      // for one carousels design
      const clonedItemFirst = JSON.parse(JSON.stringify(this.carousel[0]));
      const carousel = JSON.parse(JSON.stringify(this.carousel));
      carousel.push({
        ...clonedItemFirst,
        visibleStatus: Visible_Status.second,
      });
      carousel.push({ ...clonedItemFirst, visibleStatus: Visible_Status.hide });

      const clonedThree = JSON.parse(JSON.stringify(carousel));
      const lastThree = clonedThree.slice(-3).map((item: any, idx: number) => {
        if (idx === 0) {
          return { ...item, visibleStatus: Visible_Status.hide, id: 'first' };
        }
        if (idx === 2) {
          return { ...item, visibleStatus: Visible_Status.second };
        }
        return { ...item, visibleStatus: Visible_Status.hide };
      });

      const firstThree = clonedThree
        .slice(0, 3)
        .map((item: any, idx: number, array: any) => {
          if (idx === array.length - 1) {
            return { ...item, visibleStatus: Visible_Status.hide, id: 'last' };
          }
          return { ...item, visibleStatus: Visible_Status.hide };
        });

      this.displayCarousel = [
        ...lastThree,
        ...carousel,
        ...firstThree,
      ] as Carousel_Info[];
    } else if (this.carousel.length == 2) {
      // for two carousels design
      const clonedItemFirst = JSON.parse(JSON.stringify(this.carousel[0]));
      const clonedItemSecond = JSON.parse(JSON.stringify(this.carousel[1]));
      const carousel = JSON.parse(JSON.stringify(this.carousel));
      carousel.push({ ...clonedItemFirst, visibleStatus: Visible_Status.hide });

      const clonedThree = JSON.parse(JSON.stringify(carousel));
      clonedThree.shift();
      clonedThree.push(clonedItemSecond);

      const lastThree = clonedThree.slice(-3).map((item: any, idx: number) => {
        if (idx === 0) {
          return { ...item, visibleStatus: Visible_Status.hide, id: 'first' };
        }
        if (idx === 2) {
          return { ...item, visibleStatus: Visible_Status.second };
        }
        return { ...item, visibleStatus: Visible_Status.hide };
      });

      const firstThree = clonedThree
        .slice(0, 3)
        .map((item: any, idx: number, array: any) => {
          if (idx === array.length - 1) {
            return { ...item, visibleStatus: Visible_Status.hide, id: 'last' };
          }
          return { ...item, visibleStatus: Visible_Status.hide };
        });

      this.displayCarousel = [
        ...lastThree,
        ...carousel,
        ...firstThree,
      ] as Carousel_Info[];
    } else {
      // for more than three carousels design
      const lastThree = this.carousel.slice(-3).map((item, idx) => {
        if (idx === 0) {
          return { ...item, visibleStatus: Visible_Status.hide, id: 'first' };
        }
        if (idx === 2) {
          return { ...item, visibleStatus: Visible_Status.second };
        }
        return { ...item, visibleStatus: Visible_Status.hide };
      });

      const firstThree = this.carousel.slice(0, 3).map((item, idx, array) => {
        if (idx === array.length - 1) {
          return { ...item, visibleStatus: Visible_Status.hide, id: 'last' };
        }
        return { ...item, visibleStatus: Visible_Status.hide };
      });

      this.displayCarousel = [
        ...lastThree,
        ...this.carousel,
        ...firstThree,
      ] as Carousel_Info[];
    }
  }

  onCarousel(d: number, force?: boolean) {
    if (this.isAnimating) return;
    const c = this.displayCarousel;
    this.transition =
      this.windowWidth >= 784
        ? 'opacity 1s ease, width 1s linear, padding-left 0.6s ease, padding-right 0.6s ease'
        : 'none';
    this.focusIdx = force
      ? d
      : c.findIndex((v) => v.visibleStatus == Visible_Status.major);

    if (force) {
      c.forEach((v) => (v.visibleStatus = Visible_Status.hide));
      c[this.focusIdx - 1].visibleStatus = Visible_Status.second;
      c[this.focusIdx].visibleStatus = Visible_Status.major;
      c[this.focusIdx + 1].visibleStatus = Visible_Status.second;
    } else {
      if (d == 0) {
        // left switch 1 step
        if (this.windowWidth < 784 && this.focusIdx === 1) {
          if (this.carousel.length >= 3 || this.carousel.length == 1)
            this.focusIdx = c.length - 5;
          else if (this.carousel.length == 2) this.focusIdx = c.length - 4;
        }

        c.forEach((v) => (v.visibleStatus = Visible_Status.hide));
        c[this.focusIdx].visibleStatus = Visible_Status.second;
        c[this.focusIdx - 1].visibleStatus = Visible_Status.major;
        if (this.focusIdx - 2 >= 0)
          c[this.focusIdx - 2].visibleStatus = Visible_Status.second;
      } else {
        // right switch 1 step
        if (this.windowWidth < 784 && this.focusIdx === c.length - 2) {
          if (this.carousel.length >= 3 || this.carousel.length == 1)
            this.focusIdx = 4;
          else if (this.carousel.length == 2) this.focusIdx = 3;
        }

        c.forEach((v) => (v.visibleStatus = Visible_Status.hide));
        c[this.focusIdx].visibleStatus = Visible_Status.second;
        c[this.focusIdx + 1].visibleStatus = Visible_Status.major;
        if (this.focusIdx + 2 <= c.length - 1)
          c[this.focusIdx + 2].visibleStatus = Visible_Status.second;
      }
    }
    this.setSlideshowInterval();
    this.getCurrentIdx(d, force);
  }

  onTransitionEnd(i: number) {
    const c = this.displayCarousel;
    const firstIdx = c.findIndex((v: any) => v.id === 'first');
    const lastIdx = c.findIndex((v: any) => v.id === 'last');

    if (i == firstIdx) {
      this.transition = 'none';
      c.forEach((v) => (v.visibleStatus = Visible_Status.hide));
      if (this.carousel.length >= 3 || this.carousel.length == 1) {
        c[c.length - 6].visibleStatus = Visible_Status.second;
        c[c.length - 5].visibleStatus = Visible_Status.major;
        c[c.length - 4].visibleStatus = Visible_Status.second;
      } else if (this.carousel.length == 2) {
        c[c.length - 5].visibleStatus = Visible_Status.second;
        c[c.length - 4].visibleStatus = Visible_Status.major;
        c[c.length - 3].visibleStatus = Visible_Status.second;
      }
    } else if (i == lastIdx) {
      this.transition = 'none';
      c.forEach((v) => (v.visibleStatus = Visible_Status.hide));
      if (this.carousel.length >= 3 || this.carousel.length == 1) {
        c[3].visibleStatus = Visible_Status.second;
        c[4].visibleStatus = Visible_Status.major;
        c[5].visibleStatus = Visible_Status.second;
      } else if (this.carousel.length == 2) {
        c[2].visibleStatus = Visible_Status.second;
        c[3].visibleStatus = Visible_Status.major;
        c[4].visibleStatus = Visible_Status.second;
      }
    }
  }

  getCurrentIdx(d?: number, force?: boolean) {
    this.focusIdx = force
      ? d ?? 0
      : this.displayCarousel.findIndex(
          (v) => v.visibleStatus == Visible_Status.major
        );
    const carouselLength = this.carousel.length;
    const displayLength = this.displayCarousel.length;

    if (carouselLength >= 3) {
      if (this.focusIdx < 3)
        this.currentIdx = (carouselLength - 3 + this.focusIdx) % carouselLength;
      else if (this.focusIdx >= displayLength - 3)
        this.currentIdx =
          (this.focusIdx - (displayLength - 3)) % carouselLength;
      else this.currentIdx = this.focusIdx - 3;
    } else if (this.carousel.length == 2) {
      // for two carousel
      if (this.focusIdx < 3 || this.focusIdx >= displayLength - 3) {
        if (this.focusIdx == 1 || this.focusIdx == displayLength - 2)
          this.currentIdx = 0;
        else this.currentIdx = 1;
      } else {
        if (this.focusIdx == 4) this.currentIdx = 1;
        else this.currentIdx = 0;
      }
    } else {
      // for one carousel
      this.currentIdx = 0;
    }
  }

  //section B
  openApp(detail: ZoneBType) {
    window.open('https://www.google.com', '_blank');
  }

  showMoreApps() {
    if (this.showAppsCount < this.sectionB.length) {
      this.showAppsCount += 6;
      if (this.showAppsCount >= this.sectionB.length)
        this.showAppsCount = this.sectionB.length;
    }
  }

  //section C
  openDetailC(detail: ZoneCType) {
    window.scrollTo({
      top: 0,
    });
    clearInterval(this.slideshowInterval);
    this.isShowingDetailC = true;
    this.selectedSectionC = detail;
    this.selectedDetailC = this.filterSingleDetail(
      this.selectedSectionC.detail
    ) as ZoneCDetail;
    this.selectedDetailCContent = this.selectedDetailC.content;
    this.restDetailC = this.sectionC
      .filter((item) => item !== detail)
      .sort(() => Math.random() - 0.5)
      .slice(0, 3);

    const videoInfo = this.selectedDetailCContent.find(
      (item) => item.template === 'video'
    );
    this.videoUrl = videoInfo?.video
      ? this.sanitizer.bypassSecurityTrustResourceUrl(videoInfo.video)
      : '';
  }

  showDetailC(detail: ZoneCType, idx: number) {
    window.scrollTo({
      top: 0,
    });
    const excludeRestDetailC = this.sectionC.filter(
      (item) => !this.restDetailC.includes(item)
    );
    const randomIdx = Math.floor(Math.random() * excludeRestDetailC.length);
    this.randomDetailC = excludeRestDetailC[randomIdx];
    this.restDetailC[idx] = this.randomDetailC;
    this.selectedSectionC = detail;
    this.selectedDetailC = this.filterSingleDetail(
      this.selectedSectionC.detail
    ) as ZoneCDetail;
    this.selectedDetailCContent = this.selectedDetailC.content;

    const videoInfo = this.selectedDetailCContent.find(
      (item) => item.template === 'video'
    );
    this.videoUrl = videoInfo?.video
      ? this.sanitizer.bypassSecurityTrustResourceUrl(videoInfo.video)
      : '';
  }

  showMoreDetails() {
    if (this.showDetailsCount < this.sectionC.length) {
      this.showDetailsCount += 6;
      if (this.showDetailsCount >= this.sectionC.length)
        this.showDetailsCount = this.sectionC.length;
    }
  }

  //Detail A
  async openBannerContent() {
    const hyperlinkInfo = this.selectedDetailAContent.find(
      (item) =>
        item.template === 'hyperlink' ||
        item.template === 'conditionalHyperlink'
    );

    if (hyperlinkInfo?.action && hyperlinkInfo.template === 'hyperlink') {
      const action = hyperlinkInfo.action;
      if(action.type === 'openSystemBrowser') {
        const url = action.parameter[0];
        window.open(url, '_blank');
      }
    } else if (hyperlinkInfo?.conditionalAction && hyperlinkInfo.template === 'conditionalHyperlink') {
      //conditional action
      const info = hyperlinkInfo.conditionalAction.find(v => v.action.type === 'openSystemBrowser');
      const url = info?.action.parameter[0];
      console.log(url)
      window.open(url, '_blank');
    }
  }

  //Detail C
  async openFeatureContent() {
    const hyperlinkInfo = this.selectedDetailCContent.find(
      (item) =>
        item.template === 'hyperlink' ||
        item.template === 'conditionalHyperlink'
    );
    if (hyperlinkInfo?.action) {
      const action = hyperlinkInfo.action;
      if(action.type === 'openSystemBrowser') {
        const url = action.parameter[0];
        window.open(url, '_blank');
      }
    }
  }
}

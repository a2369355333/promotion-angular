import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map } from 'rxjs/operators';
import { AsyncSubject, Observable } from 'rxjs';

export interface VisibilityValidator {
  type: string;
  parameter: any[];
  reverse?: boolean;
}

export interface Action {
  type: string;
  parameter: any[];
}

export interface ConditionalAction {
  action: Action;
  visibility: VisibilityValidator;
  reverse?: boolean;
}

export interface ZoneAType extends ZoneBase {
  provider?: string | Object;
  name?: string | Object;
  description: string | Object;
  icon?: string;
  image: string;
  tag: string;
  action: Action;
  detail: ZoneADetail;
  gaParameter?: string;
}

export interface ZoneADetail {
  type: string;
  image: string;
  title: string | Object;
  content: ZoneADetailContentItem[];
}

export interface ZoneADetailContentItem {
  template: string;
  title?: string | Object;
  text?: string | Object;
  image?: string;
  video?: string;
  url?: string;
  action?: Action;
  conditionalAction?: ConditionalAction[]
}

export interface ZoneBase {
  visibility?: VisibilityValidator;
}

export interface ZoneBType extends ZoneBase {
  provider: string | Object;
  name: string | Object;
  description: string | Object;
  icon: string;
  action: Action;
  gaParameter?: string;
}

export interface ZoneCDetailContentItem {
  template: string;
  title?: string | Object;
  text?: string | Object;
  image?: string;
  video?: string;
  url?: string;
  action?: Action;
  conditionalAction?: ConditionalAction[]
}

export interface ZoneCDetail {
  type: string;
  url?: string;
  title: string | Object;
  content: ZoneCDetailContentItem[];
}

export interface ZoneCType extends ZoneBase {
  description: string | Object;
  image: string;
  detail: ZoneCDetail;
  gaParameter?: string;
}

export interface DataSet {
  zoneA: ZoneAType[];
  zoneB: ZoneBType[];
  zoneC: ZoneCType[];
}

@Injectable({
  providedIn: 'root'
})
export class DataService {
  url: string = "/assets/dataSet.json";

  dataSetAsyncSubject = new AsyncSubject<DataSet>();

  constructor(
    private http: HttpClient,
  ) {
    this.http.get<DataSet>(`${this.url}?time=${Date.now().toString()}`).subscribe((v) => {
      this.dataSetAsyncSubject.next(v);
      this.dataSetAsyncSubject.complete();
    });
  }


  getZoneAData() {
    return this.dataSetAsyncSubject.pipe(map(data => data.zoneA));
  }

  getZoneBData(): Observable<ZoneBType[]> {
    return this.dataSetAsyncSubject.pipe(map(data => data.zoneB));
  }

  getZoneCData(): Observable<ZoneCType[]> {
    return this.dataSetAsyncSubject.pipe(map(data => data.zoneC));
  }

  getZoneAExcludeDetail() {
    return this.dataSetAsyncSubject.pipe(
      map(data => data.zoneA.map(({ detail, ...rest }) => rest))
    );
  }

  getNSLoadingAanimation(): Observable<any> {
    return this.http.get('assets/icons/json/loading72-NS.json');
  }
  getPSLoadingAanimation(): Observable<any> {
    return this.http.get('assets/icons/json/loading72-PS.json');
  }
}

import { Server } from './../../model/server.model';
import {
  selectServerList,
  selectServerArray,
  selectServerArrayLength
} from './../../state/app.state';
import { Component, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';
import { AppState } from '../../state/app.state';
import { LoadServers } from '../../state/actions/servers-actions';
import { Observable } from 'rxjs';
import { ServerList } from '../../model/server.model';
import { combineLatest, map } from 'rxjs/operators';
import { ServersDataSource } from '../../state/sources/servers-ds';
import { PageEvent } from '@angular/material';

@Component({
  selector: 'app-server-list',
  templateUrl: './server-list.component.html',
  styleUrls: ['./server-list.component.scss']
})
export class ServerListComponent implements OnInit {
  displayedColumns = ['name', 'hostname', 'port', 'url'];
  pageSizeOptions = [2, 3, 5];
  pageSize = 5;
  pageNumber = 0;
  numberOfServers$: Observable<number>;
  dataSource: ServersDataSource;

  constructor(private store: Store<AppState>) {
    this.store.dispatch(new LoadServers({}));
    this.dataSource = new ServersDataSource(this.store);
    this.numberOfServers$ = this.store.select(selectServerArrayLength);
  }

  ngOnInit() {
    this.dataSource.changePage(0, this.pageSize);
  }

  onPageEvent(event: PageEvent) {
    if (this.pageSize !== event.pageSize) {
      this.pageSize = event.pageSize;
      this.dataSource.changePageSize(event.pageSize);
    }
    this.dataSource.changePage(event.pageIndex, event.pageSize);
  }
}

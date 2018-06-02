/************************************************
 * Smart Component that acts as control for
 * ServerListComponent and ServerDetailComponent
 * ***********************************************/

import { Component, OnInit } from '@angular/core';
import {
  AppState,
  selectServerFilteredDataSetLength,
  selectServerPageData,
  selectCurrentServer,
  selectServerPage
} from '../../state/app.state';
import {
  LoadServers,
  SortDataSetPayload,
  SortDataSet,
  ChangePagePayload,
  ChangePage,
  SetFilterPayload,
  SetFilter,
  ChangePageSizePayload,
  ChangePageSize,
  RequestServerStatus,
  RequestServerStatusPayload,
  SetCurrentServer,
  SetCurrentServerPayload,
  SetServerStatusLoading,
  SetServerStatusLoadingPayload,
  CheckServersStatusPayload,
  CheckServersStatus
} from '../../state/actions/servers-actions';
import { Store } from '@ngrx/store';
import { Observable, interval, timer, from } from 'rxjs';
import { PageEvent, Sort } from '@angular/material';
import { Server, ServerStatus } from 'src/app/model/server.model';
import { ServerPage } from '../../state/servers.state';
import { filter, map } from 'rxjs/operators';
import { List as ImmutableList } from 'immutable';
@Component({
  selector: 'app-servers-status-page',
  templateUrl: './servers-status-page.component.html',
  styleUrls: ['./servers-status-page.component.scss']
})
export class ServersStatusPageComponent implements OnInit {
  displayedColumns = ['env', 'name', 'hostname', 'port', 'status'];
  pageSizeOptions = [5, 10, 50];
  pageSize = 5;
  pageNumber = 0;
  numberOfServers$: Observable<number>;
  servers$: Observable<ImmutableList<Server>>;
  currentServer$: Observable<Server>;
  timerCheckStatus$: Observable<number>;
  servers: Server[] = [];
  runInitServerCheck = true;

  constructor(private store: Store<AppState>) {
    this.store.dispatch(new LoadServers({}));
    this.numberOfServers$ = this.store.select(
      selectServerFilteredDataSetLength
    );
    this.currentServer$ = this.store.select(selectCurrentServer);
    this.servers$ = this.store.select(selectServerPageData);
  }

  ngOnInit() {
    this.servers$.subscribe(s => {
      this.servers = s.toArray();
      if (this.servers.length > 0 && this.runInitServerCheck) {
        this.checkServersStatus();
        this.runInitServerCheck = false;
      }
    });

    this.timerCheckStatus$ = interval(3000);
    this.timerCheckStatus$.subscribe(_ => this.checkServersStatus());
  }

  checkServersStatus() {
    const servers = this.buildServerListToCheck();
    if (servers.length > 0) {
      const payload: SetServerStatusLoadingPayload = {
        servers: this.servers
      };

      const checkStatusPayload: CheckServersStatusPayload = {
        servers: this.servers
      };

      this.store.dispatch(new SetServerStatusLoading(payload));
      setTimeout(() => {
        this.store.dispatch(new CheckServersStatus(checkStatusPayload));
      }, 2000);
    }
  }

  showSpinner() {
    return (
      this.servers == null ||
      this.servers === undefined ||
      this.servers.length === 0
    );
  }

  buildServerListToCheck(): Server[] {
    const servers: Server[] = [];
    from(this.servers)
      .pipe(
        filter(
          (s: Server) =>
            s.status === undefined || s.status.lastChecked < Date.now() - 6000
        )
      )
      .subscribe(s => {
        servers.push(s);
      });
    return servers;
  }

  handlePageEvent(event: PageEvent) {
    this.runInitServerCheck = true;
    if (this.pageSize !== event.pageSize) {
      this.pageSize = event.pageSize;
      this.changePageSize(event.pageSize);
    }
    this.changePage(event.pageIndex, event.pageSize);
  }

  handleFilterEvent(filterValue: string) {
    filterValue = filterValue.trim();
    filterValue = filterValue.toLowerCase();
    const payload: SetFilterPayload = { filter: filterValue };
    this.store.dispatch(new SetFilter(payload));
  }

  handleSortEvent(sort: Sort) {
    const payload: SortDataSetPayload = { sort: sort };
    this.store.dispatch(new SortDataSet(payload));
  }

  changePage(page: number, pageSize: number) {
    const payload: ChangePagePayload = { page: page, pageSize: pageSize };
    this.store.dispatch(new ChangePage(payload));
  }

  changePageSize(pageSize: number) {
    const payload: ChangePageSizePayload = { pageSize: pageSize };
    this.store.dispatch(new ChangePageSize(payload));
  }

  handleRowClick(server: Server) {
    console.log(server);
    const payload: RequestServerStatusPayload = {
      url: server.url,
      serverName: server.hostname,
      serverPort: server.port
    };

    this.store.dispatch(new RequestServerStatus(payload));
    const currentServerPayload: SetCurrentServerPayload = { server: server };
    this.store.dispatch(new SetCurrentServer(currentServerPayload));
  }
}

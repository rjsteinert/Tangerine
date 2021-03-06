import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ClassRoutingModule } from './class-routing.module';
import { DashboardComponent } from './dashboard/dashboard.component';
import {
  MatCardModule,
  MatInputModule,
  MatListModule,
  MatTableModule,
  MatTabsModule,
  MatSelectModule,
  MatMenuModule,
  MatPaginatorIntl,
  MatButtonModule,
  MatIconModule,
  MatToolbarModule
} from '@angular/material';
import {CdkTableModule} from "@angular/cdk/table";
import {SharedModule} from "../shared/shared.module";
import {DashboardService} from "./_services/dashboard.service";
import {MatCheckboxModule} from '@angular/material/checkbox';
import {MatPaginatorModule} from '@angular/material/paginator';
import { ClassFormsPlayerComponent } from './class-forms-player/class-forms-player.component';
import {MatPaginationIntlService} from "./_services/mat-pagination-intl.service";
import {TranslateService} from "@ngx-translate/core";
import { StudentSubtestReportComponent } from './reports/student-subtest-report/student-subtest-report.component';
import { StudentGroupingReportComponent } from './reports/student-grouping-report/student-grouping-report.component';
import {PageNotFoundComponent} from "./page-not-found.component";
import { StudentProgressTableComponent } from './reports/student-progress-table/student-progress-table.component';
import { CookieService } from "ngx-cookie-service";
import {MatButtonToggleModule} from '@angular/material/button-toggle';
import { TaskReportComponent } from './reports/task-report/task-report.component';

@NgModule({
  imports: [
    CommonModule,
    SharedModule,
    ClassRoutingModule,
    MatTabsModule,
    MatInputModule,
    MatMenuModule,
    MatListModule,
    MatCardModule,
    CdkTableModule,
    MatTableModule,
    MatSelectModule,
    SharedModule,
    MatCheckboxModule,
    MatPaginatorModule,
    MatButtonModule,
    MatIconModule,
    MatToolbarModule,
    MatButtonToggleModule
  ],
  declarations: [DashboardComponent, ClassFormsPlayerComponent, StudentSubtestReportComponent, StudentGroupingReportComponent, PageNotFoundComponent, StudentProgressTableComponent, TaskReportComponent],
  providers: [DashboardService, CookieService, {
    provide: MatPaginatorIntl,
    useFactory: (translate) => {
      const service = new MatPaginationIntlService();
      service.injectTranslateService(translate);
      return service;
    },
    deps: [TranslateService]
  }]
})
export class ClassModule { }

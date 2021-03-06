import { SharedModule } from './../../../shared/shared.module';
import { TranslateModule } from '@ngx-translate/core';
import { CASE_EVENT_STATUS_IN_PROGRESS } from './../../classes/case-event.class';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CaseEventScheduleComponent } from './case-event-schedule.component';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { UserService } from 'src/app/shared/_services/user.service';
import { CasesService } from '../../services/cases.service';
import { SearchService } from 'src/app/shared/_services/search.service';
import { TangyFormsInfoService } from 'src/app/tangy-forms/tangy-forms-info-service';
import { CaseEventScheduleListComponent } from '../case-event-schedule-list/case-event-schedule-list.component';
import { MockSearchService } from 'src/app/mocks/services/mock-search.service';
import { MockTangyFormsInfoService } from 'src/app/mocks/services/mock-tangy-forms-info.service';
import { CaseEvent } from '../../classes/case-event.class';
import { MatFormFieldModule } from '@angular/material';

class MockPouchDB {
  get(id) {
    switch (id) {
      case 'response1': 
        return {
          _id: 'response1',
          form: {
            id: 'form1'
          }
        }
      case 'response2':
        return {
          _id: 'response2',
          form: {
            id: 'form2'
          }
        }
    }
  }
}

class MockUserService {
  getCurrentUser() {
    return 'test-user'
  }
  getUserDatabase(username) {
    return new MockPouchDB()
  }
}

const REFERENCE_TIME = '2019-08-13'
const REFERENCE_TIME_2 = '2019-12-31'

class MockCasesService {

  async getEventsByDate (username:string, dateStart, dateEnd, excludeEstimates = false):Promise<Array<CaseEvent>> {
    return [
      <CaseEvent>{
        id: 'e1',
        caseId: 'response1',
        caseEventDefinitionId: 'c1',
        status: CASE_EVENT_STATUS_IN_PROGRESS,
        eventForms: [],
        estimate: false,
        scheduledDay: REFERENCE_TIME,
        occurredOnDay: REFERENCE_TIME,
        estimatedDay: REFERENCE_TIME,
        windowStartDay: REFERENCE_TIME ,
        windowEndDay: REFERENCE_TIME_2
      },
      <CaseEvent>{
        id: 'e2',
        caseId: 'response1',
        caseEventDefinitionId: 'c1',
        status: CASE_EVENT_STATUS_IN_PROGRESS,
        eventForms: [],
        estimate: false,
        scheduledDay: REFERENCE_TIME,
        occurredOnDay: REFERENCE_TIME,
        estimatedDay: REFERENCE_TIME,
        windowStartDay: REFERENCE_TIME ,
        windowEndDay: REFERENCE_TIME_2
      },
      <CaseEvent>{
        id: 'e3',
        caseId: 'response1',
        caseEventDefinitionId: 'c1',
        status: CASE_EVENT_STATUS_IN_PROGRESS,
        eventForms: [],
        estimate: false,
        scheduledDay: REFERENCE_TIME,
        occurredOnDay: REFERENCE_TIME,
        estimatedDay: REFERENCE_TIME,
        windowStartDay: REFERENCE_TIME ,
        windowEndDay: REFERENCE_TIME_2
      }
    ]
  }
}
describe('CaseEventScheduleComponent', () => {
  let component: CaseEventScheduleComponent;
  let fixture: ComponentFixture<CaseEventScheduleComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        MatFormFieldModule,
        SharedModule,
        TranslateModule.forRoot()
      ],
      schemas: [ CUSTOM_ELEMENTS_SCHEMA ],
      declarations: [ CaseEventScheduleComponent, CaseEventScheduleListComponent ],
      providers: [
        {
          provide: UserService,
          useClass: MockUserService
        },
        {
          provide: CasesService,
          useClass: MockCasesService
        },
        {
          provide: SearchService,
          useClass: MockSearchService
        },
        {
          provide: TangyFormsInfoService,
          useClass: MockTangyFormsInfoService
        }

      ],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CaseEventScheduleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  })
  /*
  fit('should have events', (done) => {
    expect(component).toBeTruthy();
    component.didSearch$.subscribe((value) => {
      debugger
      //expect(component.listEl.nativeElement.querySelectorAll('.search-result').length).toEqual(3)
      //done()
    })
    component.dayModeDate = REFERENCE_TIME
    component.weekModeDate = REFERENCE_TIME
    component.updateList()
  }, 987654321);
  */

});

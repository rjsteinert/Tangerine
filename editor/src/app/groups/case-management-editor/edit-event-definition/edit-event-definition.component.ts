import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { GroupsService } from '../../services/groups.service';
import { TangyErrorHandler } from 'src/app/shared/_services/tangy-error-handler.service';
import { Subscription } from 'rxjs';
import { _TRANSLATE } from 'src/app/shared/_services/translation-marker';
import { CaseManagementEditorService } from '../case-management-editor.service';

@Component({
  selector: 'app-edit-event-definition',
  templateUrl: './edit-event-definition.component.html',
  styleUrls: ['./edit-event-definition.component.css']
})
export class EditEventDefinitionComponent implements OnInit, OnDestroy {
  eventForm = {
    id: '',
    name: '',
    description: '',
    repeatable: undefined,
    required: undefined,
    eventFormDefinitions: []
  };
  groupId;
  formInActive;
  subscription: Subscription;
  caseStructure;
  eventDefinitionId;
  caseIndex;
  caseDetailId;
  constructor(private route: ActivatedRoute,
    private groupsService: GroupsService,
    private router: Router,
    private caseService: CaseManagementEditorService,
    private errorHandler: TangyErrorHandler) {
    this.groupId = this.route.snapshot.paramMap.get('groupName');
  }

  async ngOnInit() {
    this.subscription = this.route.queryParams.subscribe(async queryParams => {

      this.formInActive = true;
      this.caseDetailId = queryParams['caseDetailId'];
      this.eventDefinitionId = queryParams['id'];
      this.caseStructure = await this.groupsService.getCaseStructure(this.groupId, `./${queryParams['caseDetailId']}`);
      this.caseIndex = this.caseStructure.eventDefinitions ?
        this.caseStructure.eventDefinitions.findIndex(e => e.id === this.eventDefinitionId) : -1;
      this.eventForm = { ...this.caseStructure.eventDefinitions[this.caseIndex] };
    });
  }

  async editEventDefinition() {
    try {
      this.caseStructure.eventDefinitions[this.caseIndex] = this.eventForm;
      await this.groupsService.saveFileToGroupDirectory(this.groupId, this.caseStructure, `./${this.caseDetailId}.json`);
      this.formInActive = true;
      this.caseService.sendMessage('reloadTree');
      this.errorHandler.handleError(_TRANSLATE('Event Definition Saved Successfully.'));
    } catch (error) {
      this.errorHandler.handleError(_TRANSLATE('Event Definition not Saved.'));
    }
  }
  async deleteEventDefinition() {
    try {
      const shouldDelete = confirm(`Delete Event Definition: ${this.eventForm.name}?`);
      if (shouldDelete) {
        this.caseStructure.eventDefinitions = this.caseStructure.eventDefinitions.filter(e => e.id !== this.eventDefinitionId);
        await this.groupsService.saveFileToGroupDirectory(this.groupId, this.caseStructure, `./${this.caseDetailId}.json`);
        this.caseService.sendMessage('reloadTree');
        this.errorHandler.handleError(_TRANSLATE('Event Definition Deleted Successfully.'));
        this.router.navigate([], { replaceUrl: true, queryParams: { caseDetailId: this.caseDetailId } });
      }
    } catch (error) {
      this.errorHandler.handleError(_TRANSLATE('Event Definition not Saved.'));
    }
  }
  createNewEventFormDefinition() {
    const caseDetailId = this.caseDetailId;
    const parentId = this.eventDefinitionId;
    const currentNodeType = 'eventFormDefinition';
    const selectedTabIndex = this.route.snapshot.queryParamMap.get('selectedTabIndex');
    const formType = 'new';
    this.router.navigate([], {
      queryParams: { currentNodeType, caseDetailId, parentId, formType, selectedTabIndex },
      queryParamsHandling: 'merge'
    });
  }
  ngOnDestroy() {
    this.subscription.unsubscribe();
  }
}

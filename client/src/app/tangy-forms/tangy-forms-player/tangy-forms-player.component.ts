import { Component, ViewChild, ElementRef, AfterContentInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { HttpClient } from '@angular/common/http';

import { CaseManagementService } from '../../case-management/_services/case-management.service';
import { UserService } from '../../shared/_services/user.service';
import { _TRANSLATE } from '../../shared/translation-marker';
import { TangyFormService } from '../tangy-form.service';
const sleep = (milliseconds) => new Promise((res) => setTimeout(() => res(true), milliseconds))


@Component({
  selector: 'app-tangy-forms-player',
  templateUrl: './tangy-forms-player.component.html',
  styleUrls: ['./tangy-forms-player.component.css']
})
export class TangyFormsPlayerComponent implements AfterContentInit {
  formUrl;
  formIndex: number;
  responseId;
  throttledSaveLoaded;
  throttledSaveFiring;
  formId;
  formEl;
  window:any;
  @ViewChild('container') container: ElementRef;
  constructor(
    private caseManagementService: CaseManagementService,
    private service: TangyFormService,
    private route: ActivatedRoute,
    private http: HttpClient,
    private userService: UserService,
  ) { 
    this.window = window
  }

  isDirty() {
    const state = this.formEl.store.getState()
    const isDirty = state.items.reduce((acc, item) => item.isDirty || acc ? true : false, false)
    return isDirty 
  }

  isComplete() {
    return this.formEl.store.getState().form.complete
  }

  async ngAfterContentInit() {
    this.route.queryParams.subscribe(async params => {
      let formInfo; let formItemHtml;
      this.formIndex = +params['formIndex'] || 0;
      this.formId = params['formId'];
      this.responseId = params['responseId'];
      if (typeof this.formId !== 'undefined') {
        formInfo = await this.getFormInfoById(this.formId);
      } else {
        formInfo = await this.getFormInfoByIndex(this.formIndex);
      }
      this.window.tangyLocationFilterBy = (await this.userService.getUserLocations()).join(',')
      const userDbName = await this.userService.getUserDatabase();
      const formResponse = await this.service.getResponse(this.responseId);
      const container = this.container.nativeElement
      let  formHtml =  await this.http.get(formInfo.src, {responseType: 'text'}).toPromise();
      container.innerHTML = formHtml
      let formEl = container.querySelector('tangy-form')
      this.formEl = formEl;
      // Put a response in the store by issuing the FORM_OPEN action.
      if (formResponse) {
        formEl.response = formResponse
      } else {
        formEl.newResponse()
      }
      // Listen up, save in the db.
      formEl.addEventListener('TANGY_FORM_UPDATE', _ => {
        let response = _.target.store.getState()
        this.throttledSaveResponse(response)
      })
    });
  }

  // Prevent parallel saves which leads to race conditions. Only save the first and then last state of the store.
  // Everything else in between we can ignore.
  async throttledSaveResponse(response) {
    // If already loaded, return.
    if (this.throttledSaveLoaded) return
    // Throttle this fire by waiting until last fire is done.
    if (this.throttledSaveFiring) {
      this.throttledSaveLoaded = true
      while (this.throttledSaveFiring) await sleep(200)
      this.throttledSaveLoaded = false
    }
    // Fire it.
    this.throttledSaveFiring = true
    await this.saveResponse(response)
    this.throttledSaveFiring = false
  }

  async saveResponse(state) {
    let stateDoc = {}
    try {
      stateDoc = await this.service.getResponse(state._id)
    } catch (e) {
      let r = await this.service.saveResponse(state)
      stateDoc = await this.service.getResponse(state._id)
    }
    let newStateDoc = Object.assign({}, state, { _rev: stateDoc['_rev'] })
    await this.service.saveResponse(newStateDoc)
  }

  async getFormInfoByIndex(index = 0) {
    try {
      const userDB = await this.userService.getUserDatabase();
      const form = await this.caseManagementService.getFormList();
      if (!(index >= form.length)) {
        // Relative path to tangy forms app.
        return form[index]
      }
    } catch (err) { console.log(err) }

  }

  async getFormInfoById(formId) {
    try {
      const userDB = await this.userService.getUserDatabase();
      const form = await this.caseManagementService.getFormList();
      let selectedForm = form.find(testForm => (testForm.id === formId) ? true : false)
      return selectedForm;
    } catch (err) { console.log(err) }

  }

}

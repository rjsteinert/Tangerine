import {AfterContentInit, ElementRef, Component, ViewChild, Inject} from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import {MAT_DIALOG_DATA, MatDialog, MatDialogRef, MatTabChangeEvent} from "@angular/material";
import {AppConfigService} from "../../shared/_services/app-config.service";
import {FormJsonEditorComponent} from "../form-json-editor/form-json-editor.component";
import {FormMetadata} from "../form-json-editor/form-metadata";
import {Feedback} from "../form-json-editor/feedback";

@Component({
  selector: 'app-ng-tangy-form-editor',
  templateUrl: './ng-tangy-form-editor.component.html',
  styleUrls: ['./ng-tangy-form-editor.component.css']
})
export class NgTangyFormEditorComponent implements AfterContentInit {

  @ViewChild('container') container: ElementRef;
  @ViewChild('header') header: ElementRef;
  containerEl: any;
  selectedIndex = 1;
  print = false;
  groupId;
  groupName;
  form:FormMetadata;
  feedback:Feedback;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private http: HttpClient,
    private appConfigService: AppConfigService,
    public dialog: MatDialog
  ) { }

  async ngAfterContentInit() {

    this.containerEl = this.container.nativeElement

    let formId = this.route.snapshot.paramMap.get('formId');
    let groupName = this.route.snapshot.paramMap.get('groupName');
    this.print = !!this.route.snapshot.paramMap.get('print');
    this.groupName = groupName;

    let formHtml = await this.http.get(`/editor/${groupName}/content/${formId}/form.html`, {responseType: 'text'}).toPromise()
    let pathArray = window.location.hash.split( '/' );
    this.groupId = pathArray[2];

    const appConfig = await this.appConfigService.getAppConfig(groupName);
    const appConfigCategories = appConfig.categories;
    const categories = JSON.stringify(appConfigCategories);

    // Categories is an string of an array: categories ='["one","two","three","four"]'>
    if (!this.print) {
      this.containerEl.innerHTML = `
        <tangy-form-editor style="margin:15px" categories ='${categories}'>
          <template>
            ${formHtml}
          </template>
        </tangy-form-editor>
      `
      const tangyFormEditorEl = this.containerEl.querySelector('tangy-form-editor')
      tangyFormEditorEl.addEventListener('tangy-form-editor-change', event => this.saveForm(event.detail))
    } else {
      this.containerEl.innerHTML = `
        <style>
        mat-toolbar, mat-tab-header {
          display:none !important;
        }
        </style>
        <tangy-form-editor style="margin:15px" categories ='${categories}' print>
          <template>
            ${formHtml}
          </template>
        </tangy-form-editor>
      `
    }
  }

  tabChanged = async (tabChangeEvent: MatTabChangeEvent): Promise<void> => {
     if (tabChangeEvent.index === 0) {
        this.router.navigate(['groups', this.groupName])
      }
  }

  async openFormSettings() {
    let formId = this.route.snapshot.paramMap.get('formId');
    let groupName = this.route.snapshot.paramMap.get('groupName');
    let formsJson = await this.http.get<Array<any>>(`/editor/${groupName}/content/forms.json`).toPromise()
    this.form = formsJson.find(form => form.id === formId)
    this.form['groupName'] = groupName
    // console.log("formInfo: " + JSON.stringify(this.form))
    const dialogRef = this.dialog.open(FormJsonEditorComponent, {
      width: '500px',
      data: this.form
    });

    dialogRef.afterClosed().subscribe(result => {
      // console.log('The dialog was closed: ' + JSON.stringify(result));
    });

  }

  async saveForm(formHtml) {
    let files = []
    let state = this.containerEl.querySelector('tangy-form-editor').store.getState()
    // Update forms.json.
    let formsJson = await this.http.get<Array<any>>(`/editor/${this.route.snapshot.paramMap.get('groupName')}/content/forms.json`).toPromise()
    const updatedFormsJson = formsJson.map(formInfo => {
      if (formInfo.id !== state.form.id) return Object.assign({}, formInfo)
      return Object.assign({}, formInfo, {
        title: state.form.title
      })
    })
    files.push({
      groupId: this.route.snapshot.paramMap.get('groupName'),
      filePath:`./forms.json`,
      fileContents: JSON.stringify(updatedFormsJson)
    })
    // Update form.html.
    files.push({
      groupId: this.route.snapshot.paramMap.get('groupName'),
      filePath:`./${state.form.id}/form.html`,
      fileContents: formHtml 
    })
    // Send to server.
    for (let file of files) {
      await this.http.post('/editor/file/save', file).toPromise()
    }
  }

}


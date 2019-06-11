import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import PouchDB from 'pouchdb';
import * as PouchDBUpsert from 'pouchdb-upsert';
import * as pako from 'pako';

import { AppConfigService } from '../../../shared/_services/app-config.service';
import { UserService } from '../../../shared/_services/user.service';
import { WindowRef } from '../../../shared/_services/window-ref.service';
import { TangyFormsInfoService } from 'src/app/tangy-forms/tangy-forms-info-service';

@Injectable()
export class SyncingService {
  window;
  constructor(
    private windowRef: WindowRef,
    private appConfigService: AppConfigService,
    private http: HttpClient,
    private tangyFormsInfoService: TangyFormsInfoService,
    private userService: UserService
  ) {
    this.window = this.windowRef.nativeWindow;
  }

  getLoggedInUser(): string {
    return localStorage.getItem('currentUser');
  }

  async sync(username, skipByFormId?:Array<string>) {
    await this.pull(username)
    await this.push(username, skipByFormId)
    return true
  }

  async pull(username) {
    const appConfig = await this.appConfigService.getAppConfig()
    if (appConfig.centrallyManagedUserProfile) {
      // Pull the user profile.
      const userProfile = await this.userService.getUserProfile(username);
      const userProfileOnServer = await this.http.get(`${appConfig.serverUrl}api/${appConfig.groupName}/${userProfile._id}`, {
        headers: new HttpHeaders({
          'Authorization': appConfig.uploadToken
        })
      }).toPromise();
      const DB = new PouchDB(username)
      await DB.put(Object.assign({}, userProfileOnServer, {_rev: userProfile._rev}))
    }

  }

  async push(username, skipByFormId:Array<string> = []) {
    try {
      const userProfile = await this.userService.getUserProfile(username);
      const appConfig = await this.appConfigService.getAppConfig()
      const DB = new PouchDB(username);
      // ok
      const doc_ids = await this.getUploadQueue(username, skipByFormId);
      if (doc_ids && doc_ids.length > 0) {
        for (const doc_id of doc_ids) {
          const doc = await DB.get(doc_id);
          // Insert the userProfileId as an input.
          doc['items'][0]['inputs'].push({ name: 'userProfileId', value: userProfile._id });
          doc['items'][0]['inputs'].push({ name: 'tabletUserName', value: username });
          // Redact any fields marked as private.
          doc['items'].forEach(item => {
            item['inputs'].forEach(input => {
              if (input.private) {
                input.value = '';
              }
            });
          });
          const body = pako.deflate(JSON.stringify({ doc }), { to: 'string' });
          await this.http.post(`${appConfig.serverUrl}api/${appConfig.groupName}/upload`, body, {
            headers: new HttpHeaders({
              'Authorization': appConfig.uploadToken
            })
          }).toPromise();
          await this.markDocsAsUploaded([doc_id], username);
        }
      }
      return true; // No Items to Sync
    } catch (error) {
      throw (error);
    }
  }

  async getUploadQueue(username:string = '', skipByFormId:Array<string> = []) {
    const allFormIds = (await this.tangyFormsInfoService.getFormsInfo()).map(info => info.id)
    const includeByFormId = allFormIds.filter(id => !skipByFormId.includes(id))
    const userDB = username || await this.getLoggedInUser();
    const DB = new PouchDB(userDB);
    const appConfig = await this.appConfigService.getAppConfig()
    let queryNotUploaded = 'responsesLockedAndNotUploaded'
    let queryUploaded = 'responsesLockedAndUploaded'
    if (appConfig.uploadUnlockedFormReponses && appConfig.uploadUnlockedFormReponses === true) {
      queryNotUploaded = 'responsesUnLockedAndNotUploaded'
      queryUploaded = 'responsesUnLockedAndUploaded'
    }
    const results = await DB.query('tangy-form/' + queryNotUploaded, {keys: includeByFormId});
    const localNotUploadedDocIds = results.rows.map(row => row.id);
    // Also mark the user profile for upload if it has been modifid since last upload.
    const userProfile = await this.userService.getUserProfile(username || await this.getLoggedInUser())
    return userProfile.lastModified > userProfile.uploadDatetime 
      ? [ ...localNotUploadedDocIds, userProfile._id ]
      : localNotUploadedDocIds
  }

  async getDocsUploaded(username?: string) {
    const appConfig = await this.appConfigService.getAppConfig()
    let queryUploaded = 'responsesLockedAndUploaded'
    if (appConfig.uploadUnlockedFormReponses && appConfig.uploadUnlockedFormReponses === true) {
      queryUploaded = 'responsesUnLockedAndUploaded'
    }
    const userDB = username || await this.getLoggedInUser();
    const DB = new PouchDB(userDB);
    const results = await DB.query('tangy-form/' + queryUploaded);
    return results.rows;
  }

  async getAllUsersDocs(username?: string) {
    const userDB = username || await this.getLoggedInUser();
    const DB = new PouchDB(userDB);
    try {
      const result = await DB.allDocs({
        include_docs: true,
        attachments: true
      });
      return result;
    } catch (err) {
      console.log(err);
    }
  }
  async markDocsAsUploaded(replicatedDocIds, username) {
    PouchDB.plugin(PouchDBUpsert);
    const userDB = username;
    const DB = new PouchDB(userDB);
    return await Promise.all(replicatedDocIds.map(docId => {
      DB.upsert(docId, (doc) => {
        doc.uploadDatetime = Date.now();
        return doc;
      });
    }));
  }

}

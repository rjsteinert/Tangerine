import PouchDB from 'pouchdb';
import PouchDBFind from 'pouchdb-find';
import * as PouchDBUpsert from 'pouchdb-upsert';
PouchDB.plugin(PouchDBFind)
PouchDB.plugin(PouchDBUpsert)
PouchDB.defaults({auto_compaction: true, revs_limit: 1})
const SHARED_USER_DATABASE_NAME = 'shared-user-database'

export class UserDatabase {

  userId:string
  username:string
  name:string
  private db:PouchDB

  constructor(username, userId, shared = false) {
    this.userId = userId
    this.username = username
    this.name = username
    if (shared) {
      this.db = new PouchDB(SHARED_USER_DATABASE_NAME)
    } else {
      this.db = new PouchDB(username)
    }
  }
 
  async get(_id) {
    return await this.db.get(_id)
  }

  async put(doc) {
    return await this.db.put({
      ...doc,
      tangerineModifiedBy: this.userId,
      tangerineModifiedOn: Date.now()
    })
  }

  async post(doc) {
    return await this.db.post({
      ...doc,
      tangerineModifiedBy: this.userId,
      tangerineModifiedOn: Date.now()
    })
  }

  async remove(doc) {
    return await this.db.remove(doc)
  }

  async query(queryName:string, options = {}) {
    return await this.db.query(queryName, options)
  }

  async destroy() {
    return await this.db.destroy()
  }

  changes(options) {
    return this.db.changes(options)
  }
} 
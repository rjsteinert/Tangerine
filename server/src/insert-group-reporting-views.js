const log = require('tangy-log').log
const clog = require('tangy-log').clog
const groupReportingViews = require(`./group-reporting-views.js`)
const dbConnection = require('./db')

module.exports = async function insertGroupReportingViews(groupName) {
  let designDoc = Object.assign({}, groupReportingViews)
  let groupDb = new dbConnection(`${groupName}-reporting`)
  try {
    const existingDesignDoc = await groupDb.get(`_design/tangy-reporting`)
    designDoc._rev = existingDesignDoc._rev
  } catch(err) {
    // Do nothing... Assume this is the first time the views have been inserted.
  }
  try {
    let status = await groupDb.post(designDoc)
    log.info(`group reporting views inserted into ${groupName}-reporting`)
  } catch (error) {
    log.error(error)
  }
}
import UUID from 'uuid/v4';
import { CaseEvent } from './case-event.class'

class Case {
  _id:string;
  _rev:string;
  caseDefinitionId:string;
  label:string;
  openedDate:number;
  events: Array<CaseEvent> = [];
  collection:string = 'Case'
  constructor(data?:any) {
    if (!data) {
      this._id = UUID()
      this.openedDate = Date.now()
      return
    }
    this._id = data._id
    this._rev = data._rev
    this.openedDate = data.openedDate
    this.caseDefinitionId = data.caseDefinitionId
    this.label = data.label
    this.events = data.events.map(caseEventData => new CaseEvent(
      caseEventData.id,
      caseEventData.name,
      caseEventData.caseEventDefinitionId,
      caseEventData.eventForms,
      caseEventData.startDate
    ))
  }
}

export { Case }
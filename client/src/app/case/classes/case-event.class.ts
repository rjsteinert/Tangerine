import { EventForm } from './event-form.class'

export const CASE_EVENT_STATUS_IN_PROGRESS = 'in-progress' 
export const CASE_EVENT_STATUS_COMPLETED = 'completed' 
export const CASE_EVENT_STATUS_REVIEWED = 'reviewed' 

class CaseEvent {
  id?: string
  caseId: string
  caseEventDefinitionId:string
  status = CASE_EVENT_STATUS_IN_PROGRESS
  eventForms: Array<EventForm> = []
  estimate = true
  estimatedDay: string
  scheduledDay: string
  windowStartDay: string
  windowEndDay: string
  occurredOnDay: string

  name: string
  constructor() {

  }
}

export { CaseEvent }

import { EventFormDefinition } from './event-form-definition.class'

class CaseEventDefinition {
  id:string;
  name:string;
  description:string;
  repeatable:boolean = false;
  eventFormDefinitions:Array<EventFormDefinition> = []
  constructor(init:CaseEventDefinition) {
    Object.assign(this, init);
  }
}

export { CaseEventDefinition }
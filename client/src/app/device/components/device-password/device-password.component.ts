import { _TRANSLATE } from '../../../shared/translation-marker';
import { Subject } from 'rxjs';
import { Component, OnInit, ElementRef, ViewChild } from '@angular/core';

@Component({
  selector: 'app-device-password',
  templateUrl: './device-password.component.html',
  styleUrls: ['./device-password.component.css']
})
export class DevicePasswordComponent implements OnInit {

  @ViewChild('container') container: ElementRef
  done$:Subject<string> = new Subject<string>()

  constructor(
  ) { }


  async ngOnInit() {
    this.container.nativeElement.innerHTML = `
      <tangy-form id="device-password">
        <tangy-form-item id="device-password">
          <div style="text-align: center">
            <h2>${_TRANSLATE('Set a password to administer your device')}.</h2>
          </div>
          <tangy-input inner-label=" " label="${_TRANSLATE('Password')}" type="password" name="password" required>
          </tangy-input>
        </tangy-form-item>
      </tangy-form>
    `
    const languageSelectFormEl = this.container
      .nativeElement
      .querySelector('tangy-form')
    languageSelectFormEl
      .addEventListener('submit', async (event) => {
        const password = event.target.getValue('password')
        this.done$.next(password)
      })
    languageSelectFormEl.newResponse()
  }


}

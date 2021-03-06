import { HttpClient } from '@angular/common/http';
import { _TRANSLATE } from 'src/app/shared/_services/translation-marker';
import { Breadcrumb } from './../../shared/_components/breadcrumb/breadcrumb.component';
import { ActivatedRoute, Router } from '@angular/router';
import { Component, OnInit } from '@angular/core';
import { TangyFormResponseModel } from 'tangy-form/tangy-form-response-model';

@Component({
  selector: 'app-group-device-users',
  templateUrl: './group-device-users.component.html',
  styleUrls: ['./group-device-users.component.css']
})
export class GroupDeviceUsersComponent implements OnInit {
  
  title = _TRANSLATE('Device Users')
  breadcrumbs:Array<Breadcrumb> = []
 
  groupId:string

  constructor(
    private route: ActivatedRoute,
    private router:Router,
    private http:HttpClient
  ) { }

  ngOnInit() {
    this.breadcrumbs = [
      <Breadcrumb>{
        label: 'Device Users',
        url: 'device-users'
      }
    ]
    this.route.params.subscribe(async params => {
      this.groupId = params.groupId
    })
  }

  async newDeviceUser() {
    const response = new TangyFormResponseModel()
    response.form.id = 'user-profile'
    await this.http.post(`/api/${this.groupId}/${response._id}`, response).toPromise()
    this.router.navigate([response._id], {relativeTo: this.route})
  }

}

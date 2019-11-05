import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ActivatedRoute } from '@angular/router';
import { TangyErrorHandler } from 'src/app/shared/_services/tangy-error-handler.service';
import * as XLSX from 'xlsx';
import { GroupsService } from '../services/groups.service';
import { Loc } from 'tangy-form/util/loc.js';
import { _ } from 'underscore';
type AOA = any[][];
@Component({
  selector: 'app-import-location-list',
  templateUrl: './import-location-list.component.html',
  styleUrls: ['./import-location-list.component.css']
})
export class ImportLocationListComponent implements OnInit {
  constructor(
    private http: HttpClient,
    private route: ActivatedRoute,
    private errorHandler: TangyErrorHandler,
    private groupsService: GroupsService
  ) { }
  parsedCSVData: AOA = [[1, 2], [3, 4]];
  canUserImportFile: boolean;
  locationList: any;
  groupName = '';
  locationListLevels = [];
  CSVHeaders;
  headerModel = {};
  metadataModel = {};
  mappings = {};
  locationsMetadata = {};
  autoGeneratedIDLabel = 'AutoGeneratedID';
  locationListFileName = './location-list.json';
  generatedLocationList: any;
  async ngOnInit() {
    this.route.params.subscribe(params => {
      this.groupName = params.groupName;
    });
    this.locationList = await this.http.get(`/editor/${this.groupName}/content/location-list.json`).toPromise();
    this.locationListLevels = this.locationList.locationsLevels;
    this.canUserImportFile = !this.isLocationHierarchiesEmpty();
    // TODO this is a workaround for https://github.com/Tangerine-Community/Tangerine/issues/1576
    // this.canUserImportFile = this.isLocationListEmpty() && !this.isLocationHierarchiesEmpty();
  }
  isLocationListEmpty() {
    return Object.keys(this.locationList.locations).length === 0 && this.locationList.locations.constructor === Object;
  }
  isLocationHierarchiesEmpty() {
    return this.locationList.locationsLevels.length < 1;
  }

  importLocationListFile(fileInput) {
    this.CSVHeaders = [];
    this.mappings = {};
    try {
      const target: DataTransfer = <DataTransfer>(fileInput);
      if (target.files.length !== 1) {
        this.errorHandler.handleError('Please select one file only');
      }
      const reader: FileReader = new FileReader();
      reader.onload = (e: any) => {
        const binaryString: string = e.target.result;
        const workBook: XLSX.WorkBook = XLSX.read(binaryString, { type: 'binary' });
        const worksheetName: string = workBook.SheetNames[0];
        const worksheet: XLSX.WorkSheet = workBook.Sheets[worksheetName];
        this.parsedCSVData = <AOA>(XLSX.utils.sheet_to_json(worksheet));
        this.CSVHeaders = [this.autoGeneratedIDLabel, ...Object.keys(this.parsedCSVData[0]).sort()];

      };
      reader.readAsBinaryString(target.files[0]);
    } catch (error) {
      console.error(error);
      this.errorHandler.handleError('Could not Import File.');
    }

  }
  onSelectLocationLevelsMapping(locationLevel, value) {
    this.mappings[locationLevel] = value;
  }
  onSelectMetadataMapping(locationLevel, metadata, value) {
    this.locationsMetadata[locationLevel] = { ...this.locationsMetadata[locationLevel], [metadata]: value };
  }
  async processLocationListData() {
    try {
      const headers: any = this.validateColumns();
      if (headers && !headers.isValid) {
        this.errorHandler.handleError(`empty values on line: "${headers.row}" at column "${headers.column}"`);
        return;
      }
      const metadata: any = this.validateMetadata();
      if (metadata && !metadata.isValid) {
        this.errorHandler.handleError(`check values on line: "${metadata.row}" at column "${metadata.column}"`);
        return;
      }
      this.generateIDs();
      this.transformFromMappings();
      await this.saveLocationListToDisk();
    } catch (error) {
      console.log(error);
    }
  }
  validateColumns() {
    // check if any of the columns are empty
    const x = this.locationListLevels.map(e => {
      if (this.mappings[e] === this.autoGeneratedIDLabel) {
        return;
      } else {
        const index = this.parsedCSVData.findIndex(row => !row[this.mappings[e]]);
        if (index > 0) {
          // Add 2 to index because Javascript is 0-indexed and the CSV file contains headers on the first row.
          return { isValid: false, row: index + 2, column: this.mappings[e] };
        } else {
          return { isValid: true };
        }
      }
    });
    // return any rows with isValid set to false
    return x.find(e => (e && !e.isValid));
  }
  validateMetadata() {
    let x = [];
    this.locationListLevels.map(level => {
      if (this.locationList.metadata[level]) {
        return this.locationList.metadata[level].forEach(metadataItem => {
          // Get empty metadata cell for which the metadata is required
          const index = this.parsedCSVData.findIndex(row => !row[this.locationsMetadata[level][metadataItem.variableName]]
            && metadataItem.requiredField);
          if (index < 0) {
            x = [...x, { isValid: true }];
          } else { x = [...x, ({ isValid: false, row: index + 2, column: this.locationsMetadata[level][metadataItem.variableName] })]; }

        });
      } else {
        x = [...x, ({ isValid: true })];
      }
    });
    // return any rows with isValid set to false
    const foundInvalid = x.find(e => (e && !e.isValid));
    return foundInvalid ? foundInvalid : { isValid: true };
  }

  generateIDs() {
    const autoGenerateIDs = Object.values(this.mappings).findIndex(m => m === this.autoGeneratedIDLabel);
    let generatedIDs = [];
    const levels = [...this.locationList.locationsLevels].reverse();
    if (autoGenerateIDs < 0) { return; } else {
      this.parsedCSVData.map((elem, index) => {
        levels.map((level, ind) => {
          if (this.mappings[`${levels[ind]}_id`] === this.autoGeneratedIDLabel) {
            const currentLabel = elem[this.mappings[`${levels[ind]}`]];
            const labelHash = this.getLabelsHash(elem, this.mappings[level]);
            const i = generatedIDs.findIndex(e => e.label.trim() === (currentLabel.toString()).trim()
              && e.level.trim() === level.trim() && e.labelHash === labelHash);

            if (i >= 0) {
              this.parsedCSVData[index][`${level}_id`] = generatedIDs[i][`${level}_id`];
            } else {
              const id = this.groupsService.generateID();
              this.parsedCSVData[index][`${level}_id`] = id;
              generatedIDs = [...generatedIDs, {
                label: (elem[this.mappings[`${levels[ind]}`]]).toString().trim(),
                level, [`${level}_id`]: id,
                levelIndexParent: `${level}-${ind}`,
                labelHash
              }];
            }
          }
        });
      });
    }
  }

  // Creates a concatenated string with all the labels of all the parents and the current label in order to create a unique hash
  getLabelsHash(row, locationLevel) {
    let hash = '';
    for (const [index, value] of Object.entries(row)) {
      hash = `${hash}_${value}`;
      if (index === locationLevel) { break; }
    }
    return hash;
  }
  transformFromMappings() {
    let locations = [];
    const levels = [...this.locationList.locationsLevels].reverse();
    levels.map((level, index) => {
      this.parsedCSVData.map(item => {
        const id = item[this.mappings[`${level}_id`]];
        const parentId = item[this.mappings[`${levels[index + 1]}_id`]];
        const parent = index + 1 === levels.length ? 'root' : parentId;
        let value = {
          parent,
          label: item[this.mappings[level]].toString(),
          id,
          level
        };
        const levelMetadataKeys = this.locationsMetadata[level] ? Object.keys(this.locationsMetadata[level]) : [];
        if (levelMetadataKeys.length > 0) {
          for (const key of levelMetadataKeys) {
            const metadataKey = this.locationsMetadata[level][key];
            value = { ...value, [key]: item[metadataKey] };
          }
        }
        const itemIndex = locations.findIndex(e => e.label === value.label && e.level === value.level && e.parent === value.parent);
        if (itemIndex > 0) { return; }
        locations = [
          ...locations,
          value
        ];
      });
    });
    const flatLocationList = {
      locations, locationsLevels: this.locationList.locationsLevels, metadata: this.locationList.metadata
    };
    this.generatedLocationList = Loc.unflatten(flatLocationList);
  }
  async saveLocationListToDisk() {
    try {
      await this.groupsService.saveFileToGroupDirectory(this.groupName, this.generatedLocationList, this.locationListFileName);
      this.errorHandler.handleError(`Successfully saved Location list for Group: ${this.groupName}`);
    } catch (error) {
      this.errorHandler.handleError('Error Saving Location List File to disk');
    }
  }

}


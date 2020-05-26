import { Component, OnInit } from '@angular/core';
import * as fs from 'fs';
import { shell, ipcRenderer } from 'electron';
import { resolve, join } from 'path';
import { instantiateInterface } from '@buttercup/file-interface';
import {MessageService} from 'primeng/api';
import {MenuItem} from 'primeng/api';


@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
  providers: [MessageService]
})
export class HomeComponent implements OnInit {
  currentPath: string = process.cwd();
  files: Array<any> = [];
  copyFiles: Array<any> = [];
  checked: boolean;
  fsInterface = instantiateInterface("fs", { fs });
  details: boolean = false;

  searchByChar: string = null;
  sortByName: boolean = false;
  sortBySize: boolean = false;
  sortByCreated: boolean = false;

  items: MenuItem[];


  constructor( private messageService: MessageService ) {
    this.getAllFiles();
  }

  ngOnInit(): void {
    this.initMenu();
  }

  /**
   * Change view to list or with details on click
   */
  changeView(): void {
    this.details = !this.details;
  }

  getAllFiles(): void {
    this.fsInterface.getDirectoryContents({ identifier: this.currentPath }).then(results => {
      this.files = results;
      this.copyFiles = results;
      console.log(results);
    });
  }

  createFile(filename: string): void {
    this.fsInterface.putFileContents(
      { identifier: this.currentPath },
      { identifier: null, name: filename },
      ""
    ).then(result => {
      console.log(result);
    });
  }

  /**
   * 
   * @param newDir 
   */
  changeDir(newDir: string): void {
    this.currentPath = join(this.currentPath, newDir);
    this.getAllFiles();
    this.resetSearch();
  }

  /**
   * Remove all char after last '\' & update files directory
   */
  back(): void {
    this.currentPath = join(this.currentPath, '../');
    this.getAllFiles();
    this.resetSearch();
  }


  setSearch() {
    this.files = this.copyFiles;
    if (this.files) {

      if (this.searchByChar) {
        this.files = this.files.filter((d) => (d.name).toLowerCase().indexOf(this.searchByChar.toLowerCase()) !== -1)
      }
      if (this.sortByName) {
        this.files = this.files.filter((keyword, index) => this.files.lastIndexOf(keyword) === index).sort((a, b) => a.name < b.name ? -1 : 1);
      }
      if (this.sortBySize) {
        this.files = this.files.filter((keyword, index) => this.files.lastIndexOf(keyword) === index).sort((a, b) => b.size < a.size ? -1 : 1);
      }
      if (this.sortByCreated) {
        this.files = this.files.slice().sort((a: any, b: any) => { return Date.parse(b.created) - Date.parse(a.created) })
      }
    }
  }

  /**
   * Reset all value of search by criteria
   */
  resetSearch() {
    this.searchByChar = null;
    this.sortByCreated = false;
    this.sortByName = false;
    this.sortBySize = false;
  }

  openFile(path: string): void {
  }
  updateFiles() {
  }

  initMenu() {
    this.items = [
      {label: 'Create', icon: 'pi pi-create', command: () => {
          this.save();
          this.createFile();
      }},
      {label: 'Delete', icon: 'pi pi-times', command: () => {
          this.delete();
      }},
      {label: 'Angular.io', icon: 'pi pi-info', url: 'http://angular.io'},
      {separator: true},
      {label: 'Setup', icon: 'pi pi-cog', routerLink: ['/']}
  ];
  }

  save() {
    this.messageService.add({severity:'success', summary:'Success', detail:'Data Created'});
  }

  update() {
    this.messageService.add({severity:'success', summary:'Success', detail:'Data Updated'});
}

  delete() {
    this.messageService.add({severity:'success', summary:'Success', detail:'Data Deleted'});
  }

  clear() {
    this.messageService.clear();
  }
}

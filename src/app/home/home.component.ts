import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import * as fs from 'fs-extra';
import { shell, ipcRenderer } from 'electron';
import { stat, readdir } from 'fs';
import { resolve, join } from 'path';
import { instantiateInterface } from '@buttercup/file-interface';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
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


  constructor() {
    this.getAllFiles();
  }

  ngOnInit(): void {
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
    this.currentPath = this.currentPath.substring(0, this.currentPath.lastIndexOf("\\") + 0);
    this.getAllFiles();
    this.resetSearch();
  }


  setSearch() {
    console.log(this.sortByName);
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
        this.files = this.files.filter((keyword, index) => this.files.lastIndexOf(keyword) === index).sort((a, b) => b.created < a.created ? -1 : 1);
      }
    }
  }

  resetSearch() {
    this.searchByChar = null;
  }

  openFile(path: string): void {
  }
  updateFiles() {
  }

}

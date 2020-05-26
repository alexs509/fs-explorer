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
  searchByChar: string = null;
  checked: boolean;


  constructor() {
    this.getAllFiles();
  }

  ngOnInit(): void {
  }

  fsInterface = instantiateInterface("fs", { fs });

  getAllFiles(): void {
    this.fsInterface.getDirectoryContents({ identifier: this.currentPath }).then(results => {
      this.files = results;
      this.copyFiles = results;
    });
  }


  changeDir(newDir: string): void {
    this.currentPath = join(this.currentPath, newDir);
    this.getAllFiles();
  }

  back(): void {
    this.currentPath = this.currentPath.substring(0, this.currentPath.lastIndexOf("\\") + 0);
    this.getAllFiles();
  }

  setSearch() {
    this.files = this.copyFiles;
    if (this.files) {

      if (this.searchByChar) {
        this.files = this.files.filter((d) => (d.name).toLowerCase().indexOf(this.searchByChar.toLowerCase()) !== -1)
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

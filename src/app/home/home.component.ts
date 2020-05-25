import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import * as fs from 'fs-extra';
/* import { resolve } from 'path'; */
import { shell, ipcRenderer } from 'electron';
import { stat, readdir } from 'fs';
import { resolve } from 'path';
import { instantiateInterface } from '@buttercup/file-interface';


@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {
  currentPath: string = process.cwd();
  entries : Array<any> = [];

  constructor() {
    this.read();
  }

  ngOnInit(): void {
  }

  fsInterface = instantiateInterface("fs", { fs });
  read() {
    this.fsInterface.getDirectoryContents({ identifier: this.currentPath }).then(results => {
      this.entries = results;
    });
  }

  updateEntries() {
  }

  changeDir(newDir: string) {
  }

  openFile(path: string) {
  }

}

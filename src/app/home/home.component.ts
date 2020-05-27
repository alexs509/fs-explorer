import { Component, OnInit } from '@angular/core';
import * as fs from 'fs';
import { shell, ipcRenderer } from 'electron';
import { resolve, join } from 'path';
import { instantiateInterface } from '@buttercup/file-interface';
import { MessageService } from 'primeng/api';
import { MenuItem } from 'primeng/api';


@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
  providers: [MessageService]
})
export class HomeComponent implements OnInit {
  currentPath: string = __dirname;
  files: Array<any> = [];
  copyFiles: Array<any> = [];
  checked: boolean;
  fsInterface = instantiateInterface("fs", { fs });
  details: boolean = false;

  searchByChar: string = null;
  sortByName: boolean = false;
  sortBySize: boolean = false;
  sortByCreated: boolean = false;

  displayCreateFile: boolean = false;
  items: MenuItem[];
  filename: string;

  listFiles: string[] = [];
  delete: boolean = false;

  oldName: string = null;
  displayRenameModal: boolean = false;
  btnRename: boolean = false;


  constructor(private messageService: MessageService) {
    this.getAllFiles();
  }

  ngOnInit(): void {
    this.initMenu();
  }

  changeView(): void {
    this.details = !this.details;
  }

  deleteView(): void {
    this.delete ? this.listFiles = [] : '';
    this.delete = !this.delete;
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
    this.reset();
  }

  back(): void {
    this.currentPath = join(this.currentPath, '../');
    this.getAllFiles();
    this.reset();
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

  initMenu() {
    this.items = [
      {
        label: 'Create file', icon: 'pi pi-file', command: () => {
          this.dialogBeforeCreateFile()
        }
      },
      {
        label: 'Rename', icon: 'pi pi-pencil', command: () => {
          this.btnRename = !this.btnRename;
          this.delete ? this.deleteView() : '';
        }
      },
      {
        label: 'Delete', icon: 'pi pi-times', command: () => {
          this.deleteView();
          this.btnRename ? this.btnRename = !this.btnRename : '';
        }
      },
    ];
  }

  /**
   * Dialog for create file
   */
  dialogBeforeCreateFile() {
    this.displayCreateFile = true;
  }

  createFile(): void {
    this.fsInterface.putFileContents(
      { identifier: this.currentPath },
      { identifier: null, name: this.filename },
      ""
    ).then(result => {
      this.displayCreateFile = false;
      this.getAllFiles();
      this.filename = null;
      this.toast('success', 'Information', 'File created');
    });
  }

  dialogRename(name: string) {
    console.log(name);
    this.oldName = name;
    this.filename = name;
    this.displayRenameModal = !this.displayRenameModal;
  }

  renameFile() {
    fs.rename(this.oldName, this.filename, () => {
      this.toast('info','Information', 'Files has been updated')
    });
    this.btnRename = false; 
    this.getAllFiles();
  }

  deleteFiles(): void {
    this.listFiles.forEach(element => {
      this.fsInterface.deleteFile({ identifier: element });
    });
    this.toast('info','Information', 'Files has been deleted')
    this.deleteView();
    this.getAllFiles();
    this.reset();
  }


  toast(type: string, content: string, content2: string) {
    this.messageService.add({ severity: type, summary: content, detail: content2 });
  }

  clear() {
    this.messageService.clear();
  }

  /**
   * Reset all value of search by criteria
   */
  reset() {
    this.searchByChar = null;
    this.sortByCreated = false;
    this.sortByName = false;
    this.sortBySize = false;
    this.listFiles = [];
  }
}

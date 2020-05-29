import { Component, OnInit } from '@angular/core';
import * as fs from 'fs';
import { shell, ipcRenderer, BrowserWindow, remote } from 'electron';
import { resolve, join, parse, sep } from 'path';
import { instantiateInterface } from '@buttercup/file-interface';
import { MessageService } from 'primeng/api';
import { MenuItem } from 'primeng/api';
import { format } from 'url';
import { AppConfig } from '../../environments/environment';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
  providers: [MessageService]
})
export class HomeComponent implements OnInit {
  currentPath: string = this.getUserProfile();
  files: Array<any> = [];
  copyFiles: Array<any> = [];
  fsInterface = instantiateInterface("fs", { fs });
  details: boolean = false;

  searchByChar: string = null;
  types = [
    { label: 'Size', value: 'size' },
    { label: 'Date', value: 'date' },
    { label: 'Name', value: 'name' }
  ];
  selectedType: string = null;

  displayCreateFile: boolean = false;
  items: MenuItem[];
  filename: string = null;
  foldername: any;

  listFiles: string[] = [];
  delete: boolean = false;

  oldName: string = null;
  displayRenameModal: boolean = false;
  btnRename: boolean = false;

  displayMoveModal: boolean = false;
  btnMove: boolean = false;
  
  listFolder: [];


  constructor(private messageService: MessageService) {
    this.getAllFiles();
    this.currentPath = this.getUserProfile();
  }

  ngOnInit(): void {
    this.initMenu();
  }

  /**
   * Determine the OS and return homedir
   */
  getUserProfile(): string {
    return process.env[(process.platform == 'win32') ? 'USERPROFILE' : 'HOME'];
  }

  newWindow(): void {
    const BrowserWindow = remote.BrowserWindow;
    let win = new BrowserWindow({
      height: 600,
      width: 800,
      webPreferences: {
        nodeIntegration: true
      }
    });
    win.on('closed', () => {
      win = null
    })

    let status = AppConfig;
    if (status.production) {
      win.loadURL(format({
        pathname: join(__dirname, 'index.html'),
        protocol: 'file:',
        slashes: true,
      }));
    } else {
      win.loadURL('http://localhost:4200');
    }

  }

  changeView(): void {
    this.details = !this.details;
  }

  refresh(): void {
    setTimeout(() => {
      this.currentPath = this.getUserProfile();

    }, 100);
    setTimeout(() => {
      this.getAllFiles();

    }, 800);
    setTimeout(() => {
      this.reset();
    }, 1000);
  }

  deleteView(): void {
    this.delete ? this.listFiles = [] : '';
    this.delete = !this.delete;
  }


  getAllFiles(): void {
    this.copyFiles = [];
    this.fsInterface.getDirectoryContents({ identifier: this.currentPath }).then(results => {
      this.files = results;
      this.copyFiles = results;
    }).catch((error) => {
      console.error(error)
      this.toast('error', 'Error', 'You havent privilege to access this folder')
      setTimeout(() => {
          this.back();
      }, 500);
      
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

  /**
   * go previous path
   */
  back(): void {
    this.currentPath = join(this.currentPath, '../');
    this.getAllFiles();

    
    
    setTimeout(() => {
      console.log(this.copyFiles);
      this.copyFiles.length == 0 ? this.currentPath = this.getUserProfile() : '' ;
    }, 800);
    this.reset();
  }


  setSearch() {
    this.files = this.copyFiles;
    if (this.files) {

      if (this.searchByChar) {
        this.files = this.files.filter((d) => (d.name).toLowerCase().indexOf(this.searchByChar.toLowerCase()) !== -1)
      }
      if (this.selectedType == 'name') {
        this.files = this.files.filter((keyword, index) => this.files.lastIndexOf(keyword) === index).sort((a, b) => a.name < b.name ? -1 : 1);
      }
      if (this.selectedType == 'size') {
        this.files = this.files.filter((keyword, index) => this.files.lastIndexOf(keyword) === index).sort((a, b) => b.size < a.size ? -1 : 1);
      }
      if (this.selectedType == 'date') {
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
      {
        label: 'Move', icon: 'pi pi-save', command: () => {
          this.btnMove = !this.btnMove;
          this.btnRename ? this.btnRename = !this.btnRename : '';
          this.delete ? this.deleteView() : '';
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
    this.oldName = name;
    this.filename = name;
    this.displayRenameModal = !this.displayRenameModal;
  }

  renameFile() {
    fs.rename(join(this.currentPath, this.oldName), join(this.currentPath, this.filename), () => {
      this.toast('info', 'Information', 'Files has been updated')
    });
    this.displayRenameModal = false;
    this.btnRename = false;
    setTimeout(() => {
      this.getAllFiles();
    }, 1000);

  }

  deleteFiles(): void {
    this.listFiles.forEach(element => {
      this.fsInterface.deleteFile({ identifier: element });
    });
    this.toast('info', 'Information', 'Files has been deleted')
    this.deleteView();
    this.getAllFiles();
    this.reset();
  }

  moveDialog(name: string): void {
    this.oldName = name;
    this.filename = name;
    this.displayMoveModal = !this.displayMoveModal;
    this.getAllCurrentFolder();
  }

  moveFile(): void {
    fs.rename(join(this.currentPath, this.oldName), join(this.foldername.identifier, this.oldName), () => {
      this.toast('info', 'Information', 'Files has been moved')
    });
    this.displayRenameModal = false;
    this.btnRename = false;
    setTimeout(() => {
      this.getAllFiles();
    }, 1000);
  }

  getAllCurrentFolder() {
    this.listFolder = [];
    this.fsInterface.getDirectoryContents({ identifier: this.currentPath }).then((results: any) => {
      this.listFolder = results.filter((d) => { return d.type == 'directory' });
    });
  }


  /**
   * display toast msg with params
   * @param type 
   * @param content 
   * @param content2 
   */
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
    this.displayCreateFile = false;
    this.displayRenameModal = false;
    this.delete = false;
    this.btnRename = false;
  }
}

import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { HomeRoutingModule } from './home-routing.module';

import { HomeComponent } from './home.component';
import { SharedModule } from '../shared/shared.module';

import {InputTextModule} from 'primeng/inputtext';
import {ButtonModule} from 'primeng/button';
import {InputSwitchModule} from 'primeng/inputswitch';
import {TableModule} from 'primeng/table';
import {TooltipModule} from 'primeng/tooltip';
import {MenubarModule} from 'primeng/menubar';
import {MenuItem} from 'primeng/api';
import {SplitButtonModule} from 'primeng/splitbutton';

import {MessagesModule} from 'primeng/messages';
import {MessageModule} from 'primeng/message';
import {ToastModule} from 'primeng/toast';
import {MenuModule} from 'primeng/menu';

import {DialogModule} from 'primeng/dialog';
import {CheckboxModule} from 'primeng/checkbox';




@NgModule({
  declarations: [HomeComponent],
  imports: [CommonModule, SharedModule, HomeRoutingModule, InputTextModule, ButtonModule, InputSwitchModule, TableModule,
    TooltipModule, MenubarModule, SplitButtonModule,MessageModule, MessagesModule, ToastModule, DialogModule, MenuModule, CheckboxModule ]
})
export class HomeModule {}

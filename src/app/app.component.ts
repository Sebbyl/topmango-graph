import { Component, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ChartComponent } from './chart/chart.component';
import customerData from '../../userData.json';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, ChartComponent, CommonModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
})
export class AppComponent {
  title = 'topmango-graph';
  customerData = customerData;
}

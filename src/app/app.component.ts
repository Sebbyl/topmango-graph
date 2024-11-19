import { Component, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { LineChartComponent } from './line-chart/line-chart.component';
import { BarChartComponent } from './bar-chart/bar-chart.component';
import customerData from '../../userData.json';
import { CommonModule } from '@angular/common';
import barChartData from '../../barChartData.json';
import pieChartData from '../../pieChartData.json';
import { PieChartComponent } from './pie-chart/pie-chart.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    RouterOutlet,
    LineChartComponent,
    CommonModule,
    BarChartComponent,
    PieChartComponent,
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
})
export class AppComponent {
  title = 'topmango-graph';
  customerData = customerData;
  barChartData = barChartData;
  pieChartData = pieChartData;
}

import { Component, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ChartComponent } from './chart/chart.component';
import { LineChartComponent } from './line-chart/line-chart.component';
import { BarChartComponent } from './bar-chart/bar-chart.component';
import customerData from '../../userData.json';
import { CommonModule } from '@angular/common';
import barChartData from '../../barChartData.json';
import bubbleChartData from '../../bubbleChartData.json';
import { BubbleChartComponent } from './bubble-chart/bubble-chart.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    RouterOutlet,
    LineChartComponent,
    CommonModule,
    BarChartComponent,
    BubbleChartComponent,
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
})
export class AppComponent {
  title = 'topmango-graph';
  customerData = customerData;
  barChartData = barChartData;
  bubbleChartData = bubbleChartData;
}

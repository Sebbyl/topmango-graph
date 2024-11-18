import { Component, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ChartComponent } from './chart/chart.component';
import customerData from '../../userData.json';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, ChartComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
})
export class AppComponent {
  title = 'topmango-graph';
  customerData = customerData;
}

import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root',
})
export class DataServiceService {
  constructor(private http: HttpClient) {}

  getAreaChartData() {
    return this.http.get('http://localhost:5183/api/AreaChart');
  }

  getBarChartData() {
    return this.http.get('http://localhost:5183/api/BarChart');
  }

  getPieChartData() {
    return this.http.get('http://localhost:5183/api/PieChart');
  }
}

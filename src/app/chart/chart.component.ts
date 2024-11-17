import { Component, AfterViewInit, ViewChild, ElementRef } from '@angular/core';
import Chart from 'chart.js/auto';
import customerData from '../../../userData.json';

type AverageSales = {
  date: string;
  average: number;
};

@Component({
  selector: 'app-chart',
  standalone: true,
  imports: [],
  templateUrl: './chart.component.html',
  styleUrl: './chart.component.css',
})
export class ChartComponent implements AfterViewInit {
  @ViewChild('MyChart') chartContainer!: ElementRef;
  public chart: any;

  mergeDates(data: any): string[] {
    let mergedDates: string[] = [];
    data.forEach((val: any) => {
      if (!mergedDates.includes(val.date)) {
        mergedDates.push(val.date);
      }
    });
    return mergedDates;
  }

  getAverages(data: any): {
    allCustomers: AverageSales[];
    loyaltyCustomers: (AverageSales | null)[];
  } {
    let averageAllSales: AverageSales[] = [];
    let averageLoyaltySales: (AverageSales | null)[] = [];
    let groupedByDate: { [key: string]: any[] } = {};

    for (const customer of data) {
      const date = customer.date;
      if (!groupedByDate[date]) {
        groupedByDate[date] = [];
      }
      groupedByDate[date].push(customer);
    }

    for (const key in groupedByDate) {
      let sum: number = 0;
      groupedByDate[key].forEach((val) => {
        sum += val.ticketSize;
      });
      averageAllSales.push({
        date: key,
        average: sum / groupedByDate[key].length,
      });
    }

    for (const key in groupedByDate) {
      let sum: number = 0;
      let loyaltyCount = 0;
      groupedByDate[key].forEach((val) => {
        if (val.hasLoyalty) {
          sum += val.ticketSize;
          loyaltyCount++;
        }
      });
      if (sum !== 0) {
        averageLoyaltySales.push({
          date: key,
          average: sum / loyaltyCount,
        });
      } else {
        averageLoyaltySales.push(null);
      }
    }

    return {
      allCustomers: averageAllSales,
      loyaltyCustomers: averageLoyaltySales,
    };
  }

  updateChartDate(event: Event): void {
    const months = (event.target as HTMLSelectElement).value;
    let data = customerData.customers;
    if (Number(months) !== -1) {
      const updatedDate = new Date();
      updatedDate.setMonth(updatedDate.getMonth() - Number(months));

      data = data.filter((customer: any) => {
        const customerDate = new Date(customer.date);
        return customerDate > updatedDate;
      });
    }

    this.chart.data.labels = this.mergeDates(data);
    this.chart.data.datasets.forEach((val: any, index: number) => {
      if (index === 0) {
        val.data = this.getAverages(customerData.customers).allCustomers.map(
          (val) => val.average
        );
      } else {
        val.data = this.getAverages(
          customerData.customers
        ).loyaltyCustomers.map((val) => val?.average);
      }
    });
    this.chart.update();
  }

  createChart(): void {
    const ctx = this.chartContainer.nativeElement.getContext('2d');
    this.chart = new Chart(ctx, {
      type: 'line',

      data: {
        labels: this.mergeDates(customerData.customers),
        datasets: [
          {
            label: 'All Customers',
            data: this.getAverages(customerData.customers).allCustomers.map(
              (val) => val.average
            ),
            backgroundColor: 'blue',
          },
          {
            label: 'Loyalty Customers',
            data: this.getAverages(customerData.customers).loyaltyCustomers.map(
              (val) => val?.average
            ),
            backgroundColor: 'limegreen',
            spanGaps: true,
          },
        ],
      },
      options: {
        aspectRatio: 2.5,
        responsive: true,
      },
    });
  }

  ngAfterViewInit(): void {
    this.createChart();
  }
}

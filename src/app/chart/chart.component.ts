import { Component, AfterViewInit, ViewChild, ElementRef } from '@angular/core';
import { Chart } from 'chart.js/auto';
import customerData from '../../../userData.json';
import zoomPlugin from 'chartjs-plugin-zoom';
import { FormsModule } from '@angular/forms';

type AverageSales = {
  date: string;
  average: number;
};

@Component({
  selector: 'app-chart',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './chart.component.html',
  styleUrl: './chart.component.css',
})
export class ChartComponent implements AfterViewInit {
  @ViewChild('MyChart') chartContainer!: ElementRef;
  public chart: any;

  endDate: string = '';
  startDate: string = '';

  allCustomersTotal!: number;
  loyaltyCustomersTotal!: number;

  ngAfterViewInit(): void {
    Chart.register(zoomPlugin);
    this.setDates(
      new Date(customerData.customers[0].date),
      new Date(customerData.customers[customerData.customers.length - 1].date)
    );
    this.setTotals(customerData.customers);
    this.createChart();
  }

  setTotals(data: any): void {
    let allCustomersTotal = 0;
    let loyaltyCustomersTotal = 0;

    data.forEach((val: any) => {
      if (val.hasLoyalty) {
        loyaltyCustomersTotal += val.ticketSize;
      }
      allCustomersTotal += val.ticketSize;
    });

    this.allCustomersTotal = allCustomersTotal;
    this.loyaltyCustomersTotal = loyaltyCustomersTotal;
  }

  setDates(start: Date, end: Date): void {
    this.startDate = `${start.toLocaleString('default', {
      month: 'long',
    })} ${start.getDate().toString()} ${start.getFullYear().toString()}`;

    this.endDate = `${end.toLocaleString('default', {
      month: 'long',
    })} ${end.getDate().toString()} ${end.getFullYear().toString()}`;
  }

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
      let loyaltyCount: number = 0;
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
    const averages = this.getAverages(customerData.customers);
    if (Number(months) !== -1) {
      const updatedDate = new Date();
      updatedDate.setMonth(updatedDate.getMonth() - Number(months));

      data = data.filter((customer: any) => {
        const customerDate = new Date(customer.date);
        return customerDate > updatedDate;
      });
      this.setDates(
        new Date(updatedDate),
        new Date(customerData.customers[customerData.customers.length - 1].date)
      );
    } else if (Number(months) === -1) {
      this.setDates(
        new Date(customerData.customers[0].date),
        new Date(customerData.customers[customerData.customers.length - 1].date)
      );
    }
    this.setTotals(data);
    this.chart.data.labels = this.mergeDates(data);
    this.chart.data.datasets.forEach((val: any, index: number) => {
      if (index === 0) {
        val.data = averages.allCustomers.map((val) => val.average);
      } else {
        val.data = averages.loyaltyCustomers.map((val) => val?.average);
      }
    });
    this.chart.update();
  }

  resetZoom(): void {
    this.chart.resetZoom();
  }

  createChart(): void {
    const ctx = this.chartContainer.nativeElement.getContext('2d');
    const averages = this.getAverages(customerData.customers);

    const allCustomersGradient = ctx.createLinearGradient(0, 0, 0, 450);
    allCustomersGradient.addColorStop(0, 'blue');
    allCustomersGradient.addColorStop(1, 'white');

    const loyaltyCustomersGradient = ctx.createLinearGradient(0, 0, 0, 450);
    loyaltyCustomersGradient.addColorStop(0, 'limegreen');
    loyaltyCustomersGradient.addColorStop(1, 'white');

    this.chart = new Chart(ctx, {
      type: 'line',

      data: {
        labels: this.mergeDates(customerData.customers),
        datasets: [
          {
            label: 'All Customers',
            data: averages.allCustomers.map((val) => val.average),
            backgroundColor: allCustomersGradient,
            borderColor: 'blue',
            spanGaps: true,
            fill: true,
          },
          {
            label: 'Loyalty Customers',
            data: averages.loyaltyCustomers.map((val) => val?.average),
            backgroundColor: loyaltyCustomersGradient,
            borderColor: 'limegreen',
            spanGaps: true,
            fill: true,
          },
        ],
      },
      options: {
        aspectRatio: 2.5,
        responsive: true,
        plugins: {
          zoom: {
            pan: {
              enabled: true,
              mode: 'xy',
            },
            zoom: {
              wheel: {
                enabled: true,
              },
              pinch: {
                enabled: true,
              },
              mode: 'xy',
            },
          },
        },
      },
    });
  }
}

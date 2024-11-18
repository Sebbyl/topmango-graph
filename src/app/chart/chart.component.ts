import {
  Component,
  AfterViewInit,
  ViewChild,
  ElementRef,
  Input,
} from '@angular/core';
import { Chart } from 'chart.js/auto';
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
  @Input() customerData: any;

  public chart: any;

  selectedDateOption: string = '-1';
  customDateValue: string = '';

  endDate: string = '';
  startDate: string = '';

  allCustomersTotal!: number;
  loyaltyCustomersTotal!: number;

  ngAfterViewInit(): void {
    Chart.register(zoomPlugin);
    this.setDates(
      new Date(this.customerData.customers[0].date),
      new Date(
        this.customerData.customers[this.customerData.customers.length - 1].date
      )
    );
    this.setTotals(this.customerData.customers);
    this.createChart();
  }

  //Custom date search
  onSearch(): void {
    if (this.customDateValue !== '' && Number(this.customDateValue) > 0) {
      this.selectedDateOption = '-2';
      this.updateChartDate();
    }
  }

  //Calculates, and set totals for all customers, and loyalty customers in the picked date range
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

  //sets the start. amd end dates displayed in the chart
  setDates(start: Date, end: Date): void {
    this.startDate = `${start.toLocaleString('default', {
      month: 'long',
    })} ${start.getDate().toString()} ${start.getFullYear().toString()}`;

    this.endDate = `${end.toLocaleString('default', {
      month: 'long',
    })} ${end.getDate().toString()} ${end.getFullYear().toString()}`;
  }

  //creates an array of dates with no duplicates based on data given
  mergeDates(data: any): string[] {
    let mergedDates: string[] = [];
    data.forEach((val: any) => {
      if (!mergedDates.includes(val.date)) {
        mergedDates.push(val.date);
      }
    });
    return mergedDates;
  }

  //get all averages per date
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

  //Updates chart time range, alongside new average calculations
  updateChartDate(): void {
    let data = this.customerData.customers;
    const averages = this.getAverages(this.customerData.customers);

    if (Number(this.selectedDateOption) >= 0) {
      this.customDateValue = '';
      const updatedDate = new Date();
      updatedDate.setMonth(
        updatedDate.getMonth() - Number(this.selectedDateOption)
      );

      data = data.filter((customer: any) => {
        const customerDate = new Date(customer.date);
        return customerDate > updatedDate;
      });
      this.setDates(
        new Date(updatedDate),
        new Date(
          this.customerData.customers[
            this.customerData.customers.length - 1
          ].date
        )
      );
    } else if (Number(this.selectedDateOption) === -1) {
      this.customDateValue = '';
      this.setDates(
        new Date(this.customerData.customers[0].date),
        new Date(
          this.customerData.customers[
            this.customerData.customers.length - 1
          ].date
        )
      );
    } else {
      const updatedDate = new Date();
      console.log(this.customDateValue);
      updatedDate.setMonth(
        updatedDate.getMonth() - Number(this.customDateValue)
      );
      data = data.filter((customer: any) => {
        const customerDate = new Date(customer.date);
        return customerDate > updatedDate;
      });
      this.setDates(
        new Date(updatedDate),
        new Date(
          this.customerData.customers[
            this.customerData.customers.length - 1
          ].date
        )
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

  //resets the zoom to default
  resetZoom(): void {
    this.chart.resetZoom();
  }

  //Chart creation
  createChart(): void {
    const ctx = this.chartContainer.nativeElement.getContext('2d');
    const averages = this.getAverages(this.customerData.customers);

    const allCustomersGradient = ctx.createLinearGradient(0, 0, 0, 450);
    allCustomersGradient.addColorStop(0, 'blue');
    allCustomersGradient.addColorStop(1, 'white');

    const loyaltyCustomersGradient = ctx.createLinearGradient(0, 0, 0, 450);
    loyaltyCustomersGradient.addColorStop(0, 'limegreen');
    loyaltyCustomersGradient.addColorStop(1, 'white');

    this.chart = new Chart(ctx, {
      type: 'line',

      data: {
        labels: this.mergeDates(this.customerData.customers),
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
        maintainAspectRatio: true,
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

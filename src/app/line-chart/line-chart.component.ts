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

type TotalSales = {
  date: string;
  total: number;
};

@Component({
  selector: 'app-line-chart',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './line-chart.component.html',
  styleUrl: './line-chart.component.css',
})
export class LineChartComponent implements AfterViewInit {
  @ViewChild('MyChart') chartContainer!: ElementRef;
  @Input() customerData: any;
  @Input() title!: string;

  public lineChart: any;

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
    this.createLineChart();
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
        loyaltyCustomersTotal += val.price;
      }
      allCustomersTotal += val.price;
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

  //get all totals per date
  getSaleTotalByDate(data: any): {
    allCustomers: TotalSales[];
    loyaltyCustomers: (TotalSales | null)[];
  } {
    let allSales: TotalSales[] = [];
    let loyaltySales: (TotalSales | null)[] = [];
    let groupedByDate: { [key: string]: any[] } = {};

    for (const customer of data) {
      const date = customer.date;
      if (!groupedByDate[date]) {
        groupedByDate[date] = [];
      }
      groupedByDate[date].push(customer);
    }

    for (const key in groupedByDate) {
      let allSum = 0;
      let loyaltySum = 0;
      groupedByDate[key].forEach((val) => {
        allSum += val.price;
        if (val.hasLoyalty) {
          loyaltySum += val.price;
        }
      });

      allSales.push({ date: key, total: allSum });
      loyaltySales.push(
        loyaltySum === 0 ? null : { date: key, total: loyaltySum }
      );
    }

    return {
      allCustomers: allSales,
      loyaltyCustomers: loyaltySales,
    };
  }

  //Updates chart time range, alongside new average calculations
  updateChartDate(): void {
    let data = this.customerData.customers;
    const saleTotalByDate = this.getSaleTotalByDate(
      this.customerData.customers
    );

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
    this.lineChart.data.labels = this.mergeDates(data);
    this.lineChart.data.datasets.forEach((val: any, index: number) => {
      if (index === 0) {
        val.data = saleTotalByDate.allCustomers.map((val) => val.total);
      } else {
        val.data = saleTotalByDate.loyaltyCustomers.map((val) => val?.total);
      }
    });
    this.lineChart.update();
  }

  //resets the zoom to default
  resetZoom(): void {
    this.lineChart.resetZoom();
  }

  //Chart creation
  createLineChart(): void {
    const ctx = this.chartContainer.nativeElement.getContext('2d');
    const saleTotalByDate = this.getSaleTotalByDate(
      this.customerData.customers
    );

    const allCustomersGradient = ctx.createLinearGradient(0, 0, 0, 450);
    allCustomersGradient.addColorStop(0, '#e0b95c');
    allCustomersGradient.addColorStop(1, 'white');

    const loyaltyCustomersGradient = ctx.createLinearGradient(0, 0, 0, 450);
    loyaltyCustomersGradient.addColorStop(0, '#72d4ce');
    loyaltyCustomersGradient.addColorStop(1, 'white');

    this.lineChart = new Chart(ctx, {
      type: 'line',

      data: {
        labels: this.mergeDates(this.customerData.customers),
        datasets: [
          {
            label: 'All Customers',
            data: saleTotalByDate.allCustomers.map((val: any) => val.total),
            borderColor: '#e0b95c',
            backgroundColor: allCustomersGradient,
            spanGaps: true,
            fill: true,
            order: 2,
          },
          {
            label: 'Loyalty Customers',
            data: saleTotalByDate.loyaltyCustomers.map(
              (val: any) => val?.total
            ),
            backgroundColor: loyaltyCustomersGradient,
            borderColor: '#72d4ce',
            spanGaps: true,
            fill: true,
            order: 1,
          },
        ],
      },
      options: {
        aspectRatio: 2.5,
        responsive: true,
        maintainAspectRatio: true,
        scales: {
          y: {
            beginAtZero: true,
            ticks: {
              callback: function (value: any) {
                return '$' + value;
              },
            },
          },
        },
        plugins: {
          title: {
            display: false,
          },
          legend: {
            display: false,
          },
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

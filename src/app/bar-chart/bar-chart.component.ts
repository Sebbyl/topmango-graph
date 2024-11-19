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

@Component({
  selector: 'app-bar-chart',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './bar-chart.component.html',
  styleUrl: './bar-chart.component.css',
})
export class BarChartComponent implements AfterViewInit {
  @ViewChild('MyChart') chartContainer!: ElementRef;
  @Input() customerData: any;
  @Input() title: string | undefined;

  public barChart: any;

  selectedDateOption: string = '-1';
  customDateValue: string = '';

  endDate: string = '';
  startDate: string = '';

  onlineTotal!: number;
  inStoreTotal!: number;

  ngAfterViewInit(): void {
    this.inStoreTotal = this.getInStoreTotal(this.customerData.customers);
    this.onlineTotal = this.getOnlineTotal(this.customerData.customers);
    Chart.register(zoomPlugin);
    this.setDates(
      new Date(this.customerData.customers[0].date),
      new Date(
        this.customerData.customers[this.customerData.customers.length - 1].date
      )
    );
    this.createBarChart();
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

  getInStoreTotal(data: any): number {
    let total = 0;
    for (const val of data) {
      if (val.inStore) {
        total += val.ticketPrice;
      }
    }
    return total;
  }

  getOnlineTotal(data: any): number {
    let total = 0;
    for (const val of data) {
      if (!val.inStore) {
        total += val.ticketPrice;
      }
    }
    return total;
  }

  //Chart creation
  createBarChart(): void {
    const ctx = this.chartContainer.nativeElement.getContext('2d');

    this.barChart = new Chart(ctx, {
      type: 'bar',

      data: {
        labels: ['In-Store', 'Online'],
        datasets: [
          {
            data: [this.inStoreTotal, this.onlineTotal],
            backgroundColor: ['#e0b95c', '#72d4ce'],
            borderWidth: 1,
            borderRadius: 10,
          },
        ],
      },
      options: {
        aspectRatio: 2.5,
        responsive: true,
        maintainAspectRatio: true,
        scales: {
          y: {
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
        },
      },
    });
  }
}

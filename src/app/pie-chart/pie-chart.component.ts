import {
  Component,
  AfterViewInit,
  ViewChild,
  ElementRef,
  Input,
} from '@angular/core';
import { Chart } from 'chart.js/auto';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-pie-chart',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './pie-chart.component.html',
  styleUrl: './pie-chart.component.css',
})
export class PieChartComponent implements AfterViewInit {
  @ViewChild('MyChart') chartContainer!: ElementRef;
  @Input() customerData: any;
  @Input() title: string | undefined;

  public pieChart: any;

  endDate: string = 'May 9 2024';
  startDate: string = 'January 14 2021';

  allCustomerAverage!: number;
  loyaltyCustomerAverage!: number;

  ngAfterViewInit(): void {
    this.allCustomerAverage =
      this.customerData.averageTicketSizes.AllCustomersAverageTicketSize;
    this.loyaltyCustomerAverage =
      this.customerData.averageTicketSizes.LoyaltyAverageTicketSize;
    this.createPieChart();
  }

  //Chart creation
  createPieChart(): void {
    const ctx = this.chartContainer.nativeElement.getContext('2d');

    this.pieChart = new Chart(ctx, {
      type: 'pie',
      data: {
        labels: ['All Customers', 'Loyalty Customers'],
        datasets: [
          {
            data: [
              this.customerData.averageTicketSizes
                .AllCustomersAverageTicketSize,
              this.customerData.averageTicketSizes.LoyaltyAverageTicketSize,
            ],
            backgroundColor: ['#e0b95c', '#72d4ce'],
            borderWidth: 1,
          },
        ],
      },
      options: {
        aspectRatio: 2.5,
        responsive: true,
        maintainAspectRatio: true,
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

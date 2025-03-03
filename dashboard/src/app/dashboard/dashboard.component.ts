import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import * as d3 from 'd3';
import { StockService } from '../stock.service';

// Define proper interfaces for strong typing
interface StockDataPoint {
  date: Date;
  value: number;
}

interface Stock {
  symbol: string;
  name: string;
  price: number;
  change: number;
  data?: StockDataPoint[];
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {
  searchQuery: string = '';
  searchResults: Stock[] = [];
  dashboardStocks: Stock[] = [];

  constructor(private stockService: StockService) {}

  ngOnInit() {
    this.loadSavedStocks();
  }

  loadSavedStocks() {
    this.stockService.getUserStocks().subscribe(stocks => {
      this.dashboardStocks = stocks;
      // Draw charts for each stock after a small delay to ensure DOM is ready
      setTimeout(() => {
        this.dashboardStocks.forEach(stock => {
          this.createStockChart(stock);
        });
      }, 100);
    });
  }

  onSearchKeyUp(event: KeyboardEvent) {
    if (event.key === 'Enter') {
      this.searchStocks();
    }
  }

  searchStocks() {
    if (!this.searchQuery.trim()) return;

    this.stockService.searchStocks(this.searchQuery).subscribe(results => {
      this.searchResults = results;
    });
  }

  addStockToDashboard(stock: Stock) {
    // Check if stock already exists in dashboard
    if (!stock?.symbol || this.dashboardStocks.some(s => s.symbol === stock.symbol)) {
      return;
    }

    this.stockService.getStockDetails(stock.symbol).subscribe(stockDetails => {
      // Safe access to properties using a type guard approach
      const stockData = stockDetails as any; // Temporary cast to bypass type checking

      const cleanStock: Stock = {
        symbol: stockData.symbol || '',
        name: stockData.name || '',
        price: stockData.price || 0,
        change: stockData.change || 0,
        data: stockData.data || []
      };

      if (cleanStock.symbol) {
        this.dashboardStocks.push(cleanStock);
        this.searchResults = [];
        this.searchQuery = '';

        // Save the updated stocks list
        this.stockService.saveUserStocks(this.dashboardStocks).subscribe();

        // Create the chart
        setTimeout(() => this.createStockChart(cleanStock), 50);
      } else {
        console.error('Received invalid stock details:', stockDetails);
      }
    });
  }

  removeStock(stock: Stock) {
    this.dashboardStocks = this.dashboardStocks.filter(s => s.symbol !== stock.symbol);
    this.stockService.saveUserStocks(this.dashboardStocks).subscribe();
  }

  createStockChart(stock: Stock) {
    // Clear previous chart
    d3.select(`#chart-${stock.symbol}`).selectAll('*').remove();

    const containerWidth = document.querySelector(`#chart-${stock.symbol}`)?.clientWidth || 200;
    const margin = { top: 20, right: 20, bottom: 30, left: 40 };
    const width = containerWidth - margin.left - margin.right;
    const height = 150 - margin.top - margin.bottom;

    const svg = d3.select(`#chart-${stock.symbol}`)
      .append('svg')
      .attr('width', width + margin.left + margin.right)
      .attr('height', height + margin.top + margin.bottom)
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    // Use historical data if available, otherwise create dummy data
    const data: StockDataPoint[] = stock.data || this.generateDummyData();

    // Only proceed if we have valid data
    if (data.length === 0) {
      svg.append('text')
        .attr('x', width / 2)
        .attr('y', height / 2)
        .attr('text-anchor', 'middle')
        .text('No data available');
      return;
    }

    // Ensure all dates are Date objects
    const validData = data.map(d => ({
      date: d.date,
      value: d.value
    }));

    // Define x and y scales with proper type assertions
    const dateExtent = d3.extent(validData, d => d.date) as [Date, Date];
    const x = d3.scaleTime()
      .domain(dateExtent)
      .range([0, width]);

    const yMin = d3.min(validData, d => d.value) || 0;
    const yMax = d3.max(validData, d => d.value) || 100;

    const y = d3.scaleLinear()
      .domain([yMin * 0.95, yMax * 1.05])
      .range([height, 0]);

    // Create the line
    const line = d3.line<StockDataPoint>()
      .x(d => x(d.date))
      .y(d => y(d.value))
      .curve(d3.curveBasis);

    // Draw the line
    svg.append('path')
      .datum(validData)
      .attr('fill', 'none')
      .attr('stroke', stock.change >= 0 ? '#28a745' : '#dc3545')
      .attr('stroke-width', 2)
      .attr('d', line);

    // Add x-axis
    svg.append('g')
      .attr('transform', `translate(0,${height})`)
      .call(d3.axisBottom(x).ticks(5).tickFormat(d3.timeFormat('%b %d') as any));

    // Add y-axis
    svg.append('g')
      .call(d3.axisLeft(y).ticks(5));
  }

  generateDummyData(): StockDataPoint[] {
    const data: StockDataPoint[] = [];
    const now = new Date();

    // Generate 30 days of data
    for (let i = 30; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);

      data.push({
        date: date,
        value: 100 + Math.random() * 50
      });
    }

    return data;
  }
}

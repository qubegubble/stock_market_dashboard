import { Component, OnInit, AfterViewInit, NgZone, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import * as d3 from 'd3';
import { StockService } from '../stock.service';
import { WebSocketService, StockUpdate } from '../websocket.service';
import { Subscription } from 'rxjs';
import {
  CdkDragDrop,
  moveItemInArray,
  CdkDragHandle,
  CdkDropList,
  CdkDrag,
  DragDropModule
} from '@angular/cdk/drag-drop';

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
  imports: [CommonModule, FormsModule, DragDropModule],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit, AfterViewInit, OnDestroy {
  searchQuery: string = '';
  searchResults: Stock[] = [];
  dashboardStocks: Stock[] = [];
  stockSizes: Map<string, string> = new Map();
  private stockUpdateSubscription: Subscription | null = null;

  constructor(
    private stockService: StockService,
    private ngZone: NgZone,
    private webSocketService: WebSocketService
  ) {}

  ngOnInit() {
    this.loadStockSizes();
    this.loadSavedStocks();
    this.stockUpdateSubscription = this.webSocketService.getStockUpdates().subscribe(update => {
      if (update) {
        this.ngZone.run(() => {
          this.updateStockData(update);
        });
      }
    });
  }

  ngAfterViewInit() {
    // Charts will be drawn once data is loaded
  }

  ngOnDestroy() {
    if (this.stockUpdateSubscription) {
      this.stockUpdateSubscription.unsubscribe();
    }
    if (this.dashboardStocks.length > 0) {
      const symbols = this.dashboardStocks.map(stock => stock.symbol);
      this.webSocketService.unsubscribeFromStocks(symbols);
    }
  }

  updateStockData(update: StockUpdate) {
    const stock = this.dashboardStocks.find(s => s.symbol === update.symbol);
    if (stock) {
      stock.price = update.price;
      stock.change = update.change;

      if (stock.data && stock.data.length > 0) {
        const newDataPoint = {
          date: new Date(),
          value: update.price
        };
        if (stock.data.length >= 30) {
          stock.data.shift();
        }

        stock.data.push(newDataPoint);
        this.updateStockChart(stock);
      }
    }
  }

  updateStockChart(stock: Stock) {
    const chartElement = document.querySelector(`#chart-${stock.symbol}`);
    if (!chartElement) return;

    const svgElement = d3.select(`#chart-${stock.symbol} svg`);
    if (svgElement.empty()) {
      this.createStockChart(stock);
      return;
    }

    const svgGroup = d3.select(`#chart-${stock.symbol} svg g`);
    if (svgGroup.empty() || !stock.data || stock.data.length === 0) {
      this.createStockChart(stock);
      return;
    }

    const containerWidth = chartElement.clientWidth || 200;
    const margin = { top: 20, right: 20, bottom: 30, left: 40 };
    const width = containerWidth - margin.left - margin.right;
    const height = 150 - margin.top - margin.bottom;

    const validData = stock.data.map(d => ({
      date: d.date instanceof Date ? d.date : new Date(d.date),
      value: Number(d.value)
    }));

    validData.sort((a, b) => a.date.getTime() - b.date.getTime());

    const dateExtent = d3.extent(validData, d => d.date) as [Date, Date];
    const x = d3.scaleTime()
      .domain(dateExtent)
      .range([0, width]);

    const yMin = d3.min(validData, d => d.value) || 0;
    const yMax = d3.max(validData, d => d.value) || 100;
    const yRange = yMax - yMin;

    const yPadding = Math.max(yRange * 0.1, 1);

    const yStart = yMin < yRange * 0.2 ? 0 : Math.max(0, yMin - yPadding);

    const y = d3.scaleLinear()
      .domain([yStart, yMax + yPadding])
      .range([height, 0])
      .nice();

    const line = d3.line<StockDataPoint>()
      .x(d => x(d.date))
      .y(d => y(d.value))
      .curve(d3.curveMonotoneX);

    svgGroup.select('path')
      .datum(validData)
      .attr('stroke', stock.change >= 0 ? '#28a745' : '#dc3545')
      .transition()
      .duration(500)
      .attr('d', line);

    const xAxis = d3.axisBottom(x)
      .ticks(5)
      .tickFormat(d3.timeFormat('%b %d') as any);

    const yAxis = d3.axisLeft(y)
      .ticks(5)
      .tickFormat(d => `$${d}`);

    svgGroup.select<SVGGElement>('.x-axis')
      .transition()
      .duration(500)
      .call(xAxis as any);

    svgGroup.select<SVGGElement>('.y-axis')
      .transition()
      .duration(500)
      .call(yAxis as any);
  }

  loadStockSizes() {
    const savedSizes = localStorage.getItem('stockSizes');
    if (savedSizes) {
      try {
        this.stockSizes = new Map(Object.entries(JSON.parse(savedSizes)));
      } catch (e) {
        console.error('Error parsing saved stock sizes', e);
        this.stockSizes = new Map();
      }
    }
  }

  saveStockSizes() {
    localStorage.setItem('stockSizes', JSON.stringify(Object.fromEntries(this.stockSizes)));
  }

  getStockSize(stock: Stock): string {
    return this.stockSizes.get(stock.symbol) || 'size-1x1';
  }

  drop(event: CdkDragDrop<Stock[]>) {
    this.ngZone.run(() => {
      moveItemInArray(this.dashboardStocks, event.previousIndex, event.currentIndex);
      this.stockService.saveUserStocks(this.dashboardStocks).subscribe();

      setTimeout(() => this.redrawAllCharts(), 100);
    });
  }

  startResize(event: MouseEvent, stock: Stock) {
    event.preventDefault();
    event.stopPropagation();

    const startX = event.clientX;
    const startY = event.clientY;

    const currentSize = this.getStockSize(stock);

    const initialSizeClass = currentSize;

    const overlay = document.createElement('div');
    overlay.style.position = 'fixed';
    overlay.style.left = '0';
    overlay.style.top = '0';
    overlay.style.width = '100%';
    overlay.style.height = '100%';
    overlay.style.zIndex = '9999';
    overlay.style.cursor = 'nwse-resize';
    document.body.appendChild(overlay);

    const mouseMoveHandler = (moveEvent: MouseEvent) => {
      const deltaX = moveEvent.clientX - startX;
      const deltaY = moveEvent.clientY - startY;

      let newSize = 'size-1x1';

      if (deltaX > 50 && deltaY > 50) {
        newSize = 'size-2x2';
      } else if (deltaX > 50) {
        newSize = 'size-2x1';
      } else if (deltaY > 50) {
        newSize = 'size-1x2';
      }

      if (newSize !== this.getStockSize(stock)) {
        this.ngZone.run(() => {
          this.stockSizes.set(stock.symbol, newSize);

          setTimeout(() => {
            this.createStockChart(stock);
          }, 10);
        });
      }
    };

    const mouseUpHandler = () => {
      document.removeEventListener('mousemove', mouseMoveHandler);
      document.removeEventListener('mouseup', mouseUpHandler);
      document.body.removeChild(overlay);

      this.saveStockSizes();

      if (initialSizeClass !== this.getStockSize(stock)) {
        setTimeout(() => this.createStockChart(stock), 100);
      }
    };

    document.addEventListener('mousemove', mouseMoveHandler);
    document.addEventListener('mouseup', mouseUpHandler);
  }

  loadSavedStocks() {
    this.stockService.getUserStocks().subscribe(stocks => {
      this.dashboardStocks = stocks;

      setTimeout(() => {
        this.redrawAllCharts();

        const symbols = this.dashboardStocks.map(stock => stock.symbol);
        if (symbols.length > 0) {
          this.webSocketService.subscribeToStocks(symbols);
        }
      }, 100);
    });
  }

  redrawAllCharts() {
    this.dashboardStocks.forEach(stock => {
      const chartElement = document.querySelector(`#chart-${stock.symbol}`);
      if (chartElement) {
        d3.select(chartElement).selectAll('*').remove();
      }
    });

    this.dashboardStocks.forEach(stock => {
      this.createStockChart(stock);
    });
  }

  searchStocks() {
    if (!this.searchQuery.trim()) return;

    this.stockService.searchStocks(this.searchQuery).subscribe(results => {
      this.searchResults = results;
    });
  }

  onSearchKeyUp(event: KeyboardEvent) {
    if (event.key === 'Enter') {
      this.searchStocks();
    }
  }

  addStockToDashboard(stock: Stock) {
    if (!stock?.symbol || this.dashboardStocks.some(s => s.symbol === stock.symbol)) {
      return;
    }

    this.stockService.getStockDetails(stock.symbol).subscribe(stockDetails => {
      const stockData = stockDetails as any;

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

        this.stockService.saveUserStocks(this.dashboardStocks).subscribe();

        this.webSocketService.subscribeToStocks([cleanStock.symbol]);

        setTimeout(() => this.createStockChart(cleanStock), 100);
      } else {
        console.error('Received invalid stock details:', stockDetails);
      }
    });
  }

  removeStock(stock: Stock) {
    const index = this.dashboardStocks.findIndex(s => s.symbol === stock.symbol);
    if (index !== -1) {
      this.webSocketService.unsubscribeFromStocks([stock.symbol]);

      this.dashboardStocks.splice(index, 1);
      this.stockService.saveUserStocks(this.dashboardStocks).subscribe();

      this.stockSizes.delete(stock.symbol);
      this.saveStockSizes();
    }
  }

  createStockChart(stock: Stock) {
    const chartElement = document.querySelector(`#chart-${stock.symbol}`);
    if (!chartElement) {
      console.error(`Chart element for ${stock.symbol} not found`);
      setTimeout(() => this.createStockChart(stock), 50);
      return;
    }

    d3.select(`#chart-${stock.symbol}`).selectAll('*').remove();

    const containerWidth = chartElement.clientWidth || 200;
    const margin = { top: 20, right: 20, bottom: 30, left: 40 };
    const width = containerWidth - margin.left - margin.right;
    const height = 150 - margin.top - margin.bottom;
    const stockData = stock.data && stock.data.length > 0 ? stock.data : this.generateDummyData();

    const svg = d3.select(`#chart-${stock.symbol}`)
      .append('svg')
      .attr('width', containerWidth)
      .attr('height', height + margin.top + margin.bottom)
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    const validData = stockData.map(d => ({
      date: d.date instanceof Date ? d.date : new Date(d.date),
      value: Number(d.value)
    }));

    const dateExtent = d3.extent(validData, d => d.date) as [Date, Date];
    const x = d3.scaleTime()
      .domain(dateExtent)
      .range([0, width]);

    const yMin = d3.min(validData, d => d.value) || 0;
    const yMax = d3.max(validData, d => d.value) || 100;
    const yPadding = (yMax - yMin) * 0.1;

    const y = d3.scaleLinear()
      .domain([Math.max(0, yMin - yPadding), yMax + yPadding])
      .range([height, 0]);

    const line = d3.line<StockDataPoint>()
      .x(d => x(d.date))
      .y(d => y(d.value))
      .curve(d3.curveMonotoneX);

    svg.append('path')
      .datum(validData)
      .attr('fill', 'none')
      .attr('stroke', stock.change >= 0 ? '#28a745' : '#dc3545')
      .attr('stroke-width', 2)
      .attr('d', line);

    svg.append('g')
      .attr('class', 'x-axis')
      .attr('transform', `translate(0,${height})`)
      .call(d3.axisBottom(x).ticks(5).tickFormat(d3.timeFormat('%b %d') as any));

    svg.append('g')
      .attr('class', 'y-axis')
      .call(d3.axisLeft(y).ticks(5).tickFormat(d => `$${d}`));
  }

  generateDummyData(): StockDataPoint[] {
    const data: StockDataPoint[] = [];
    const now = new Date();

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

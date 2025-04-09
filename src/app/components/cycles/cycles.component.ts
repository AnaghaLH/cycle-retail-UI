import { Component, OnInit } from '@angular/core';
import { CycleService } from '../../services/cycle.service';
import { Cycle, CycleBrand, CycleType } from '../../models/cycle.model';
import { AuthService } from '../../services/auth.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-cycles',
  templateUrl: './cycles.component.html',
  styleUrls: ['./cycles.component.scss']
})
export class CyclesComponent implements OnInit {
  cycles: Cycle[] = [];
  isLoading = true;
//Math: any;
searchTerm = '';
brandFilter = '';
typeFilter = '';
sortField= 'modelName';
brands: CycleBrand[] = [];
types: CycleType[] = [];
filteredCycles: Cycle[] = [];
currentPage=1;
itemsPerPage=5;
totalItems=0;
  constructor(
    private cycleService: CycleService,
    public authService: AuthService,
    private toastr: ToastrService
  ) { }
 
  
  // Update ngOnInit
  ngOnInit(): void {
    this.loadBrandsAndTypes();
    this.loadCycles();
  }
  calculateItemRange(): string {
    const startItem = (this.currentPage - 1) * this.itemsPerPage + 1;
    const endItem = Math.min(this.currentPage * this.itemsPerPage, this.totalItems);
    return `Showing ${startItem} to ${endItem} of ${this.totalItems} cycles`;
  }
  
  loadBrandsAndTypes(): void {
    // In a real app, get these from your API
    this.brands = [
      { brandId: 1, brandName: 'Trek' },
      { brandId: 2, brandName: 'Giant' },
      { brandId: 3, brandName: 'Specialized' }
    ];
  
    this.types = [
      { typeId: 1, typeName: 'Road' },
      { typeId: 2, typeName: 'Mountain' },
      { typeId: 3, typeName: 'Hybrid' },
      { typeId: 4, typeName: 'Electric' }
    ];
  }
  
  // Add this method
  // applyFilters(): void {
  //   if (!this.cycles) return;
  
  //   this.filteredCycles = [...this.cycles]
  //     .filter(cycle => {
  //       const matchesSearch = !this.searchTerm || 
  //         cycle.modelName?.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
  //         cycle.brand?.brandName.toLowerCase().includes(this.searchTerm.toLowerCase());
        
  //       const matchesBrand = !this.brandFilter || 
  //         cycle.brandId.toString() === this.brandFilter;
        
  //       const matchesType = !this.typeFilter || 
  //         cycle.typeId.toString() === this.typeFilter;
        
  //       return matchesSearch && matchesBrand && matchesType;
  //     })
  //     .sort((a, b) => {
  //       const field = this.sortField as keyof Cycle;
      
  //       const aVal = a[field] ?? '';
  //       const bVal = b[field] ?? '';
      
  //       if (aVal < bVal) return -1;
  //       if (aVal > bVal) return 1;
  //       return 0;
  //     });
      
  // }

  
  
  // loadCycles(): void {
  //   this.isLoading = true;
  //   const filters = {
  //     search: this.searchTerm,
  //     brandId: this.brandFilter,
  //     typeId: this.typeFilter,
  //     sort: this.sortField
  //   }
  //   this.cycleService.getCyclesPaginated(this.currentPage, this.itemsPerPage, filters).subscribe({
  //     next: (response) => {
  //       this.cycles = response.$values;
  //       this.totalItems = this.cycles.length; 
  //       this.applyFilters();
  //       this.isLoading = false;
  //       console.log("API Response for cycles:", response);

  //     },
  //     error: (error) => {
  //       this.toastr.error('Failed to load cycles');
  //       this.isLoading = false;
  //     }
  //   });
  // }
  loadCycles(): void {
    this.isLoading = true;
    this.cycleService.getCycles().subscribe({
      next: (response) => {

        console.log('👉 response:', response);
       
        this.cycles = Array.isArray(response) ? response : response?.$values;; 
        this.applyFilters(); 
        this.isLoading = false;
      },
      error: () => {
        this.toastr.error('Failed to load cycles');
        this.isLoading = false;
      }
    });
  }
  applyFilters(): void {
    if (!this.cycles) return;
  
    const search = this.searchTerm.toLowerCase();
  
    this.filteredCycles = this.cycles.filter(cycle => {
      const modelName = cycle.modelName?.toLowerCase() ?? '';
      const brandName = cycle.brand?.brandName?.toLowerCase() ?? '';
  
      const matchesSearch = !this.searchTerm ||
        modelName.includes(search) ||
        brandName.includes(search);
  
      const matchesBrand = !this.brandFilter || cycle.brandId?.toString() === this.brandFilter;
      const matchesType = !this.typeFilter || cycle.typeId?.toString() === this.typeFilter;
  
      return matchesSearch && matchesBrand && matchesType;
    }).sort((a, b) => {
      const field = this.sortField as keyof Cycle;
      const aVal = a[field]?.toString().toLowerCase() ?? '';
      const bVal = b[field]?.toString().toLowerCase() ?? '';
      return aVal.localeCompare(bVal);
    });
  
    this.totalItems = this.filteredCycles.length;
    // console.log('Filtered Cycles' + this.filteredCycles);
    
    this.currentPage = 1;
  }
  
  
  onPageChange(page: number): void {
    this.currentPage = page;
   // this.loadCycles();
  }

  deleteCycle(id: number): void {
    if (!confirm('Are you sure you want to delete this cycle?')) return;

    this.cycleService.deleteCycle(id).subscribe({
      next: () => {
        
        this.toastr.success('Cycle deleted successfully');
        this.loadCycles();
      },
      error: () => {
        this.toastr.error('Failed to delete cycle');
      }
    });
  }
  getPageNumbers(): number[] {
  const totalPages = Math.ceil(this.totalItems / this.itemsPerPage);
  const pages: number[] = [];
  
  // Show up to 5 pages around current page
  let startPage = Math.max(1, this.currentPage - 2);
  let endPage = Math.min(totalPages, startPage + 4);
  
  // Adjust if we're at the beginning
  if (endPage - startPage < 4) {
    endPage = Math.min(totalPages, startPage + 4);
  }
  
  for (let i = startPage; i <= endPage; i++) {
    pages.push(i);
  }
  
  return pages;
}
get pagedCycles(): Cycle[] {
  const start = (this.currentPage - 1) * this.itemsPerPage;
  return this.filteredCycles.slice(start, start + this.itemsPerPage);
}

  
}
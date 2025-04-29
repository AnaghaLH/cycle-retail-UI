import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CycleService } from '../../services/cycle.service';
import { Cycle } from '../../models/cycle.model';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-cycle-detail',
  templateUrl: './cycle-detail.component.html',
  styleUrls: ['./cycle-detail.component.scss']
})
export class CycleDetailComponent implements OnInit {
  cycle: Cycle | null = null;
  isLoading = true;

  constructor(
    private route: ActivatedRoute,
    private cycleService: CycleService,
    private router: Router,
    private toastr: ToastrService
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.loadCycleDetails(+id);
    }
  }

  loadCycleDetails(id: number): void {
    this.isLoading = true;
    this.cycleService.getCycle(id).subscribe({
      next: (cycle) => {
        this.cycle = cycle;
        this.isLoading = false;
      },
      error: () => {
        this.toastr.error('Failed to load cycle details');
        this.isLoading = false;
        this.router.navigate(['/cycles']);
      }
    });
  }
  backToList(): void {
    this.router.navigate(['/cycles']);
  }

  proceedToPayment(): void {
    if (this.cycle) {
      this.router.navigate(['/cycle-shop'], {
        queryParams: { cycleId: this.cycle.cycleId }
      });
    }
  }

  zoomImage(): void {
    // Create a modal or lightbox to show the zoomed image
    // This is a placeholder for the zoom functionality
    // You can implement a proper image zoom modal here
    console.log('Zoom image clicked');
  }
}
import { Component, OnInit, Input } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { CycleService } from '../../services/cycle.service';
import { Cycle, CycleBrand, CycleType } from '../../models/cycle.model';
import { ToastrService } from 'ngx-toastr';
import { map, of, switchMap } from 'rxjs';
import { CycleResponseDto } from 'src/app/models/cycle.dto';

@Component({
  selector: 'app-cycle-form',
  templateUrl: './cycle-form.component.html',
  styleUrls: ['./cycle-form.component.scss']
})
export class CycleFormComponent implements OnInit {
  cycleForm: FormGroup;
  isSubmitting = false;
  cycleId: number | null = null;
  brands: CycleBrand[] = [];
  types: CycleType[] = [];
  previewImage: string | null = null;

  constructor(
    private fb: FormBuilder,
    private cycleService: CycleService,
    private route: ActivatedRoute,
    private router: Router,
    private toastr: ToastrService
  ) {
    this.cycleForm = this.fb.group({
      cycleId: [null],
      modelName: ['', Validators.required],
      brandId: ['', Validators.required],
      typeId: ['', Validators.required],
      description: [''],
      price: [0, [Validators.required, Validators.min(0)]],
      stockQuantity: [0, [Validators.required, Validators.min(0)]],
      imageUrl: ['']
    });
  }

  ngOnInit(): void {
    this.cycleId = this.route.snapshot.params['id'];
    
    // Load brands and types
    this.loadBrandsAndTypes();    
    // If editing, load the cycle data
    if (this.cycleId) {
      this.loadCycle(this.cycleId);
    }

    // Image URL change subscription for preview
    this.cycleForm.get('imageUrl')?.valueChanges.subscribe(url => {
      this.previewImage = url || null;
    });
  }

  loadBrandsAndTypes(): void {
    // In a real app, you'd get these from your API
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

  loadCycle(id: number): void {
    this.cycleService.getCycle(id).subscribe({
      next: (cycle) => {
        this.cycleForm.patchValue({
          modelName: cycle.modelName,
          price: cycle.price,
          stockQuantity: cycle.stockQuantity,
          description: cycle.description,
          imageUrl: cycle.imageUrl,
          brandId: cycle.brandId,     // dropdown uses brandId
          typeId: cycle.typeId        // dropdown uses typeId
        });
      },
      error: () => {
        this.toastr.error('Failed to load cycle');
        this.router.navigate(['/cycles']);
      }
    });
  }
  selectedImage: File | null = null;
isUploadingImage = false;

// Add this method
onImageSelected(file: File | null): void {
  this.selectedImage = file;
  if (!file) {
    this.cycleForm.patchValue({ imageUrl: '' });
    this.cycleForm.get('imageUrl')?.markAsDirty;
    this.cycleForm.get('imageUrl')?.markAsTouched;
  }
}

  // onSubmit(): void {
  //   if (this.cycleForm.invalid) return;
  
  //   this.isSubmitting = true;
  
  //   // ✅ Include cycleId for update
  //   const cycleData = this.cycleId
  //     ? { ...this.cycleForm.value, cycleId: this.cycleId }
  //     : this.cycleForm.value;
  
  //   const operation = this.cycleId
  //     ? this.cycleService.updateCycle(this.cycleId, cycleData)
  //     : this.cycleService.createCycle(cycleData);
  
    // operation.subscribe({
    //   next: () => {
    //     this.toastr.success(`Cycle ${this.cycleId ? 'updated' : 'created'} successfully`);
    //     this.router.navigate(['/cycles']);
    //   },
    //   error: (err) => {
    //     this.toastr.error(`Failed to ${this.cycleId ? 'update' : 'create'} cycle`);
    //     this.isSubmitting = false;
    //     console.error(err);
    //   }
    // });

//     operation.pipe(
//       switchMap(cycle => {
//         if (this.selectedImage) {
//           this.isUploadingImage = true;
//           return this.cycleService.uploadCycleImage(cycle.cycleId, this.selectedImage).pipe(
//             map(() => cycle)
//           );
//         }
//         return of(cycle);
//       })
//     ).subscribe({
//       next: () => {
//         this.toastr.success(`Cycle ${this.cycleId ? 'updated' : 'created'} successfully`);
//         this.router.navigate(['/cycles']);
//       },
//       error: () => {
//         this.toastr.error(`Failed to ${this.cycleId ? 'update' : 'create'} cycle`);
//         this.isSubmitting = false;
//         this.isUploadingImage = false;
//       }
//     });
//   }  
// }

// onSubmit(): void {
//   if (this.cycleForm.invalid) return;
  

//   this.isSubmitting = true;

//   // Extract form values
//   const formValue = this.cycleForm.value;
//   console.log('Form value:', formValue);

//   const cycle = this.cycleForm.value as CycleDto;
//   cycle.cycleId = Number(cycle.cycleId);

//   // Find the full brand and type objects
//   const selectedBrand = this.brands.find(b => b.brandId === formValue.brandId);
//   const selectedType = this.types.find(t => t.typeId === formValue.typeId);

//   // Construct the correct payload

//   const cycleDto: CycleDto = {
//     ...(this.cycleId && { cycleId: this.cycleId }),
//     modelName: formValue.modelName,
//     price: formValue.price,
//     stockQuantity: formValue.stockQuantity,
//     description: formValue.description,
//     imageUrl: '', // fill if needed
//     brandId: formValue.brandId,
//     typeId: formValue.typeId
//   };
//   console.log('Payload being sent:', cycleDto);

//   const operation = this.cycleId
//     ? this.cycleService.updateCycle(this.cycleId, cycleDto)
//     : this.cycleService.createCycle(cycleDto);

//   operation.pipe(
//     switchMap(cycle => {
//       if (this.selectedImage) {
//         this.isUploadingImage = true;
//         return this.cycleService.uploadCycleImage(cycle.cycleId, this.selectedImage).pipe(
//           map(() => cycle)
//         );
//       }
//       return of(cycle);
//     })
//   ).subscribe({
//     next: () => {
//       this.toastr.success(`Cycle ${this.cycleId ? 'updated' : 'created'} successfully`);
//       this.router.navigate(['/cycles']);
//     },
//     error: () => {
//       this.toastr.error(`Failed to ${this.cycleId ? 'update' : 'create'} cycle`);
//       this.isSubmitting = false;
//       this.isUploadingImage = false;
//     }
//   });
// }
// }
onSubmit(): void {
  if (this.cycleForm.invalid) return;

  this.isSubmitting = true;

  const formValue = this.cycleForm.value;
  const selectedBrand = this.brands.find(b => b.brandId === Number(formValue.brandId));
  const selectedType = this.types.find(t => t.typeId === Number(formValue.typeId));

  const cycleDto: CycleResponseDto = {
    modelName: formValue.modelName,
    price: formValue.price,
    stockQuantity: formValue.stockQuantity,
    description: formValue.description,
    imageUrl: '', // Will be updated if image is uploaded
    brandId: Number(formValue.brandId),
    brandName:selectedBrand?.brandName || '',
    typeId: Number(formValue.typeId),
    typeName: selectedType?.typeName || '',
    cycleId: 0
  };
  if (this.cycleId) {
    cycleDto.cycleId = this.cycleId;
  }

  const operation = this.cycleId
    ? this.cycleService.updateCycle(this.cycleId, cycleDto)
    : this.cycleService.createCycle(cycleDto);

  operation.pipe(
    switchMap((cycle: CycleResponseDto) => {
      console.log('Returned cycle with names:', cycle); // 🔍 Logs brandName and typeName

      if (this.selectedImage) {
        this.isUploadingImage = true;
        return this.cycleService.uploadCycleImage(cycle.cycleId, this.selectedImage).pipe(
          map(() => cycle) // return the same cycle object
        );
      }
      return of(cycle);
    })
  ).subscribe({
    next: () => {
      this.toastr.success(`Cycle ${this.cycleId ? 'updated' : 'created'} successfully`);
      this.router.navigate(['/cycles']);
    },
    error: () => {
      this.toastr.error(`Failed to ${this.cycleId ? 'update' : 'create'} cycle`);
      this.isSubmitting = false;
      this.isUploadingImage = false;
    }
  });
}
}

import { Component, EventEmitter, Output } from '@angular/core';

@Component({
  selector: 'app-image-upload',
  templateUrl: './image-upload.component.html',
  styleUrls: ['./image-upload.component.scss']
})
export class ImageUploadComponent {
  @Output() imageSelected = new EventEmitter<File>();
  imagePreview: string | ArrayBuffer | null = null;
  isDragging = false;
  uploadProgress: number | null = null;

  onFileSelected(event: any): void {
    const file = event.target.files[0];
    this.processFile(file);
  }

  onDrop(event: DragEvent): void {
    event.preventDefault();
    this.isDragging = false;
    const file = event.dataTransfer?.files[0];
    if (file && file.type.match('image.*')) {
      this.processFile(file);
    }
  }

  onDragOver(event: DragEvent): void {
    event.preventDefault();
    this.isDragging = true;
  }

  onDragLeave(event: DragEvent): void {
    event.preventDefault();
    this.isDragging = false;
  }

  processFile(file: File): void {
    if (!file.type.match('image.*')) return;

    const reader = new FileReader();
    reader.onload = () => {
      this.imagePreview = reader.result;
      this.imageSelected.emit(file);
    };
    reader.readAsDataURL(file);
  }

  removeImage(): void {
    this.imagePreview = null;
    this.imageSelected.emit(); //---------EmitterVisitorContext(NULL)
  }
}
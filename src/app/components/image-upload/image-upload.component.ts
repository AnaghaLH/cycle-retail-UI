import { HttpClient, HttpEventType, HttpHeaders, HttpResponse } from '@angular/common/http';
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
  constructor(private http:HttpClient){}

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
  uploadImage(file: File, cycleId: number): void {
    const formData = new FormData();
    formData.append('file', file, file.name);

    this.http.post(`http://localhost:5081/api/cycles/${cycleId}/upload-image`, formData, {
      headers: new HttpHeaders(),
      reportProgress: true,
      observe: 'events',
    }).subscribe(event => {
      switch (event.type) {
        case HttpEventType.UploadProgress:
          if (event.total) {
            this.uploadProgress = Math.round((100 * event.loaded) / event.total);
          }
          break;
        case HttpEventType.Response:
          if (event instanceof HttpResponse) {
            console.log('Image upload successful:', event.body);
          }
          break;
      }
    });
  }
}

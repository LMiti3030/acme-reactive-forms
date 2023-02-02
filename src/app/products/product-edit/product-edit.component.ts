import { AfterViewInit, Component, ElementRef, OnDestroy, OnInit, ViewChildren } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormControlName, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, RouteConfigLoadStart, Router } from '@angular/router';
import { debounceTime, fromEvent, merge, Observable, Subscription } from 'rxjs';
import { GenericValidator } from 'src/app/shared/generic-validator';
import { NumberValidators } from 'src/app/shared/number.validator';
import { Product } from '../product';
import { ProductService } from '../product.service';

@Component({
  selector: 'app-product-edit',
  templateUrl: './product-edit.component.html',
  styleUrls: ['./product-edit.component.css']
})
export class ProductEditComponent implements OnInit, AfterViewInit, OnDestroy{

  @ViewChildren(FormControlName, {read: ElementRef}) formInputElements!: ElementRef[];

  pageTitle='Product Edit';
  errorMessage='';
  productForm!: FormGroup;

  product!: Product;
  private sub!: Subscription;

  //use with the generic validation message class
  displayMessage:{ [key:string]:string} ={};
  private validationMessages: {[key:string] : {[key:string] : string}};
  private genericValidator: GenericValidator;

  get tags(): FormArray{
    return this.productForm.get('tags') as FormArray;
  }

  constructor( private fb: FormBuilder,
      private route: ActivatedRoute,
      private router: Router,
      private productService: ProductService){

      //Defines all the validation messages for the form
      //These could instead be retrieved from a file or database
      this.validationMessages = {
        productName: {
          required: 'Product name is required',
          minlength: 'Product name must be at least 3 characters',
          maxlength: 'Product name cannot exceed 50 characters'
        },
        productCode: {
          required: 'Product code is required.'
        },
        starRating: {
          range: 'Rate the product between 1(lowest) and 5 (highest).'
        }
      };

      //define an instance of the validator for use with this form,
      //passing in this form's set of validation messages
      this.genericValidator = new GenericValidator(this.validationMessages);

  }

  ngOnInit(): void {
    this.productForm = this.fb.group({
      productName: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(50)]],
      productCode: ['', Validators.required],
      starRating: ['', NumberValidators.range(1,5)],
      tags: this.fb.array([]),
      description: ''
    });

    //read the product id from the route parameter
    this.sub = this.route.paramMap.subscribe({
      next: params =>{
        const id = Number(this.route.snapshot.paramMap.get('id'));
        this.getProduct(id);
      }
    })
  }

  ngOnDestroy(): void {
    this.sub.unsubscribe();
  }

  ngAfterViewInit(): void {
    //Watch for  the blur event from any input element on the form
    //This is required because valueChanges does not provide notification on blur
    const controlBlurs : Observable<any>[] = this.formInputElements.map(
      (formControl: ElementRef) => fromEvent(formControl.nativeElement, 'blur')
    );

    //merge the blur event observable with the valueChanges observable
    //so we only need to subscribe once
    merge(this.productForm.valueChanges, ...controlBlurs)
    .pipe(
      debounceTime(800)
    ).subscribe({
      next: value =>  this.displayMessage = this.genericValidator.processMessages(this.productForm)
    });
  }

  addTag():void{
    this.tags.push(new FormControl());
  }

  deleteTag(index: number) : void{
    this.tags.removeAt(index);
    this.tags.markAsDirty();
  }

  getProduct(id: number) : void{
    this.productService.getProduct(id)
    .subscribe({
      next: (product:Product) => this.displayProduct(product),
      error: err => this.errorMessage = err
    });
  }

  displayProduct(product: Product): void{
    if(this.productForm){
      this.productForm.reset();
    }
    this.product = product;

    if(this.product.id === 0) {
      this.pageTitle = "Add Product";
    } else{
      this.pageTitle = `Edit Product: ${this.product.productName}`;
    }

    //update the data on the form
    this.productForm.patchValue({
      productName: this.product.productName,
      productCode: this.product.productCode,
      starRating: this.product.starRating,
      description: this.product.description
    });
    this.productForm.setControl('tags', this.fb.array(this.product.tags || []));
  }

  deleteProduct(): void{
    if(this.product.id === 0){
      //Don't delete, it was never saved
      this.onSaveComplete();
    } else if (this.product.id){
      if(confirm(`Really delete the product: ${this.product.productName}?`)){
        this.productService.deleteProduct(this.product.id)
        .subscribe({
          next: () => this.onSaveComplete(),
          error: err => this.errorMessage = err
        })
      }
    }
  }


  saveProduct(): void{
    if(this.productForm.valid){
      if(this.productForm.dirty){
        const p = { ...this.product, ...this.productForm.value };

        if(p.id === 0){
          this.productService.createProduct(p)
          .subscribe({
            next: x => {
              console.log(x);
              return this.onSaveComplete();
            },
            error: err => this.errorMessage = err
          });
        } else{
          this.productService.updateProduct(p)
          .subscribe({
            next: x => this.onSaveComplete(),
            error: err => this.errorMessage = err
          });
        }
      } else{
        this.onSaveComplete();
      }
    } else{
      this.errorMessage = 'Please correct the validation errors';
    }
  }

  onSaveComplete():void{
    //Reset form to clear the flags
    this.productForm.reset();
    this.router.navigate(['/products']);
  }

}

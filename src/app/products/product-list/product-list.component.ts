import { Component, OnInit } from '@angular/core';
import { Product } from '../product';
import { ProductService } from '../product.service';

@Component({
  selector: 'app-product-list',
  templateUrl: './product-list.component.html',
  styleUrls: ['./product-list.component.css']
})

export class ProductListComponent implements OnInit{

  pageTitle = 'Product List';
  imageWidth = 50;
  imageMargin = 2;
  showImage = false;
  errorMessage = '';
  filteredProducts: Product[] =[];
  products: Product[] = [];

  _listFilter='';
  get listFilter(): string{
    return this._listFilter;
  }

  set listFilter(value: string){
    this._listFilter = value;
    this.filteredProducts = this.listFilter ? this.performFilter(this.listFilter) : this.products;
  }

  constructor(private productService: ProductService){

  }

  performFilter(filterBy: string): Product[]{
    filterBy = filterBy.toLocaleLowerCase();
    return this.products.filter(
      (product: Product) => product.productName.toLocaleLowerCase().indexOf(filterBy) !== -1
    );
  }

  //checks both the product name and tags
  performFilter2(filterBy:string ): Product[]{
    filterBy = filterBy.toLocaleLowerCase();
    return this.products.filter(
      (product: Product) => product.productName.toLocaleLowerCase().indexOf(filterBy) !== -1 ||
      (product.tags &&
        product.tags.some( tag => tag.toLocaleLowerCase().indexOf(filterBy) !== -1 )
        )
    );
  }

  toggleImage(){
    this.showImage = !this.showImage;
  }

  ngOnInit(): void {
    console.log('inside ngOnInit');
    this.productService.getProducts().subscribe({
      next: products => {
        console.log(products);
        this.products = products;
        this.filteredProducts = this.products;
      },
      error : err => this.errorMessage = err
    })
  }

}

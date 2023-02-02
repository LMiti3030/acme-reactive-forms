import {
  HttpClient,
  HttpErrorResponse,
  HttpHeaders,
} from '@angular/common/http';
import { Injectable } from '@angular/core';
import { catchError, map, Observable, of, tap, throwError } from 'rxjs';
import { Product } from './product';

@Injectable({
  providedIn: 'root',
})
export class ProductService {
  private productsUrl = 'api/products';

  constructor(private http: HttpClient) {}

  getProducts(): Observable<Product[]> {
    console.log('getProducts()' );
    return this.http
      .get<Product[]>(this.productsUrl)
      .pipe(
        tap((data) => console.log(JSON.stringify(data)) ),
        catchError(this.handleError)
      );
  }

  getProduct(id: number): Observable<Product> {
    if (id === 0) {
      return of(this.initializeProduct());
    }
    const url = `${this.productsUrl}/${id}`;
    return this.http
      .get<Product>(url)
      .pipe(
        tap( (data) => console.log('getProduct: ' + JSON.stringify(data)),
        ),
        catchError(this.handleError)
      );
  }

  createProduct(product: Product): Observable<Product> {
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    product.id = null;
    return this.http
      .post<Product>(this.productsUrl, product, { headers })
      .pipe(
        tap((data) => console.log('createProduct: ' + JSON.stringify(data)),
        ),
        catchError(this.handleError)
      );
  }

  deleteProduct(id: number): Observable<Product> {
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    const url = `${this.productsUrl}/${id}`;
    return this.http
      .delete<Product>(url, { headers })
      .pipe(
        tap( () => console.log('deleteProduct: ' + id),
        ),
        catchError(this.handleError)
      );
  }

  updateProduct(product : Product) : Observable<Product>{
    const headers = new HttpHeaders({ 'Content-Type' : 'application/json'});
    const url = `${this.productsUrl}/${product.id}`;
    return this.http.put<Product>(url, product, { headers })
      .pipe(
        tap( () => console.log('updateProduct: ' + product.id),
        ),
        //return the product on an update
        map( () => product ),
        catchError(this.handleError)
      );
  }

  private handleError(err: HttpErrorResponse): Observable<never> {
    //in a real world app, we may send the server to some remote logging infrastructure
    //instead of just logging it to  the console
    let errorMessage = '';
    if (err.error instanceof ErrorEvent) {
      //A client-side or network error occured. handle it accordingly
      errorMessage = `An error occurred: ${err.error.message}`;
    } else {
      //the backend returned an unsuccessful response code
      //the response body may contain clues as to what went wrong
      errorMessage = `Server returned code: ${err.status}, error message is: ${err.message}`;
    }
    console.log(errorMessage);
    return throwError(() => errorMessage);
  }

  private initializeProduct(): Product {
    //return an initialized product
    return {
      id: 0,
      productName: '',
      productCode: '',
      tags: [''],
      releaseDate: '',
      price: 0,
      description: '',
      starRating: 0,
      imageUrl: '',
    };
  }
}

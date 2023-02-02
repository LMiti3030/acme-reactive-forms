import { Injectable } from '@angular/core';
import {
  ActivatedRouteSnapshot,
  CanDeactivate,
  RouterStateSnapshot,
  UrlTree,
} from '@angular/router';
import { Observable } from 'rxjs';
import { ProductEditComponent } from './product-edit/product-edit.component';

@Injectable({
  providedIn: 'root',
})
export class ProductEditGuard implements CanDeactivate<ProductEditComponent> {
  canDeactivate(
    component: ProductEditComponent
  ):
    boolean
    | Observable<boolean >
    | Promise<boolean> {
      if(component.productForm.dirty){
        const productName = component.productForm.get('productName')?.value || 'New Product';
        return confirm(`Navigate away and lose all changes to ${productName}?`);
      }
      return true;
    }
}

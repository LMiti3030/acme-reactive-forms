import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';

@Component({
  selector: 'app-star',
  templateUrl: './star.component.html',
  styleUrls: ['./star.component.css']
})
export class StarComponent implements OnChanges{


  @Input() rating = 0;
  starWidth = 0;
  @Output() ratingClicked: EventEmitter<string> = new EventEmitter<string>();


  ngOnChanges(changes: SimpleChanges): void {
   this.starWidth = this.rating * 75 / 5;
  }

  onClick() : void {
    this.ratingClicked.emit(`The rating ${this.rating} was clicked`);
  }

}

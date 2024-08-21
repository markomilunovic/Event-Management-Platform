import { Event } from 'src/modules/event/models/event.model';

export class EventResponseDto {
  id: number;
  title: string;
  description: string;
  location: string;
  category: string;
  date: Date;
  time: string;

  constructor(event: Event) {
    this.id = event.id;
    this.title = event.title;
    this.description = event.description;
    this.location = event.location;
    this.category = event.category;
    this.date = event.date;
    this.time = event.time;
  }
}

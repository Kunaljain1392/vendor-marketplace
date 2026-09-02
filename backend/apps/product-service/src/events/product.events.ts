export interface ProductCreatedEvent {
  productId: string;
  vendorId: string;
  name: string;
  category: string;
  price: string;
}

export interface ProductUpdatedEvent {
  productId: string;
  vendorId: string;
  name: string;
  category: string;
  price: string;
}

export interface ProductStatusChangedEvent {
  productId: string;
  vendorId: string;
  status: string;
}
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  Unique,
  UpdateDateColumn,
} from "typeorm";

import { Cart } from "./cart.entity";

@Entity("cart_items")
@Unique("UQ_cart_product", ["cartId", "productId"])
export class CartItem {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column({
    name: "cart_id",
    type: "uuid",
  })
  cartId!: string;

  @ManyToOne(() => Cart, (cart) => cart.items, {
    onDelete: "CASCADE",
  })
  @JoinColumn({
    name: "cart_id",
  })
  cart!: Cart;

  @Column({
    name: "product_id",
    type: "uuid",
  })
  productId!: string;

  @Column({
    name: "product_name",
    type: "varchar",
    length: 255,
  })
  productName!: string;

  @Column({
    type: "numeric",
    precision: 12,
    scale: 2,
  })
  price!: string;

  @Column({
    type: "integer",
  })
  quantity!: number;

  @CreateDateColumn({
    name: "created_at",
    type: "timestamptz",
  })
  createdAt!: Date;

  @UpdateDateColumn({
    name: "updated_at",
    type: "timestamptz",
  })
  updatedAt!: Date;
}
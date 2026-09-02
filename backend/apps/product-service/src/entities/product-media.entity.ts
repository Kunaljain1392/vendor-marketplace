import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from "typeorm";

import { Product } from "./product.entity";
import { ProductMediaType } from "./enum/product-media-type.enum";

@Entity("product_media")
@Index(["productId", "type"])
@Index(["productId", "isPrimary"])
export class ProductMedia {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Index()
  @Column({ type: "uuid" })
  productId!: string;

  @Column({
    type: "enum",
    enum: ProductMediaType,
  })
  type!: ProductMediaType;

  @Column({
    type: "text",
  })
  url!: string;

  @Column({
  type: "varchar",
  length: 500,
})
publicId!: string;

  @Column({
    type: "boolean",
    default: false,
  })
  isPrimary!: boolean;

  @CreateDateColumn()
  createdAt!: Date;

  @ManyToOne(
    () => Product,
    (product) => product.media,
    {
      onDelete: "CASCADE",
    },
  )
  @JoinColumn({ name: "productId" })
  product!: Product;
}

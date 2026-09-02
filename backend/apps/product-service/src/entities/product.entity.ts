import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";

import { ProductMedia } from "./product-media.entity";
import { ProductStatus } from "./enum/product-status.enum";

@Entity("products")
@Index(["vendorId", "status"])
@Index(["vendorId", "name"], { unique: true })
@Index(["category"])
export class Product {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column({ type: "uuid" })
  vendorId!: string;

  @Column({
    type: "varchar",
    length: 150,
  })
  name!: string;

  @Column({
    type: "text",
    nullable: true,
  })
  description!: string | null;

  @Column({
    type: "varchar",
    length: 100,
  })
  category!: string;

  @Column({
    type: "decimal",
    precision: 12,
    scale: 2,
  })
  price!: string;

  @Column({
    type: "enum",
    enum: ProductStatus,
    default: ProductStatus.ACTIVE,
  })
  status!: ProductStatus;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;

  @OneToMany(
    () => ProductMedia,
    (productMedia) => productMedia.product,
    {
      cascade: true,
    },
  )
  media!: ProductMedia[];
}
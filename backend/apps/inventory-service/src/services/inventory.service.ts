import { Repository } from "typeorm";

import { AppDataSource } from "../config/database.js";
import { AppError } from "../errors/app-error.js";
import { getProduct } from "../clients/product.client.js";
import { publishInventoryEvent } from "../events/inventory.events.js";
import { Inventory } from "../entities/inventory.entity.js";

export class InventoryService {
  private readonly inventoryRepository: Repository<Inventory>;

  constructor() {
    this.inventoryRepository = AppDataSource.getRepository(Inventory);
  }

  async createInventory(
    productId: string,
    quantity: number,
    token: string,
    userId: string,
  ): Promise<Inventory> {
    const product = await getProduct(productId, token);

    if (product.vendorId !== userId) {
      throw new AppError(403, "You do not own this product");
    }

    const existingInventory = await this.inventoryRepository.findOne({
      where: { productId },
    });

    if (existingInventory) {
      throw new AppError(
        409,
        "Inventory already exists for this product",
      );
    }

    const inventory = this.inventoryRepository.create({
      productId,
      quantity,
    });

    const savedInventory = await this.inventoryRepository.save(inventory);

    publishInventoryEvent("inventory.created", {
      productId: savedInventory.productId,
      quantity: savedInventory.quantity,
    });

    return savedInventory;
  }

  async getInventory(productId: string): Promise<Inventory> {
    const inventory = await this.inventoryRepository.findOne({
      where: { productId },
    });

    if (!inventory) {
      throw new AppError(404, "Inventory not found");
    }

    return inventory;
  }

  async updateInventory(
    productId: string,
    quantity: number,
    token: string,
    userId: string,
  ): Promise<Inventory> {
    const product = await getProduct(productId, token);

    if (product.vendorId !== userId) {
      throw new AppError(403, "You do not own this product");
    }

    const inventory = await this.inventoryRepository.findOne({
      where: { productId },
    });

    if (!inventory) {
      throw new AppError(404, "Inventory not found");
    }

    const previousQuantity = inventory.quantity;

    inventory.quantity = quantity;

    const updatedInventory =
      await this.inventoryRepository.save(inventory);

    publishInventoryEvent("inventory.stock_updated", {
      productId: updatedInventory.productId,
      previousQuantity,
      quantity: updatedInventory.quantity,
    });

    if (previousQuantity > 0 && updatedInventory.quantity === 0) {
      publishInventoryEvent("inventory.stock_depleted", {
        productId: updatedInventory.productId,
        remainingQuantity: 0,
      });
    }

    return updatedInventory;
  }

  async decreaseStock(
    productId: string,
    quantity: number,
    orderId?: string,
  ): Promise<Inventory> {
    const result = await this.inventoryRepository
      .createQueryBuilder()
      .update(Inventory)
      .set({
        quantity: () => `"quantity" - ${quantity}`,
      })
      .where("productId = :productId", { productId })
      .andWhere("quantity >= :quantity", { quantity })
      .returning("*")
      .execute();

    if (result.affected !== 1 || !result.raw[0]) {
      const inventory = await this.inventoryRepository.findOne({
        where: { productId },
      });

      if (!inventory) {
        throw new AppError(404, "Inventory not found");
      }

      throw new AppError(409, "Insufficient stock");
    }

    const updatedInventory = result.raw[0] as Inventory;

    publishInventoryEvent("inventory.stock_decreased", {
      productId,
      quantity,
      remainingQuantity: updatedInventory.quantity,
      orderId,
    });

    if (updatedInventory.quantity === 0) {
      publishInventoryEvent("inventory.stock_depleted", {
        productId,
        remainingQuantity: 0,
        orderId,
      });
    }

    return updatedInventory;
  }
}

export const inventoryService = new InventoryService();
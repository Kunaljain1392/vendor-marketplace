import { productClient } from "../clients/product.client.js";
import { AppDataSource } from "../config/database.js";
import { logger } from "../config/logger.js";
import { Cart } from "../entities/cart.entity.js";
import { CartItem } from "../entities/cart-item.entity.js";
import { AppError } from "../shared/errors/app-error.js";
import { publishCartEvent } from "../config/rabbitmq.js";

export interface CartResponseItem {
  id: string;
  productId: string;
  productName: string;
  price: number;
  quantity: number;
  subtotal: number;
}

export interface CartResponse {
  id: string;
  userId: string;
  items: CartResponseItem[];
  totalItems: number;
  totalAmount: number;
  createdAt: Date;
  updatedAt: Date;
}

export class CartService {
  private get cartRepository() {
    return AppDataSource.getRepository(Cart);
  }

  private get cartItemRepository() {
    return AppDataSource.getRepository(CartItem);
  }

  /**
   * Converts the TypeORM Cart entity into the API response.
   */
  private buildCartResponse(cart: Cart): CartResponse {
    const items: CartResponseItem[] = cart.items.map((item) => {
      const price = Number(item.price);
      const subtotal = price * item.quantity;

      return {
        id: item.id,
        productId: item.productId,
        productName: item.productName,
        price,
        quantity: item.quantity,
        subtotal: Number(subtotal.toFixed(2)),
      };
    });

    const totalItems = items.reduce(
      (total, item) => total + item.quantity,
      0,
    );

    const totalAmount = items.reduce(
      (total, item) => total + item.subtotal,
      0,
    );

    return {
      id: cart.id,
      userId: cart.userId,
      items,
      totalItems,
      totalAmount: Number(totalAmount.toFixed(2)),
      createdAt: cart.createdAt,
      updatedAt: cart.updatedAt,
    };
  }

  async getCart(userId: string): Promise<CartResponse> {
    let cart = await this.cartRepository.findOne({
      where: {
        userId,
      },
      relations: {
        items: true,
      },
    });

    if (!cart) {
      logger.info(
        {
          userId,
        },
        "Creating new cart for user",
      );

      cart = this.cartRepository.create({
        userId,
      });

      await this.cartRepository.save(cart);

      cart.items = [];
    }

    return this.buildCartResponse(cart);
  }

  async addItem(
    userId: string,
    productId: string,
    quantity: number,
    token: string,
  ): Promise<CartResponse> {
    logger.info(
      {
        userId,
        productId,
        quantity,
      },
      "Adding item to cart",
    );

    // Product Service is the source of truth for
    // product existence, status, name and price.
    const product = await productClient.getProduct(
      productId,
      token,
    );

    const cart = await this.getCartEntity(userId);

    const existingItem = cart.items.find(
      (item) => item.productId === productId,
    );

    if (existingItem) {
      const newQuantity =
        existingItem.quantity + quantity;

      if (newQuantity > 100) {
        logger.warn(
          {
            userId,
            productId,
            currentQuantity: existingItem.quantity,
            requestedQuantity: quantity,
          },
          "Cart item quantity limit exceeded",
        );

        throw new AppError(
          400,
          "Cart item quantity cannot exceed 100",
        );
      }

      existingItem.quantity = newQuantity;

      // Keep the product snapshot updated.
      existingItem.productName = product.name;
      existingItem.price = String(product.price);

      await this.cartItemRepository.save(existingItem);

      logger.info(
        {
          userId,
          productId,
          quantity: newQuantity,
        },
        "Existing cart item quantity increased",
      );
    } else {
      const cartItem = this.cartItemRepository.create({
        cartId: cart.id,
        productId: product.id,
        productName: product.name,
        price: String(product.price),
        quantity,
      });

      await this.cartItemRepository.save(cartItem);

      logger.info(
        {
          userId,
          productId,
          quantity,
        },
        "New cart item created",
      );
    }

    await publishCartEvent("cart.item_added", {
  userId,
  cartId: cart.id,
  productId,
  quantity,
});

    return this.getCart(userId);
  }

  async updateItem(
    userId: string,
    productId: string,
    quantity: number,
    token: string,
  ): Promise<CartResponse> {
    logger.info(
      {
        userId,
        productId,
        quantity,
      },
      "Updating cart item",
    );

    const cart = await this.getCartEntity(userId);

    const item = cart.items.find(
      (cartItem) => cartItem.productId === productId,
    );

    if (!item) {
      logger.warn(
        {
          userId,
          productId,
        },
        "Cart item not found",
      );

      throw new AppError(
        404,
        "Cart item not found",
      );
    }

    const product = await productClient.getProduct(
      productId,
      token,
    );

    item.quantity = quantity;
    item.productName = product.name;
    item.price = String(product.price);

    await this.cartItemRepository.save(item);

    logger.info(
      {
        userId,
        productId,
        quantity,
      },
      "Cart item updated",
    );

    return this.getCart(userId);
  }

  async removeItem(
    userId: string,
    productId: string,
  ): Promise<CartResponse> {
    logger.info(
      {
        userId,
        productId,
      },
      "Removing cart item",
    );

    const cart = await this.getCartEntity(userId);

    const item = cart.items.find(
      (cartItem) => cartItem.productId === productId,
    );

    if (!item) {
      logger.warn(
        {
          userId,
          productId,
        },
        "Cart item not found",
      );

      throw new AppError(
        404,
        "Cart item not found",
      );
    }

    await this.cartItemRepository.remove(item);

    await publishCartEvent("cart.item_removed", {
  userId,
  cartId: cart.id,
  productId,
});

    logger.info(
      {
        userId,
        productId,
      },
      "Cart item removed",
    );

    return this.getCart(userId);
  }

  async clearCart(
    userId: string,
  ): Promise<CartResponse> {
    logger.info(
      {
        userId,
      },
      "Clearing cart",
    );

    const cart = await this.getCartEntity(userId);

    if (cart.items.length === 0) {
      logger.info(
        {
          userId,
        },
        "Cart is already empty",
      );

      return this.buildCartResponse(cart);
    }

    const itemCount = cart.items.length;

    await this.cartItemRepository.remove(cart.items);

    await publishCartEvent("cart.cleared", {
  userId,
  cartId: cart.id,
  itemCount,
});

    logger.info(
      {
        userId,
        itemCount,
      },
      "Cart items cleared",
    );

    return this.getCart(userId);
  }

  /**
   * Gets the database entity.
   * Kept private because controllers should receive
   * the API response rather than the raw entity.
   */
  private async getCartEntity(userId: string): Promise<Cart> {
    let cart = await this.cartRepository.findOne({
      where: {
        userId,
      },
      relations: {
        items: true,
      },
    });

    if (!cart) {
      logger.info(
        {
          userId,
        },
        "Creating new cart for user",
      );

      cart = this.cartRepository.create({
        userId,
      });

      await this.cartRepository.save(cart);

      cart.items = [];
    }

    return cart;
  }
}

export const cartService = new CartService();
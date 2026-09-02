import { publishEvent } from "./event-publisher";

import type {
  ProductCreatedEvent,
  ProductUpdatedEvent,
  ProductStatusChangedEvent,
} from "./product.events";

export const publishProductCreated = async (
  event: ProductCreatedEvent,
): Promise<void> => {
  await publishEvent(
    "product.created",
    event,
  );
};

export const publishProductUpdated = async (
  event: ProductUpdatedEvent,
): Promise<void> => {
  await publishEvent(
    "product.updated",
    event,
  );
};

export const publishProductStatusChanged =
  async (
    event: ProductStatusChangedEvent,
  ): Promise<void> => {
    await publishEvent(
      "product.status_changed",
      event,
    );
  };
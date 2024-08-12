export interface Attributes {
  urls: {
    customer_portal: string;
    update_payment_method: string;
    customer_portal_update_subscription: string;
  };
  pause: string | null;
  status: string;
  ends_at: string;
  order_id: number;
  store_id: number;
  cancelled: boolean;
  renews_at: string;
  test_mode: boolean;
  user_name: string;
  card_brand: string;
  created_at: string;
  product_id: number;
  updated_at: string;
  user_email: string;
  variant_id: number;
  customer_id: number;
  product_name: string;
  variant_name: string;
  order_item_id: number;
  trial_ends_at: string | null;
  billing_anchor: number;
  card_last_four: string;
  status_formatted: string;
  first_subscription_item: {
    id: number;
    price_id: number;
    quantity: number;
    created_at: string;
    updated_at: string;
    is_usage_based: boolean;
    subscription_id: number;
  };
}

export interface SubscriptionResponse {
  data: {
    id: string;
    type: "subscriptions";
    links: {
      self: string;
    };
    attributes: Attributes;
    relationships: {
      order: RelationshipLinks;
      store: RelationshipLinks;
      product: RelationshipLinks;
      variant: RelationshipLinks;
      customer: RelationshipLinks;
      order_item: RelationshipLinks;
      subscription_items: RelationshipLinks;
      subscription_invoices: RelationshipLinks;
    };
  };
  meta: {
    test_mode: boolean;
    event_name: string;
    webhook_id: string;
    custom_data: {
      user_id: string;
    };
  };
}

export interface RelationshipLinks {
  links: {
    self: string;
    related: string;
  };
}

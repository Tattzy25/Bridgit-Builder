import { loadScript } from "@paypal/paypal-js";
import { PricingPlan, TokenPackage } from "@/config/pricing";

// PayPal configuration
const PAYPAL_CLIENT_ID = import.meta.env.VITE_PAYPAL_CLIENT_ID || "test"; // TODO: Add to .env
const PAYPAL_ENVIRONMENT = import.meta.env.VITE_PAYPAL_ENVIRONMENT || "sandbox"; // sandbox or live

export interface PayPalSubscriptionResponse {
  subscriptionId: string;
  status: string;
  planId: string;
  userId: string;
}

export interface PayPalPaymentResponse {
  paymentId: string;
  status: string;
  amount: number;
  currency: string;
  userId: string;
}

export class PayPalService {
  private static instance: PayPalService;
  private paypal: any = null;
  private isLoaded = false;

  private constructor() {}

  static getInstance(): PayPalService {
    if (!PayPalService.instance) {
      PayPalService.instance = new PayPalService();
    }
    return PayPalService.instance;
  }

  // Initialize PayPal SDK
  async initialize(): Promise<boolean> {
    if (this.isLoaded) return true;

    try {
      this.paypal = await loadScript({
        "client-id": PAYPAL_CLIENT_ID,
        currency: "USD",
        intent: "subscription",
        vault: true,
        components: "buttons",
      });

      this.isLoaded = true;
      console.log("✅ PayPal SDK loaded");
      return true;
    } catch (error) {
      console.error("❌ PayPal SDK failed to load:", error);
      return false;
    }
  }

  // Create subscription payment
  async createSubscription(
    plan: PricingPlan,
    userId: string,
    containerElement: string,
  ): Promise<void> {
    if (!this.isLoaded) {
      await this.initialize();
    }

    if (!this.paypal || !plan.paypalPlanId) {
      throw new Error("PayPal not initialized or plan ID missing");
    }

    return new Promise((resolve, reject) => {
      this.paypal
        .Buttons({
          style: {
            shape: "rect",
            color: "gold",
            layout: "vertical",
            label: "subscribe",
            height: 50,
          },
          createSubscription: async (data: any, actions: any) => {
            return actions.subscription.create({
              plan_id: plan.paypalPlanId,
              application_context: {
                brand_name: "Bridgit AI",
                locale: "en-US",
                shipping_preference: "NO_SHIPPING",
                user_action: "SUBSCRIBE_NOW",
                payment_method: {
                  payer_selected: "PAYPAL",
                  payee_preferred: "IMMEDIATE_PAYMENT_REQUIRED",
                },
                return_url: `${window.location.origin}/subscription/success`,
                cancel_url: `${window.location.origin}/subscription/cancel`,
              },
              subscriber: {
                name: {
                  given_name: "User", // TODO: Get from user data
                  surname: "Name",
                },
              },
            });
          },
          onApprove: async (data: any, actions: any) => {
            try {
              // Subscription created successfully
              const subscriptionId = data.subscriptionID;

              // Send to backend to activate subscription
              const response = await fetch("/api/subscriptions/activate", {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                },
                body: JSON.stringify({
                  subscriptionId,
                  planId: plan.id,
                  userId,
                  paypalPlanId: plan.paypalPlanId,
                }),
              });

              if (!response.ok) {
                throw new Error("Failed to activate subscription");
              }

              const result = await response.json();
              console.log("✅ Subscription activated:", result);

              // Show success message
              window.dispatchEvent(
                new CustomEvent("subscription-success", {
                  detail: { plan, subscriptionId },
                }),
              );

              resolve();
            } catch (error) {
              console.error("❌ Subscription activation failed:", error);
              reject(error);
            }
          },
          onError: (error: any) => {
            console.error("❌ PayPal subscription error:", error);
            reject(error);
          },
          onCancel: (data: any) => {
            console.log("ℹ️ Subscription cancelled:", data);
            reject(new Error("Subscription cancelled by user"));
          },
        })
        .render(containerElement);
    });
  }

  // Create one-time payment for tokens
  async createTokenPayment(
    tokenPackage: TokenPackage,
    userId: string,
    containerElement: string,
  ): Promise<void> {
    if (!this.isLoaded) {
      await this.initialize();
    }

    if (!this.paypal || !tokenPackage.paypalProductId) {
      throw new Error("PayPal not initialized or product ID missing");
    }

    return new Promise((resolve, reject) => {
      this.paypal
        .Buttons({
          style: {
            shape: "rect",
            color: "blue",
            layout: "vertical",
            label: "pay",
            height: 50,
          },
          createOrder: async (data: any, actions: any) => {
            return actions.order.create({
              purchase_units: [
                {
                  amount: {
                    currency_code: tokenPackage.currency,
                    value: tokenPackage.price.toString(),
                  },
                  description: `${tokenPackage.name} - ${tokenPackage.tokens} tokens${
                    tokenPackage.bonus ? ` + ${tokenPackage.bonus} bonus` : ""
                  }`,
                  custom_id: `tokens_${userId}_${tokenPackage.id}`,
                },
              ],
              application_context: {
                brand_name: "Bridgit AI",
                locale: "en-US",
                shipping_preference: "NO_SHIPPING",
                user_action: "PAY_NOW",
                return_url: `${window.location.origin}/payment/success`,
                cancel_url: `${window.location.origin}/payment/cancel`,
              },
            });
          },
          onApprove: async (data: any, actions: any) => {
            try {
              const order = await actions.order.capture();

              // Send to backend to add tokens
              const response = await fetch("/api/tokens/purchase", {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                },
                body: JSON.stringify({
                  orderId: order.id,
                  packageId: tokenPackage.id,
                  userId,
                  tokens: tokenPackage.tokens + (tokenPackage.bonus || 0),
                  amount: tokenPackage.price,
                }),
              });

              if (!response.ok) {
                throw new Error("Failed to add tokens");
              }

              const result = await response.json();
              console.log("✅ Tokens purchased:", result);

              // Show success message
              window.dispatchEvent(
                new CustomEvent("token-purchase-success", {
                  detail: { tokenPackage, orderId: order.id },
                }),
              );

              resolve();
            } catch (error) {
              console.error("❌ Token purchase failed:", error);
              reject(error);
            }
          },
          onError: (error: any) => {
            console.error("❌ PayPal payment error:", error);
            reject(error);
          },
          onCancel: (data: any) => {
            console.log("ℹ️ Payment cancelled:", data);
            reject(new Error("Payment cancelled by user"));
          },
        })
        .render(containerElement);
    });
  }

  // Cancel subscription
  async cancelSubscription(subscriptionId: string): Promise<boolean> {
    try {
      const response = await fetch("/api/subscriptions/cancel", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ subscriptionId }),
      });

      if (!response.ok) {
        throw new Error("Failed to cancel subscription");
      }

      console.log("✅ Subscription cancelled");
      return true;
    } catch (error) {
      console.error("❌ Subscription cancellation failed:", error);
      return false;
    }
  }

  // Get subscription status
  async getSubscriptionStatus(subscriptionId: string): Promise<any> {
    try {
      const response = await fetch(`/api/subscriptions/${subscriptionId}`);

      if (!response.ok) {
        throw new Error("Failed to get subscription status");
      }

      return await response.json();
    } catch (error) {
      console.error("❌ Failed to get subscription status:", error);
      throw error;
    }
  }
}

export const paypalService = PayPalService.getInstance();

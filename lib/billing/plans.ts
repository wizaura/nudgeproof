/** Map public plan slugs to the values allowed by the subscriptions.plan enum. */
export function planSlugToSubscriptionPlan(plan: string | null | undefined) {
    switch (plan) {
        case "plus":
            return "starter";
        case "pro":
            return "growth";
        case "free":
            return "free";
        default:
            return null;
    }
}

/** Map database enum values back to the public plan slugs used by the UI. */
export function subscriptionPlanToPlanSlug(plan: string | null | undefined) {
    switch (plan) {
        case "starter":
            return "plus";
        case "growth":
            return "pro";
        case "free":
        // Keep compatibility with rows created before enum values were aligned.
        case "plus":
        case "pro":
            return plan;
        default:
            return null;
    }
}

// Plain data (not a client module), so server components can map over it.
export const STEPS = [
  { n: "01", title: "Create the event", body: "Name it, set the date and place, pick a cover colour. You become its Admin." },
  { n: "02", title: "Share one link", body: "Send it on WhatsApp. It shows the event before anyone has to sign up." },
  { n: "03", title: "Set each role", body: "Promote a helper, keep a guest to the basics. An event always keeps one Admin." },
] as const;

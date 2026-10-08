const rupees = new Intl.NumberFormat("en-PK", { maximumFractionDigits: 0 });

/** Whole rupees, Rs first: formatMoney(412000) === "Rs 412,000". */
export function formatMoney(amount: number): string {
  return `${amount < 0 ? "-" : ""}Rs ${rupees.format(Math.abs(amount))}`;
}

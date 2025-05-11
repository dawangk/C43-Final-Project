export const getPeriod = (period: string) => {
  let interval: string = "1 week";
  if (period === "5 years") {
    interval = "5 years"
  } else if (period === "1 year") {
    interval = "1 year"
  } else if (period === "quarter") {
    interval = "3 months"
  } else if (period === "month") {
    interval = "1 month"
  } else if (period === "week") {
    interval = "1 week"
  }
  return interval;
}
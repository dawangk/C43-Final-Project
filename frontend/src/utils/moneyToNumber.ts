export const moneyToNumber = (money: string) => {
  return parseFloat(money.slice(1).replace(/,/g, ""))
}
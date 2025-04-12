import pandas as pd
from pandas.tseries.offsets import CustomBusinessDay
from pandas.tseries.holiday import USFederalHolidayCalendar

# Define US business days (excludes weekends + federal holidays)
us_business_days = CustomBusinessDay(calendar=USFederalHolidayCalendar())

# Generate date range (business days only)
date_range = pd.date_range(start="2013-01-01", end="2020-12-31", freq=us_business_days)

# Create DataFrame with all zeros
df = pd.DataFrame({
    "symbol": "AAPL",
    "timestamp": date_range.strftime("%Y-%m-%d"),
    "open": 1,
    "high": 1,
    "low": 1,
    "close": 1,
    "volume": 1
})

# Save to CSV
df.to_csv("AAPL_2013_2020_business_days_ones.csv", index=False)
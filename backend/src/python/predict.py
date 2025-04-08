# predict.py

import sys
import pandas as pd
from prophet import Prophet

def get_days_from_period(period):
    lookup = {
        '1 week': 7,
        '1 month': 30,
        '3 months': 90,
        '1 year': 365,
        '5 years': 1825
    }
    return lookup.get(period, 30)

# Read args
period = sys.argv[1]  # e.g. '1 month'
days = get_days_from_period(period)

# Read input from stdin (CSV)
df = pd.read_csv(sys.stdin)
df = df.rename(columns={"timestamp": "ds", "close": "y"})

# Forecast
model = Prophet()
model.fit(df)

future = model.make_future_dataframe(periods=days)
forecast = model.predict(future)

# Output only needed columns
result = forecast[['ds', 'yhat', 'yhat_lower', 'yhat_upper']]
result.tail(days).to_json(sys.stdout, orient="records")
print(json.dumps(predictions), flush=True)
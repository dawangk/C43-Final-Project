# predict.py
import sys
import pandas as pd
from prophet import Prophet
import logging

logging.getLogger('prophet').setLevel(logging.WARNING)

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
period = sys.argv[1]
days = get_days_from_period(period)

# Read CSV from stdin
df = pd.read_csv(sys.stdin)
df = df.rename(columns={"timestamp": "ds", "close": "y"})

# Remove timezone info
df["ds"] = pd.to_datetime(df["ds"]).dt.tz_localize(None)

# Forecast
model = Prophet()
model.fit(df)

future = model.make_future_dataframe(periods=days)
forecast = model.predict(future)

result = forecast[['ds', 'yhat', 'yhat_lower', 'yhat_upper']]
result.tail(days).to_json(sys.stdout, orient="records")
sys.stdout.flush()

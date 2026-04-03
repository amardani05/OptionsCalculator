from .market_data import market_iv
import yfinance as yf # type: ignore
import pandas as pd # type: ignore
import plotly.graph_objects as go # type: ignore
from scipy.interpolate import griddata # type: ignore
import numpy as np # type: ignore
from datetime import datetime, timedelta # type: ignore

def build_surface(ticker):
    tick = yf.Ticker(ticker)
    df, spot = market_iv(ticker)
    calls = df[df['type'] == 'call'].copy()
    calls = calls[calls['T'] <= 0.5]
    calls['moneyness'] = calls['strike'] / spot
    
    # Create a uniform grid
    moneyness_grid = np.linspace(calls['moneyness'].min(), calls['moneyness'].max(), 50)
    T_grid = np.linspace(calls['T'].min(), calls['T'].max(), 50)
    X, Y = np.meshgrid(T_grid, moneyness_grid)
    
    # Interpolate scattered data onto the grid
    Z = griddata(
        points=(calls['T'].values, calls['moneyness'].values),
        values=calls['iv'].values,
        xi=(X, Y),
        method='linear'
    )
    
    return X, Y, Z, calls

def plot_surface(ticker):
    X, Y, Z, calls = build_surface(ticker)
    
    fig = go.Figure(data=[
        go.Surface(x=X, y=Y, z=Z, opacity=0.85, showscale=True),
        go.Scatter3d(
            x=calls['T'].values,
            y=calls['moneyness'].values,
            z=calls['iv'].values,
            mode='markers',
            marker=dict(size=2, color='white', opacity=0.8),
            name='Market Data'
        )
    ])

    fig.update_layout(
        title=f'{ticker} Volatility Surface',
        scene=dict(
            xaxis_title='Time to Expiry',
            yaxis_title='Moneyness (K/S)',
            zaxis_title='Implied Volatility'
        )
    )

    today = datetime.now()
    tick_vals = np.linspace(X.min(), X.max(), 6)  # 6 evenly spaced ticks
    tick_labels = [(today + timedelta(days=t * 365.25)).strftime('%Y-%m-%d') for t in tick_vals]

    fig.update_layout(
        scene=dict(
            xaxis=dict(
                title='Expiration',
                tickvals=tick_vals,
                ticktext=tick_labels
            )
        )
    )

    fig.show()

if __name__ == "__main__":
    print(plot_surface('SPY'))
from time import sleep

import numpy as np
import pandas as pd
import plotly.express as px
import streamlit as st

from streamlit_plotly_selectable_chart import plotly_selectable_chart

x = range(10000)
y = np.cumsum(x)
df = pd.DataFrame({"x": x, "y": y})

fig_state = st.session_state.get("fig")

if (fig_state is not None) and (fig_state.get("x0") is not None) and (fig_state.get("x1") is not None):
    x0 = fig_state["x0"]
    x1 = fig_state["x1"]
    df = df.query(f"{x0} < x < {x1}")


fig = px.line(data_frame=df, x="x", y="y")
fig.update_layout(dict(dragmode="select", selectdirection="h", clickmode="none"))


plotly_selectable_chart(
    fig,
    "fig",
    use_container_width=True,
    config=dict(
        modeBarButtonsToRemove=["zoom", "zoomIn", "zoomOut", "pan", "autoscale", "toImage"],
        displaylogo=False,
        displayModeBar=True,
    ),
)

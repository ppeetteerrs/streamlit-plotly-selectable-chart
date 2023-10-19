import json
import os
from typing import Any, Dict, Optional

import streamlit.components.v1 as components
from streamlit import type_util

_RELEASE = True

if not _RELEASE:
    _component_func = components.declare_component(
        "plotly_selectable_chart",
        url="http://localhost:3001",
    )
else:
    parent_dir = os.path.dirname(os.path.abspath(__file__))
    build_dir = os.path.join(parent_dir, "frontend/build")
    _component_func = components.declare_component("plotly_selectable_chart", path=build_dir)


def plotly_selectable_chart(
    figure_or_data: Any,
    key: str,
    use_container_width: bool = True,
    theme: Optional[str] = "streamlit",
    config: Dict[str, Any] = dict(displaylogo=False),
):
    import plotly.tools
    import plotly.utils

    if type_util.is_type(figure_or_data, "matplotlib.figure.Figure"):
        figure = plotly.tools.mpl_to_plotly(figure_or_data)

    else:
        figure = plotly.tools.return_figure_from_figure_or_data(figure_or_data, validate_figure=True)

    figure_spec = json.dumps(figure, cls=plotly.utils.PlotlyJSONEncoder)
    figure_config = json.dumps(config)

    theme = theme or ""
    component_value = _component_func(
        figure_spec=figure_spec,
        figure_config=figure_config,
        useContainerWidth=use_container_width,
        chart_theme=theme,
        key=key,
    )

    return component_value

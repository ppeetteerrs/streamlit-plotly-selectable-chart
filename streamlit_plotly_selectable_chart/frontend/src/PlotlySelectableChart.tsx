import { withTheme } from "@emotion/react"
import {
  ReactElement,
  ReactNode,
  useCallback,
  useLayoutEffect,
  useState,
} from "react"
import Plot from "react-plotly.js"
import {
  Streamlit,
  StreamlitComponentBase,
  withStreamlitConnection,
} from "streamlit-component-lib"
import {
  applyStreamlitTheme,
  layoutWithThemeDefaults,
  replaceTemporaryColors,
} from "./CustomTheme"
import emotionDarkTheme from "./theme/emotionDarkTheme"
import emotionLightTheme from "./theme/emotionLightTheme"

interface RangeState {
  x0: number | undefined
  x1: number | undefined
}

interface PlotlyChartProps {
  width: number
  height: number | undefined
  figure_spec: string
  figure_config: string
  useContainerWidth: boolean
  chart_theme: string
  theme: any
}

/** Render a Plotly chart from a FigureProto */
function PlotlyFigure({
  width,
  height,
  figure_spec,
  figure_config,
  useContainerWidth,
  chart_theme,
  theme,
}: PlotlyChartProps): ReactElement {
  const generateSpec = useCallback((): any => {
    const spec = JSON.parse(
      replaceTemporaryColors(figure_spec, theme, chart_theme)
    )
    const initialHeight = spec.layout.height
    const initialWidth = spec.layout.width
    if (useContainerWidth) {
      spec.layout.width = width
    } else {
      spec.layout.width = initialWidth
      spec.layout.height = initialHeight
    }
    if (chart_theme === "streamlit") {
      applyStreamlitTheme(spec, theme)
    } else {
      // Apply minor theming improvements to work better with Streamlit
      spec.layout = layoutWithThemeDefaults(spec.layout, theme)
    }

    return spec
  }, [chart_theme, useContainerWidth, figure_spec, theme, width])

  const [config, setConfig] = useState(JSON.parse(figure_config))
  const [spec, setSpec] = useState(generateSpec())
  const initial_range: RangeState = {
    x0: undefined,
    x1: undefined,
  }
  const [range, setRange] = useState(initial_range)

  // Update config and spec references iff the theme or props change
  // Use useLayoutEffect to synchronize rerender by updating state
  // More information: https://kentcdodds.com/blog/useeffect-vs-uselayouteffect
  useLayoutEffect(() => {
    setConfig(JSON.parse(figure_config))
    setSpec(generateSpec())
  }, [
    width,
    height,
    figure_spec,
    figure_config,
    useContainerWidth,
    chart_theme,
    theme,
    generateSpec,
  ])

  const { data, layout, frames } = spec

  Streamlit.setFrameHeight(450)

  return (
    <Plot
      key="original"
      className="stPlotlySelectableChart"
      data={data}
      layout={layout}
      config={config}
      frames={frames}
      onRelayout={(event) => {
        if (event["xaxis.autorange"]) {
          setRange(initial_range)
          Streamlit.setComponentValue(initial_range)
        }
      }}
      onSelected={(event) => {
        let new_range = {
          x0: event?.range?.x[0],
          x1: event?.range?.x[1],
        }

        if (range !== new_range && (new_range.x0 || new_range.x1)) {
          setRange(new_range)
          Streamlit.setComponentValue(new_range)
        }
      }}
    />
  )
}

class PlotlySelectableChart extends StreamlitComponentBase {
  public render = (): ReactNode => {
    const {
      width,
      height,
      figure_spec,
      figure_config,
      useContainerWidth,
      chart_theme,
    }: PlotlyChartProps = this.props.args

    let theme: any = this.props.theme

    if (theme?.base === "dark") {
      theme = emotionDarkTheme
    } else {
      theme = emotionLightTheme
    }

    return (
      <PlotlyFigure
        width={width}
        figure_spec={figure_spec}
        figure_config={figure_config}
        useContainerWidth={useContainerWidth}
        chart_theme={chart_theme}
        height={height}
        theme={theme}
      />
    )
  }
}

export default withTheme(withStreamlitConnection(PlotlySelectableChart))

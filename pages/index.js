// import { draw, setup } from 'utils/base'

import { draw, setup } from 'utils/cube'

import React from 'react'
import dynamic from 'next/dynamic'

const Sketch = dynamic(import('react-p5'), { ssr: false })

const StartPage = (props) => {
  return <Sketch setup={setup} draw={draw} />
}

export default StartPage

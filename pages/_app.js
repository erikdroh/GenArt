import App from 'next/app'

export default class extends App {
  render() {
    const { Component, pageProps, router } = this.props

    return (
      <>
        <Component {...pageProps} key={router.route} />
      </>
    )
  }
}

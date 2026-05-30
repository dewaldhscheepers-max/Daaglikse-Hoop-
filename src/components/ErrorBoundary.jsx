import { Component } from 'react'

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { error: null }
  }

  static getDerivedStateFromError(error) {
    return { error }
  }

  render() {
    if (this.state.error) {
      return (
        <div style={{ padding: '60px 24px', textAlign: 'center', fontFamily: 'system-ui' }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>😔</div>
          <h2 style={{ marginBottom: 8, color: '#2D2040', fontSize: 20 }}>Iets het skeefgeloop</h2>
          <p style={{ color: '#8A7E9A', marginBottom: 28, lineHeight: 1.6 }}>
            Maak asseblief die app toe en oop dit weer.
          </p>
          <button
            onClick={() => window.location.reload()}
            style={{ background: '#7C6FAF', color: '#fff', border: 'none', borderRadius: 24, padding: '12px 28px', fontSize: 15, cursor: 'pointer' }}
          >
            Herlaai app
          </button>
        </div>
      )
    }
    return this.props.children
  }
}

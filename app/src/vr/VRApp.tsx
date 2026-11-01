import { Link } from 'react-router-dom'
export default function VRApp() {
  return <div style={{ display: 'grid', placeItems: 'center', height: '100%', padding: 24, textAlign: 'center' }}><div><h1>EcoScape VR</h1><p>The VR premium version is being built — coming very soon.</p><p style={{ marginTop: 12 }}><Link to="/">Back to the mobile app</Link></p></div></div>
}

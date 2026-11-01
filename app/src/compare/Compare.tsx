import { Link } from 'react-router-dom'
export default function Compare() {
  return <div style={{ display: 'grid', placeItems: 'center', height: '100%', padding: 24, textAlign: 'center' }}><div><h1>Mobile vs VR</h1><p>Comparison page coming with the VR version.</p><p style={{ marginTop: 12 }}><Link to="/">Back to the mobile app</Link></p></div></div>
}
